// Admin dashboard specific functionality
// ---------- Pagination globals (add near top of admin.js) ----------
let absentCurrentPage = 1;
let absentPageSize = 30; // change as you like
let attendanceCurrentPage = 1;
let attendancePageSize = 50; // change as you like
let attendanceRecords = [];
let classes = [];


document.addEventListener('DOMContentLoaded', function() {
        // Check authentication and admin role
    checkAuth().then(user => {
        checkAdminRole(user.uid);
    }).catch(error => {
        showToast(error.message, 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
       });

     // Initialize admin-specific date pickers
       setTimeout(initializeAdminDatePickers, 500);
   
    // Initialize date pickers
      setTimeout(initializeDatePickers, 300);
    
    // Tab functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Admin dashboard functionality
    document.getElementById('apply-filters-btn').addEventListener('click', applyFilters);
    document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
    document.getElementById('add-class-btn').addEventListener('click', addClass);
    document.getElementById('assign-teacher-btn').addEventListener('click', assignTeacherToClass);
    
document.getElementById('assign-teacher-form').addEventListener('submit', function(event) {
    event.preventDefault();
    assignTeacherToClass();
});
    
    // Don't load data here - wait for admin role confirmation
});

function checkAdminRole(uid) {
    database.ref('users/' + uid).once('value')
        .then(snapshot => {
            const userData = snapshot.val();
            if (userData && userData.role === 'admin') {
                document.getElementById('admin-name').textContent = userData.name;
                // Load data now that we confirmed admin role
                loadOverviewData();
                loadAttendanceLogs();
                loadClasses();
            } else {
                showToast('Access denied. Admin only.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        })
        .catch(error => {
            showToast(error.message, 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
}


function switchTab(tabId) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active'); 
    // Show active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    // Load data if needed
    if (tabId === 'overview') {
        loadOverviewData();
    } else if (tabId === 'attendance') {
        loadAttendanceLogs();
    } else if (tabId === 'classes') {
    loadClasses();
    populateClassDropdown(); // Add this
    populateTeacherDropdown(); // Add this
}
}

// --- paste/replace these in admin.js ---

// globals (add if not already present)
let classesData = {};
let attendanceCache = {};
let activeAttendanceListeners = {};
let classesRefListener = null;           // new: holds classes listener ref
let lastClassesNotMarkedKey = '';       // used to avoid repeated toasts


function loadOverviewData() {
    // produce padded date from common helper
    const paddedToday = getTodayNepaliDate(); // e.g. "२०८२-०६-०४"
    const [y, m, d] = paddedToday.split('-');

    // derive unpadded form by removing leading Nepali zero characters '०'
    const unpaddedToday = `${y}-${m.replace(/^०+/, '')}-${d.replace(/^०+/, '')}`; // e.g. "२०८२-६-४"

    // clear old attendance listeners
    detachOverviewListeners();

    // stop existing classes listener (if any)
    if (classesRefListener) {
        try { classesRefListener.off(); } catch (e) { /* ignore */ }
        classesRefListener = null;
    }

    // reset caches
    classesData = {};
    attendanceCache = {};
    lastClassesNotMarkedKey = '';

    // Listen to classes in realtime (so new classes / deletions are reflected)
    classesRefListener = database.ref('classes');
    classesRefListener.on('value', classesSnap => {
        classesData = classesSnap.val() || {};

        // Whenever classes change, remove old per-class attendance listeners and reattach
        detachOverviewListeners();

        Object.keys(classesData).forEach(classId => {
            const classObj = classesData[classId];

            // skip classes with no students
            if (!classObj || !classObj.students || Object.keys(classObj.students).length === 0) {
                // ensure cache entry is an empty object so recalc sees it
                attendanceCache[classId] = {};
                return;
            }

            // attach a class-level attendance listener so we can detect the correct date key
            const attendanceRef = database.ref(`attendance/${classId}`);
            activeAttendanceListeners[classId] = attendanceRef;

            attendanceRef.on('value', attSnap => {
                const allDates = attSnap.val() || {};

                // prefer padded key (because getTodayNepaliDate returns padded)
                let todayAttendance = allDates[paddedToday];

                // if padded not present, try unpadded (handles teachers saving without leading zeros)
                if (typeof todayAttendance === 'undefined') {
                    todayAttendance = allDates[unpaddedToday];
                }

                // safety: if still undefined, use empty object
                attendanceCache[classId] = todayAttendance || {};

                // Recompute overview whenever attendance for this class (or its dates) changes
                recalcOverview();
            });
        });

        // initial render (may be updated quickly by listeners)
        recalcOverview();
    }, error => {
        showToast('Error loading classes: ' + (error?.message || error), 'error');
    });
}


function detachOverviewListeners() {
    for (const cid in activeAttendanceListeners) {
        try {
            activeAttendanceListeners[cid].off();
        } catch (e) {
            console.warn('Failed to detach listener for', cid, e);
        }
    }
    activeAttendanceListeners = {};
    attendanceCache = {}; // clear cached attendance to avoid stale reads
}

/**
 * Optional utility to fully stop overview realtime work (if you want to remove classes listener too)
 */
function stopAllOverviewListeners() {
    detachOverviewListeners();
    if (classesRefListener) {
        try { classesRefListener.off(); } catch (e) { /* ignore */ }
        classesRefListener = null;
    }
    lastClassesNotMarkedKey = '';
}

/**
 * recalcOverview
 * - Calculates present / absent / not-marked correctly based on attendanceCache and classesData
 * - Shows absent-students table (includes both 'Absent' and 'Not Marked' rows)
 * - Updates the cards: total-students, present-today (actual present), absent-today (actual absent)
 * - Displays "Classes X, Y not marked..." toast only when that set changes
 */
function recalcOverview() {
    let totalStudents = 0;
    const absentStudents = [];
    const classesNotMarked = new Set();

    Object.keys(classesData).forEach(classId => {
        const classObj = classesData[classId];
        const classStudents = classObj.students;

        if (classStudents && Object.keys(classStudents).length > 0) {
            totalStudents += Object.keys(classStudents).length;
            const todayAttendance = attendanceCache[classId];

            if (todayAttendance && Object.keys(todayAttendance).length > 0) {
                // Attendance exists → check each student
                Object.keys(classStudents).forEach(studentId => {
                    const status = todayAttendance[studentId]; // "present" | "absent" | "late"

                    if (status === "absent") {
                        absentStudents.push({
                            class: classObj.name || `Grade ${classId}`,
                            name: classStudents[studentId].name,
                            roll: classStudents[studentId].rollNumber,
                            status: "Absent"
                        });
                    } else if (status === "late") {
                        absentStudents.push({
                            class: classObj.name || `Grade ${classId}`,
                            name: classStudents[studentId].name,
                            roll: classStudents[studentId].rollNumber,
                            status: "Late"
                        });
                    }
                    // status === "present" → skip
                    else if (status === undefined) {
                        absentStudents.push({
                            class: classObj.name || `Grade ${classId}`,
                            name: classStudents[studentId].name,
                            roll: classStudents[studentId].rollNumber,
                            status: "Not Marked"
                        });
                    }
                });
            } else {
                // No attendance data at all → not marked
                classesNotMarked.add(classId);
                Object.keys(classStudents).forEach(studentId => {
                    absentStudents.push({
                        class: classObj.name || `Grade ${classId}`,
                        name: classStudents[studentId].name,
                        roll: classStudents[studentId].rollNumber,
                        status: "Not Marked"
                    });
                });
            }
        }
    });

    const presentToday = Math.max(0, totalStudents - absentStudents.filter(s => s.status !== "Late").length);

    document.getElementById("total-students").textContent = totalStudents;
    document.getElementById("present-today").textContent = presentToday;
    document.getElementById("absent-today").textContent = absentStudents.filter(s => s.status === "Absent").length;

    absentCurrentPage = 1;
    renderAbsentStudentsTable(absentStudents, absentCurrentPage, absentPageSize);

    if (classesNotMarked.size > 0) {
        const classNames = [...classesNotMarked].map(
            id => classesData[id]?.name || `Grade ${id}`
        );
        // showToast(`Classes ${classNames.join(", ")} haven't marked attendance yet`, "warning");
    }
}

function initializeAdminDatePickers() {
    // Wait for jQuery and Nepali date picker to be loaded
    if (typeof $ === 'undefined' || typeof $.fn.nepaliDatePicker === 'undefined') {
        console.error("jQuery or Nepali date picker not loaded");
        setTimeout(initializeAdminDatePickers, 100);
        return;
    }

    const $filterDate = $('#filter-date');

    // Make sure it's empty and shows placeholder at the start
    $filterDate.attr('placeholder', 'Select Date').val('');

    // Lazy-init the Nepali date picker only once, when user interacts
    $filterDate.one('focus', function () {
        $filterDate.nepaliDatePicker({
            dateFormat: "%y-%m-%d",
            closeOnDateSelect: true,
            ndpYear: true,
            ndpMonth: true,
            ndpYearCount: 10,
            onChange: function () {
                // Optional: auto-apply filters when date is picked
                //applyAttendanceFilters();
            }
        });

        // Open the picker immediately after initialization
        setTimeout(() => $filterDate.trigger('click'), 0);
    });
}


// ---------- Helper: Render attendance logs page ----------
function renderAttendanceLogsPage(page = 1, pageSize = attendancePageSize) {
    const tbody = document.getElementById('attendance-logs-table').querySelector('tbody');
    tbody.innerHTML = '';

    if (!attendanceRecords || attendanceRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No records found</td></tr>';
        const p = document.getElementById('attendance-pagination');
        if (p) p.innerHTML = '';
        return;
    }

    const total = attendanceRecords.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.max(1, Math.min(page, totalPages));
    const start = (current - 1) * pageSize;
    const end = Math.min(total, start + pageSize);
    const pageItems = attendanceRecords.slice(start, end);

    pageItems.forEach(record => {
    const row = document.createElement('tr');

    let statusColor = '';
    if (record.status === 'present') statusColor = 'green';
    else if (record.status === 'late') statusColor = 'orange';
    else if (record.status === 'absent') statusColor = 'red';

    row.innerHTML = `
        <td>${record.date}</td>
        <td>${record.class}</td>
        <td>${record.student}</td>
        <td><span style="color:${statusColor}; font-weight:normal;">${record.status}</span></td>
    `;
    tbody.appendChild(row);
});


    // ensure pagination container exists under the table
    let pagContainer = document.getElementById('attendance-pagination');
    if (!pagContainer) {
        pagContainer = document.createElement('div');
        pagContainer.id = 'attendance-pagination';
        document.getElementById('attendance-logs-table').parentNode.appendChild(pagContainer);
    }

    createPaginationControls(pagContainer, total, pageSize, current, (p) => {
        attendanceCurrentPage = p;
        renderAttendanceLogsPage(p, pageSize);
    });
}



// ---------- Updated loadAttendanceLogs (replace existing loadAttendanceLogs / loadAttendanceData) ----------
function loadAttendanceLogs(selectedClass = 'all', selectedMonth = 'all', selectedDate = '', studentName = '') {
    const classFilter = document.getElementById('filter-class').value;
    const monthFilter = document.getElementById('filter-month').value;
    const dateFilter = document.getElementById('filter-date').value;
    
    const logsTable = document.getElementById('attendance-logs-table').querySelector('tbody');
    logsTable.innerHTML = '<tr><td colspan="4" class="text-center">Loading attendance data...</td></tr>';

    // Fetch classes once to get class names (cache)
    database.ref('classes').once('value')
        .then(classesSnap => {
            const classesData = classesSnap.exists() ? classesSnap.val() : {};

            return database.ref('attendance').once('value')
                .then(snapshot => {
                    attendanceRecords = [];

                    if (!snapshot.exists()) {
                        logsTable.innerHTML = '<tr><td colspan="4" class="text-center">No attendance records found</td></tr>';
                        const p = document.getElementById('attendance-pagination');
                        if (p) p.innerHTML = '';
                        return;
                    }

                    const attendanceData = snapshot.val();
                    const processPromises = [];

                    Object.keys(attendanceData).forEach(classId => {
                        const classData = attendanceData[classId];
                        if (!classData) return;

                        // Skip class if filter applied
                        if (classFilter !== 'all' && classFilter !== classId) return;

                        Object.keys(classData).forEach(date => {
                            // Date filter
                            if (dateFilter) {
                                const normalizedFilterDate = normalizeNepaliDate(dateFilter);
                                const normalizedCurrentDate = normalizeNepaliDate(date);
                                if (normalizedFilterDate !== normalizedCurrentDate) return;
                            }

                            // Month filter
                            if (monthFilter !== 'all') {
                                // convertToRomanNumbers is used elsewhere in your codebase — keep same logic
                                const normalizedCurrentDate = normalizeNepaliDate(date);
                                const dateMonth = parseInt(convertToRomanNumbers(normalizedCurrentDate).split('-')[1]);
                                if (parseInt(monthFilter) !== dateMonth) return;
                            }

                           Object.keys(classData[date]).forEach(studentId => {
    const p = database.ref(`classes/${classId}/students/${studentId}`).once('value')
        .then(studentSnapshot => {
            if (studentSnapshot.exists()) {
                const student = studentSnapshot.val();
                const className = (classesData[classId] && classesData[classId].name) ? classesData[classId].name : `Class ${classId}`;

                // ✅ Filter by student name
                if (studentName && !student.name.toLowerCase().includes(studentName.toLowerCase())) {
                    return;
                }

                attendanceRecords.push({
                    date: formatNepaliDate(date),
                    class: className,
                    student: student.name,
                    status: classData[date][studentId],
                    rawDate: date
                });
            }
        })
        .catch(err => console.error('Error loading student ' + studentId, err));
    processPromises.push(p);
});
                        });
                    });

                    if (processPromises.length === 0) {
                        logsTable.innerHTML = '<tr><td colspan="4" class="text-center">No records match your filters</td></tr>';
                        const p = document.getElementById('attendance-pagination');
                        if (p) p.innerHTML = '';
                        return;
                    }

                    // wait for all lookups
                    return Promise.all(processPromises).then(() => {
                        // optional: sort records by rawDate desc (newest first)
                        attendanceRecords.sort((a, b) => {
                            if (a.rawDate === b.rawDate) return 0;
                            return a.rawDate < b.rawDate ? 1 : -1;
                        });

                        // render first page
                        attendanceCurrentPage = 1;
                        renderAttendanceLogsPage(attendanceCurrentPage, attendancePageSize);
                    });
                });
        })
        .catch(error => {
            console.error('Attendance load error:', error);
            logsTable.innerHTML = '<tr><td colspan="4" class="text-center">Error loading attendance data</td></tr>';
            showToast('Error: ' + error.message, 'error');
        });
}


function loadClasses() {
    const classesTableBody = document.querySelector('#classes-table tbody');
    classesTableBody.innerHTML = '';

    database.ref('classes').once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                classesTableBody.innerHTML =
                    '<tr><td colspan="4" class="text-center">No classes found</td></tr>';
                return;
            }

            const classesData = snapshot.val();
            const classPromises = Object.keys(classesData).map(classId => {
                const classObj = classesData[classId];
                const numStudents = classObj.students ? Object.keys(classObj.students).length : 0;

                // ✅ Only consider regular teachers, skip optional ones
                if (classObj.teachers) {
                    const teacherIds = Object.keys(classObj.teachers);
                    const teacherPromises = teacherIds.map(tid =>
                        database.ref(`users/${tid}/name`).once('value').then(snap => snap.val())
                    );

                    return Promise.all(teacherPromises).then(teacherNames => ({
                        id: classId,
                        name: classObj.name || `Grade ${classId}`,
                        teachers: teacherNames.filter(Boolean).join(', '),
                        numStudents
                    }));
                } else {
                    return Promise.resolve({
                        id: classId,
                        name: classObj.name || `Grade ${classId}`,
                        teachers: 'Not Assigned',
                        numStudents
                    });
                }
            });

            Promise.all(classPromises).then(classList => {
                classesTableBody.innerHTML = '';

                classList.forEach(classData => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${classData.name}</td>
                        <td>${classData.teachers}</td>
                        <td>${classData.numStudents}</td>
                        <td>
                            <button class="btn btn-sm btn-secondary" onclick="editClass('${classData.id}')">Edit Class</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteClass('${classData.id}')">Delete Class</button>
                            <button class="btn btn-sm btn-secondary" onclick="editStudent('${classData.id}')">Edit Student</button>
                        </td>
                    `;
                    classesTableBody.appendChild(row);
                });

                // Reattach listeners
                document.querySelectorAll('.delete-class-btn').forEach(btn => {
                    btn.addEventListener('click', e => {
                        const classId = e.target.getAttribute('data-id');
                        confirmAction(
                            'Are you sure you want to delete this class?',
                            () => deleteClass(classId)
                        );
                    });
                });

                document.querySelectorAll('.edit-class-btn').forEach(btn => {
                    btn.addEventListener('click', e => {
                        const classId = e.target.getAttribute('data-id');
                        editClass(classId);
                    });
                });

                document.querySelectorAll('.edit-students-btn').forEach(btn => {
                    btn.addEventListener('click', e => {
                        const classId = e.target.getAttribute('data-id');
                        editStudents(classId);
                    });
                });
            });
        })
        .catch(error => {
            showToast('Error loading classes: ' + error.message, 'error');
        });
}




// Assign Teacher (regular or optional)
function assignTeacherToClass(event) {
    event.preventDefault(); // prevent form refresh

    const classId = document.getElementById('assign-class-select').value;
    const teacherId = document.getElementById('assign-teacher-select').value;
    const isOptional = document.getElementById('assign-as-optional').checked;

    if (!classId || !teacherId) {
        showToast('Please select both a class and a teacher', 'error');
        return;
    }

    // Choose node based on optional flag
    const teacherPath = isOptional
        ? `classes/${classId}/optTeacher/${teacherId}`
        : `classes/${classId}/teachers/${teacherId}`;

    database.ref(teacherPath).set(true)
        .then(() => {
            return database.ref(`users/${teacherId}/classes/${classId}`).set(true);
        })
        .then(() => {
            showToast(
                isOptional
                    ? 'Optional teacher assigned successfully!'
                    : 'Teacher assigned successfully!',
                'success'
            );
            document.getElementById('assign-teacher-form').reset();
            loadClasses(); // refresh class list table
        })
        .catch(error => {
            showToast('Error assigning teacher: ' + error.message, 'error');
        });
}

// Unassign Teacher (regular or optional)
function unassignTeacherFromClass() {
    const classId = document.getElementById('assign-class-select').value;
    const teacherId = document.getElementById('assign-teacher-select').value;
    const isOptional = document.getElementById('assign-as-optional').checked;

    if (!classId || !teacherId) {
        showToast('Please select both a class and a teacher', 'error');
        return;
    }

    // Choose node based on optional flag
    const teacherPath = isOptional
        ? `classes/${classId}/optTeacher/${teacherId}`
        : `classes/${classId}/teachers/${teacherId}`;

    // Remove teacher from class and teacher's classes list
    const updates = {};
    updates[teacherPath] = null;
    updates[`users/${teacherId}/classes/${classId}`] = null;

    database.ref().update(updates)
        .then(() => {
            showToast(
                isOptional
                    ? 'Optional teacher unassigned successfully!'
                    : 'Teacher unassigned successfully!',
                'success'
            );
            loadClasses(); // refresh class list table
        })
        .catch(error => {
            showToast('Error unassigning teacher: ' + error.message, 'error');
        });
}

// Attach event listeners
document.getElementById('assign-teacher-form').addEventListener('submit', assignTeacherToClass);
document.getElementById('unassign-teacher-btn').addEventListener('click', unassignTeacherFromClass);

//Assign Optional Teacher
function assignOptionalTeacherToClass(classId, teacherId) {
    database.ref(`classes/${classId}/optTeacher/${teacherId}`).set(true)
        .then(() => {
            return database.ref(`users/${teacherId}/classes/${classId}`).set(true);
        })
        .then(() => {
            showToast('Optional teacher assigned successfully!', 'success');
            loadClasses(); // refresh class list
        })
        .catch(error => {
            showToast('Error assigning optional teacher: ' + error.message, 'error');
        });
}


/* Populate dropdowns when Assign Teacher card loads
function populateClassDropdown() {
    const classSelect = document.getElementById('assign-class-select');
    classSelect.innerHTML = '<option value="">Select Class</option>';
    
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        classSelect.appendChild(option);
    });
}
*/

function populateClassDropdown() {
    const classSelect = document.getElementById('assign-class-select');
    classSelect.innerHTML = '<option value="">Select Class</option>';

    database.ref('classes').once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const classesData = snapshot.val();
                Object.keys(classesData).forEach(classId => {
                    const cls = classesData[classId];
                    if (!cls || !cls.name) return;

                    const option = document.createElement('option');
                    option.value = classId;
                    option.textContent = cls.name;
                    classSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            showToast('Error loading classes: ' + error.message, 'error');
        });
}



function populateTeacherDropdown() {
    const teacherSelect = document.getElementById('assign-teacher-select');
    teacherSelect.innerHTML = '<option value="">Select Teacher</option>';
    
    // load teachers from your database
    database.ref('users').once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                Object.keys(users).forEach(userId => {
                    if (users[userId].role === 'teacher') {
                        const option = document.createElement('option');
                        option.value = userId;
                        option.textContent = users[userId].name;
                        teacherSelect.appendChild(option);
                    }
                });
            }
        })
        .catch(error => {
            showToast('Error loading teachers: ' + error.message, 'error');
        });
}

let studentNamesCache = [];
function populateStudentSuggestions(classId) {
    const datalist = document.getElementById('student-suggestions');
    datalist.innerHTML = '';
    studentNamesCache = [];

    if (!classId || classId === 'all') return;

    database.ref(`classes/${classId}/students`).once('value').then(snapshot => {
        if (snapshot.exists()) {
            studentNamesCache = Object.values(snapshot.val()).map(s => s.name);
            console.log("Student cache updated:", studentNamesCache);
        }
    });
}

document.getElementById('filter-class').addEventListener('change', e => {
    populateStudentSuggestions(e.target.value);
});

const studentInput = document.getElementById('filter-student');
studentInput.addEventListener('input', () => {
    const datalist = document.getElementById('student-suggestions');
    datalist.innerHTML = '';

    const query = studentInput.value.trim().toLowerCase();

    if (query.length > 0) {
        studentNamesCache
            .filter(name => name.toLowerCase().includes(query))
            .forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                datalist.appendChild(option);
            });
    }
});
//new page for merging


function applyFilters() {
    const selectedClass = document.getElementById('filter-class').value;
    const selectedMonth = document.getElementById('filter-month').value;
    const selectedDate = document.getElementById('filter-date').value;
    const studentName = document.getElementById('filter-student').value.trim().toLowerCase();

    // Call modified loader
    loadAttendanceLogs(selectedClass, selectedMonth, selectedDate, studentName);

    // ✅ Reset filter fields after applying
    document.getElementById('filter-class').value = 'all';
    document.getElementById('filter-month').value = 'all';
    document.getElementById('filter-date').value = '';
    document.getElementById('filter-date').setAttribute('placeholder', 'Select Date');
    document.getElementById('filter-student').value = '';
}



// ---- CSV Export Fix ----
function exportToCSV() {
    if (!attendanceRecords || attendanceRecords.length === 0) {
        showToast("No data to export", "warning");
        return;
    }

    let csvContent = "Date,Class,Student,Status\n";

    attendanceRecords.forEach(record => {
        const date = toRomanDigits(record.rawDate || record.date);
        csvContent += `${date},${record.class},${record.student},${record.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "attendance.csv";
    link.click();
}


function exportTableToCSV(filename, tableId) {
    const csv = [];
    const rows = document.querySelectorAll(`#${tableId} tr`);

    for (let row of rows) {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        cols.forEach(col => {
            let text = col.innerText.replace(/,/g, " "); // avoid breaking CSV
            rowData.push(`"${text}"`);
        });
        csv.push(rowData.join(","));
    }

    // prepend BOM for proper UTF-8 recognition
    const csvString = "\uFEFF" + csv.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ===== Confirmation Modal =====
function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById("confirmation-modal");
    const msg = document.getElementById("confirmation-message");
    const okBtn = document.getElementById("confirm-ok");
    const cancelBtn = document.getElementById("confirm-cancel");

    msg.textContent = message;
    modal.style.display = "flex"; // show modal

    // Cleanup old listeners
    okBtn.onclick = cancelBtn.onclick = () => {
        modal.style.display = "none";
    };

    okBtn.onclick = () => {
        modal.style.display = "none";
        if (typeof onConfirm === "function") onConfirm();
    };
}

// ===== Prompt Modal =====
function showPromptModal(message, defaultValue, onConfirm) {
    const modal = document.getElementById("confirmation-modal");
    const msg = document.getElementById("confirmation-message");
    const okBtn = document.getElementById("confirm-ok");
    const cancelBtn = document.getElementById("confirm-cancel");

    // Replace content with an input field
    msg.innerHTML = `
        <label>${message}</label>
        <input type="text" id="prompt-input" value="${defaultValue || ""}" class="form-input mt-10" />
    `;

    modal.style.display = "flex"; // show modal

    okBtn.onclick = () => {
        const value = document.getElementById("prompt-input").value.trim();
        modal.style.display = "none";
        if (value && typeof onConfirm === "function") onConfirm(value);
    };

    cancelBtn.onclick = () => {
        modal.style.display = "none";
    };
}



// Add new class
function addClass() {
    const className = document.getElementById('new-class-name').value.trim();
    if (!className) {
        showToast('Please enter a class name', 'error');
        return;
    }

    database.ref('classes').once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const classes = snapshot.val();
                const duplicate = Object.values(classes).some(
                    cls => cls.name && cls.name.toLowerCase() === className.toLowerCase()
                );
                if (duplicate) {
                    showToast('Class name already exists!', 'error');
                    return;
                }
            }

            // Push new class under "classes"
            const newClassRef = database.ref('classes').push();
            const classId = newClassRef.key;

            return newClassRef.set({
                name: className,
                teacher: null,
                students: {}
            })
            .then(() => {
                showToast('Class added successfully!', 'success');
                document.getElementById('new-class-name').value = '';
                loadClasses();
            });
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}


// Edit existing class name
// ===== Replace Edit Class =====
function editClass(classId) {
    database.ref('classes/' + classId).once('value').then(snapshot => {
        if (!snapshot.exists()) return;
        const currentName = snapshot.val().name || "";

        showPromptModal("Enter new class name:", currentName, newName => {
            database.ref('classes/' + classId).update({ name: newName })
                .then(() => showToast("Class updated successfully", "success"))
                .catch(err => showToast("Error: " + err.message, "error"));
        });
    });
}

// ===== Replace Delete Class ===== ??
function deleteClass(classId) {
    showConfirmModal(
        "Are you sure you want to delete this class? This will also delete all students and attendance records for this class.",
        () => {
            database.ref('classes/' + classId).remove()
                .then(() => {
                    showToast("Class deleted successfully", "success");
                    loadClasses();
                })
                .catch(err => showToast("Error: " + err.message, "error"));
        }
    );
}

function closeConfirmationModal() {
    document.getElementById('confirmation-modal').style.display = 'none';
    classToDelete = null;

    const okBtn = document.getElementById('confirm-ok');
    okBtn.textContent = 'OK';
    okBtn.classList.remove('btn-danger');
    okBtn.classList.add('btn-primary');
    okBtn.onclick = null;
}

function populateAttendanceLogClassFilter() {
    const select = document.getElementById('filter-class');
    if (!select) return;

    // Keep the "All Classes" option
    select.innerHTML = '<option value="all">All Classes</option>';

    database.ref('classes').once('value').then(snapshot => {
        if (snapshot.exists()) {
            const classEntries = Object.entries(snapshot.val());

            // sort by grade number in the name
            classEntries.sort(([idA, dataA], [idB, dataB]) => {
                const numA = parseInt((dataA.name || '').replace(/[^0-9]/g, '')) || 0;
                const numB = parseInt((dataB.name || '').replace(/[^0-9]/g, '')) || 0;
                return numA - numB;
            });

            classEntries.forEach(([classId, classData]) => {
                const opt = document.createElement('option');
                opt.value = classId;              // push ID
                opt.textContent = classData.name; // e.g., "Class 1"
                select.appendChild(opt);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    populateAttendanceLogClassFilter();
});


function filterAttendanceLogs() {
    const selectedClassId = document.getElementById('filter-class').value;
    let filtered = attendanceRecords;

    if (selectedClassId && selectedClassId !== 'all') {
        filtered = attendanceRecords.filter(r => r.classId === selectedClassId);
    }

    renderAttendanceLogs(filtered);
}



function editStudent(classId) {
    database.ref(`classes/${classId}`).once('value').then(snapshot => {
        if (!snapshot.exists()) return;

        const classData = snapshot.val();
        let studentList = '';

        if (classData.students) {
            Object.entries(classData.students).forEach(([sid, sdata]) => {
                studentList += `
                    <div class="student-edit" data-student-id="${sid}">
                        <input type="text" class="student-name" value="${sdata.name}" />
                        <input type="text" class="student-roll" value="${sdata.rollNumber}" />
                    </div>`;
            });
        } else {
            studentList = '<p>No students yet.</p>';
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-card">
                <h5>Edit Students - ${classData.name}</h5>
                <div class="student-list">${studentList}</div>
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-sm btn-primary" onclick="saveStudents('${classId}', this)">Save</button>
                    <button class="btn btn-sm btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    });
}

function saveStudents(classId, btn) {
    const modal = btn.closest('.modal-card');
    const studentEdits = modal.querySelectorAll('.student-edit');

    const updates = {};
    studentEdits.forEach(editDiv => {
        const sid = editDiv.getAttribute('data-student-id');
        const name = editDiv.querySelector('.student-name').value.trim();
        const roll = editDiv.querySelector('.student-roll').value.trim();

        updates[`classes/${classId}/students/${sid}/name`] = name;
        updates[`classes/${classId}/students/${sid}/rollNumber`] = roll;
    });

    database.ref().update(updates)
        .then(() => {
            showToast('Students updated successfully!', 'success');
            modal.parentNode.remove(); // close modal
        })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}


/*
function updateStudent(classId, studentId, field, value) {
    database.ref(`classes/${classId}/students/${studentId}/${field}`).set(value)
        .then(() => showToast('Student updated!', 'success'))
        .catch(err => showToast('Error: ' + err.message, 'error'));
}
*/

// ---------- Helper: Create pagination controls ----------
function createPaginationControls(container, totalItems, pageSize, currentPage, onPageClick) {
    container.innerHTML = '';
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const nav = document.createElement('div');
    nav.className = 'pagination';

    const prev = document.createElement('button');
    prev.className = 'btn btn-sm';
    prev.textContent = 'Prev';
    prev.disabled = currentPage <= 1;
    prev.addEventListener('click', () => onPageClick(Math.max(1, currentPage - 1)));
    nav.appendChild(prev);

    // Page numbers (show up to 7 numbers, centered on current)
    const maxButtons = 7;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start < maxButtons - 1) {
        start = Math.max(1, end - maxButtons + 1);
    }

    for (let p = start; p <= end; p++) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm' + (p === currentPage ? ' active' : '');
        btn.textContent = p;
        btn.addEventListener('click', () => onPageClick(p));
        nav.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'btn btn-sm';
    next.textContent = 'Next';
    next.disabled = currentPage >= totalPages;
    next.addEventListener('click', () => onPageClick(Math.min(totalPages, currentPage + 1)));
    nav.appendChild(next);

    container.appendChild(nav);
}

// ---------- Helper: Render Absent Students Table with pagination ----------
function renderAbsentStudentsTable(absentStudents, page = 1, pageSize = absentPageSize) {
    const tbody = document.getElementById('absent-table').querySelector('tbody');
    tbody.innerHTML = '';

    if (!absentStudents || absentStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No absent students today!</td></tr>';
    } else {
        const total = absentStudents.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const current = Math.max(1, Math.min(page, totalPages));

        const start = (current - 1) * pageSize;
        const end = Math.min(total, start + pageSize);
        const pageItems = absentStudents.slice(start, end);

        pageItems.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.class}</td>
                <td>${student.name}</td>
                <td>${student.roll}</td>
                <td>${student.status === 'not marked' ? '<span class="text-warning">(Not Marked)</span>' : student.status}</td>
            `;
            tbody.appendChild(row);
        });

        // ensure pagination container exists under the table
        let pagContainer = document.getElementById('absent-pagination');
        if (!pagContainer) {
            pagContainer = document.createElement('div');
            pagContainer.id = 'absent-pagination';
            document.getElementById('absent-table').parentNode.appendChild(pagContainer);
        }
        createPaginationControls(pagContainer, total, pageSize, current, (p) => {
            absentCurrentPage = p;
            renderAbsentStudentsTable(absentStudents, p, pageSize);
        });
    }
}
