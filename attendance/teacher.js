// Teacher dashboard specific functionality

let selectedClass = '';
let students = [];
let attendanceData = {};
let currentSelectedDate = '';

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth().then(user => {
        loadUserData(user.uid);
    }).catch(error => {
        showToast(error.message, 'error');
    });
    
    // Get selected class from session storage or default
    selectedClass = sessionStorage.getItem('selectedClass') || '1';
    document.getElementById('selected-class').textContent = 'Grade ' + selectedClass;
    
    // Initialize date pickers
    setTimeout(initializeDatePickers, 300);
   
    
// Add event listener for date changes
    const dateInput = document.getElementById('attendance-date');
    // Enhanced date change handler
if (dateInput) {
    dateInput.addEventListener('change', function() {
        const newDate = this.value;
        if (newDate) {
            // Remove previous styling
            dateInput.classList.remove('date-has-attendance');
            
            // Remove existing badge if any
            const existingBadge = dateInput.parentNode.querySelector('.attendance-exists-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            checkAttendanceExists(selectedClass, newDate)
                .then(attendanceExists => {
                    if (attendanceExists) {
                        // Add visual indicator
                        dateInput.classList.add('date-has-attendance');
                        
                        // Add a badge
                        const badge = document.createElement('span');
                        badge.className = 'attendance-exists-badge';
                        badge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Attendance Exists';
                        dateInput.parentNode.appendChild(badge);
                        
                        showToast('Attendance already exists for this date. Be careful when saving.', 'warning');
                    }
                })
                .catch(error => {
                    console.error('Error checking attendance on date change:', error);
                });
        }
    });
}


    // Teacher dashboard functionality
    document.getElementById('all-present-btn').addEventListener('click', toggleAllPresent);
    document.getElementById('save-attendance-btn').addEventListener('click', saveAttendance);
    document.getElementById('add-student-btn').addEventListener('click', showAddStudentModal);
    document.getElementById('remove-student-btn').addEventListener('click', removeStudent);
    document.getElementById('save-student-btn').addEventListener('click', saveStudent);
    
    // Modal functionality
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', hideModals);
    });
    document.getElementById('confirm-cancel').addEventListener('click', hideModals);
    document.getElementById('confirm-ok').addEventListener('click', confirmAction);
});

function loadUserData(uid) {
    database.ref('users/' + uid).once('value')
        .then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                document.getElementById('teacher-name').textContent = userData.name;

                const teacherClasses = userData.classes || {};
                const classIds = Object.keys(teacherClasses);

                if (classIds.length === 0) {
                    showToast('You are not assigned to any class', 'error');
                    setTimeout(logoutUser, 2000);
                    return;
                }

                // Pick the first assigned class if none selected
                selectedClass = sessionStorage.getItem('selectedClass') || classIds[0];
                database.ref('classes/' + selectedClass + '/name').once('value').then(snap => {
                    document.getElementById('selected-class').textContent = snap.val();
                });

                // Load students + attendance
                loadStudents(selectedClass);
                loadTodaysAttendance(selectedClass);
            }
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}


function loadStudents(classId) {
    database.ref('classes/' + classId + '/students').once('value')
        .then(snapshot => {
            students = [];
            const studentsTable = document.getElementById('students-table').querySelector('tbody');
            studentsTable.innerHTML = '';
            
            if (!snapshot.exists()) {
                showToast('No students found for this class', 'info');
                return;
            }
            
            snapshot.forEach(childSnapshot => {
                const student = childSnapshot.val();
                student.id = childSnapshot.key;
                students.push(student);
            });
            
            // Sort by rollNumber
            students.sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
            
            students.forEach(student => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', student.id);
                row.innerHTML = `
                    <td>${student.rollNumber}</td>
                    <td>${student.name}</td>
                    <td>
                        <div class="attendance-options">
                            <div class="attendance-option present" data-status="present">Present</div>
                            <div class="attendance-option absent" data-status="absent">Absent</div>
                            <div class="attendance-option late" data-status="late">Late</div>
                        </div>
                    </td>
                    <td>
                        <input type="checkbox" class="student-checkbox">
                    </td>
                `;
                studentsTable.appendChild(row);
            });
            
            // Add event listeners to attendance options
            setTimeout(() => {
                document.querySelectorAll('.attendance-option').forEach(option => {
                    option.addEventListener('click', function() {
                        const row = this.closest('tr');
                        const studentId = row.getAttribute('data-id');
                        const status = this.getAttribute('data-status');
                        
                        // Update attendance data
                        attendanceData[studentId] = status;
                        
                        // Update UI
                        row.querySelectorAll('.attendance-option').forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        this.classList.add('selected');
                    });
                });
            }, 100);
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

function loadTodaysAttendance(classId) {
    const dateInput = document.getElementById('attendance-date');
    if (dateInput) {
        // Don’t force today — let teacher pick
        dateInput.value = '';
        dateInput.setAttribute('placeholder', 'Select Date');
    }

    // Listen when teacher selects a date
    $('#attendance-date').on('change', function () {
        const selectedDate = this.value;
        if (!selectedDate) return;

        database.ref(`attendance/${classId}/${selectedDate}`).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    attendanceData = data;

                    // Highlight saved attendance in UI
                    setTimeout(() => {
                        document.querySelectorAll('#students-table tbody tr').forEach(row => {
                            const studentId = row.getAttribute('data-id');
                            if (attendanceData[studentId]) {
                                const status = attendanceData[studentId];
                                const option = row.querySelector(
                                    `.attendance-option[data-status="${status}"]`
                                );
                                if (option) option.classList.add('selected');
                            }
                        });
                    }, 200);
                } else {
                    attendanceData = {};
                    clearAttendanceButtons();
                }
            })
            .catch(error => {
                showToast(error.message, 'error');
            });
    });
}

//Mark all present
let allPresentSelected = false;

function toggleAllPresent() {
    allPresentSelected = !allPresentSelected;
    
    document.querySelectorAll('#students-table tbody tr').forEach(row => {
        const studentId = row.getAttribute('data-id');
        
        if (allPresentSelected) {
            // Mark all as present
            attendanceData[studentId] = 'present';
            
            // Update UI
            row.querySelectorAll('.attendance-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            const presentOption = row.querySelector('.attendance-option[data-status="present"]');
            if (presentOption) {
                presentOption.classList.add('selected');
            }
        } else {
            // Clear all selections
            delete attendanceData[studentId];
            
            // Update UI
            row.querySelectorAll('.attendance-option').forEach(opt => {
                opt.classList.remove('selected');
            });
        }
    });
    
    // Update button text and style
    const button = document.getElementById('all-present-btn');
    if (allPresentSelected) {
        button.innerHTML = '<i class="fas fa-times-circle"></i> Deselect All';
        button.classList.remove('btn-success');
        button.classList.add('btn-secondary');
    } else {
        button.innerHTML = '<i class="fas fa-check-circle"></i> Mark All Present';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-success');
    }
}

// Add this function to check if attendance already exists
function checkAttendanceExists(classId, date) {
    return database.ref('attendance/' + classId + '/' + date).once('value')
        .then(snapshot => {
            return snapshot.exists() && Object.keys(snapshot.val()).length > 0;
        });
}


// Update the saveAttendance function
function saveAttendance() {
    const dateInput = document.getElementById('attendance-date');
    if (!dateInput) {
        showToast('Date input not found', 'error');
        return;
    }
    
    const date = dateInput.value;
    if (!date) {
        showToast('Please select a date', 'error');
        return;
    }
    
    currentSelectedDate = date;
    
    // Check if all students have attendance marked
    const allMarked = students.every(student => attendanceData[student.id]);
    if (!allMarked) {
        showToast('Please mark attendance for all students', 'error');
        return;
    }
    
    // Check if attendance already exists for this date
    checkAttendanceExists(selectedClass, date)
        .then(attendanceExists => {
            if (attendanceExists) {
                // Show confirmation modal for overwrite
                showOverwriteConfirmation();
            } else {
                // No existing attendance, proceed to save
                proceedWithSaving();
            }
        })
        .catch(error => {
            console.error('Error checking attendance:', error);
            proceedWithSaving(); // Proceed anyway if there's an error checking
        });
}
function clearAttendanceButtons() {
    // Clear all selected attendance buttons
    document.querySelectorAll('.attendance-option.selected').forEach(button => {
        button.classList.remove('selected');
    });
    
    // Clear the attendance data object
    attendanceData = {};
    
    // Reset the toggle button if it was active
    if (allPresentSelected) {
        allPresentSelected = false;
        const button = document.getElementById('all-present-btn');
        button.innerHTML = '<i class="fas fa-check-circle"></i> Mark All Present';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-success');
    }
}

// Add this function to show overwrite confirmation
function showOverwriteConfirmation() {
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationMessage = document.getElementById('confirmation-message');
    
    if (confirmationModal && confirmationMessage) {
        const formattedDate = formatNepaliDate(currentSelectedDate);
        confirmationMessage.innerHTML = `
            <strong>Attendance already exists for ${formattedDate}!</strong><br><br>
            Are you sure you want to overwrite the existing attendance records?
            <br><br>
            <span style="color: var(--warning); font-size: 14px;">
                <i class="fas fa-exclamation-triangle"></i> This action cannot be undone.
            </span>
        `;
        
        confirmationModal.style.display = 'flex';
        
        // Set confirm action for overwrite
        document.getElementById('confirm-ok').onclick = function() {
            hideModals();
            proceedWithSaving();
        };
        
        // Set cancel action
        document.getElementById('confirm-cancel').onclick = function() {
            hideModals();
            showToast('Attendance update cancelled', 'info');
        };
    }
}

// Add this function to actually save the attendance
/*
function proceedWithSaving() {
    // Save to database
    database.ref('attendance/' + selectedClass + '/' + currentSelectedDate).set(attendanceData)
        .then(() => {
            showToast('Attendance saved successfully!', 'success');
            
            // Clear the attendance buttons after saving
            clearAttendanceButtons();
        })
        .catch(error => {
            showToast('Error: ' + error.message, 'error');
        });
}
*/

function proceedWithSaving() {
    // Save to database
    database.ref('attendance/' + selectedClass + '/' + currentSelectedDate).set(attendanceData)
        .then(() => {
            showToast('Attendance saved successfully!', 'success');
            
            // Clear the attendance buttons after saving
            clearAttendanceButtons();

            // Reset date field so teacher must pick again
            const dateInput = document.getElementById('attendance-date');
            if (dateInput) {
                dateInput.value = '';
                dateInput.setAttribute('placeholder', 'Select Date');
            }

            // Optionally re-run loadTodaysAttendance to ensure fresh state
            loadTodaysAttendance(selectedClass);
        })
        .catch(error => {
            showToast('Error: ' + error.message, 'error');
        });
}


function showAddStudentModal() {
    const modal = document.getElementById('add-student-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.style.display = 'none';
    });
}

function saveStudent() {
    const nameInput = document.getElementById('student-name');
    const rollInput = document.getElementById('student-roll');
    
    if (!nameInput || !rollInput) {
        showToast('Student form fields not found', 'error');
        return;
    }
    
    const name = nameInput.value.trim();
    const rollNumber = rollInput.value.trim();
    
    if (!name || !rollNumber) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    // Check if roll number already exists
    const rollExists = students.some(student => student.rollNumber === rollNumber);
    if (rollExists) {
        showToast('Roll number already exists', 'error');
        return;
    }
    
    // Save to database
    const newStudent = {
        name: name,
        rollNumber: rollNumber
    };
    
    database.ref('classes/' + selectedClass + '/students').push(newStudent)
        .then(() => {
            showToast('Student added successfully!', 'success');
            hideModals();
            nameInput.value = '';
            rollInput.value = '';
            
            // Reload students
            loadStudents(selectedClass);
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

function removeStudent() {
    const selectedStudents = [];
    document.querySelectorAll('.student-checkbox:checked').forEach(checkbox => {
        const row = checkbox.closest('tr');
        const studentId = row.getAttribute('data-id');
        selectedStudents.push(studentId);
    });
    
    if (selectedStudents.length === 0) {
        showToast('Please select at least one student', 'error');
        return;
    }
    
    // Show confirmation modal
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationMessage = document.getElementById('confirmation-message');
    if (confirmationModal && confirmationMessage) {
        confirmationMessage.textContent = 
            `Are you sure you want to remove ${selectedStudents.length} student(s)?`;
        confirmationModal.style.display = 'flex';
        
        // Set confirm action
        document.getElementById('confirm-ok').onclick = function() {
            hideModals();
            
            // Remove from database
            selectedStudents.forEach(studentId => {
                database.ref('classes/' + selectedClass + '/students/' + studentId).remove();
            });
            
            showToast('Student(s) removed successfully!', 'success');
            
            // Reload students after a short delay
            setTimeout(() => {
                loadStudents(selectedClass);
            }, 1000);
        };
    }
}
 initializeDatePickers();
function confirmAction() {
    // This function is set dynamically based on the action
}