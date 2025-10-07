// common.js - Shared functionality across all pages

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC8jOQ4oKY31T2Hb3ber3hmLCTCXd5HCDc",
    authDomain: "pes-digital-attendance.firebaseapp.com",
    databaseURL: "https://pes-digital-attendance-default-rtdb.firebaseio.com",
    projectId: "pes-digital-attendance",
    storageBucket: "pes-digital-attendance.firebasestorage.app",
    messagingSenderId: "1027751960142",
    appId: "1:1027751960142:web:c36667c9451e7073082d1f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Global variables
let currentUser = null;

// Utility functions
function showToast(message, type = "info") {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.className = "toast", 3000);
}
    
    /* Set color by type
    if (type === 'success') {
        toast.style.backgroundColor = 'var(--success)';
    } else if (type === 'error') {
        toast.style.backgroundColor = 'var(--danger)';
    } else if (type === 'warning') {
        toast.style.backgroundColor = 'var(--warning)';
    } else {
        toast.style.backgroundColor = '#333';
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);

*/

// Also update getTodayNepaliDate to return Nepali numbers
function getTodayNepaliDate() {
    try {
        const today = new Date();
        const bsDate = calendarFunctions.getBsDateByAdDate(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate()
        );
        
        // Convert to Nepali numbers
        const year = calendarFunctions.getNepaliNumber(bsDate.bsYear);
        const month = calendarFunctions.getNepaliNumber(bsDate.bsMonth).padStart(2, '०');
        const day = calendarFunctions.getNepaliNumber(bsDate.bsDate).padStart(2, '०');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Error getting Nepali date:", error);
        return "२०८१-०१-०१"; // Fallback in Nepali numbers
    }
}

// ---- Helper to convert Nepali digits to Roman ----
function toRomanDigits(str) {
    if (!str) return '';
    return str.replace(/[०-९]/g, d => {
        return "०१२३४५६७८९".indexOf(d);
    });
}

function normalizeNepaliDate(dateString) {
    if (!dateString) return '';
    
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    // Ensure 2-digit month and day with leading zeros
    const year = parts[0];
    const month = parts[1].length === 1 ? '०' + parts[1] : parts[1];
    const day = parts[2].length === 1 ? '०' + parts[2] : parts[2];
    
    return `${year}-${month}-${day}`;
}

function initializeDatePickers() {
    // Wait for DOM to be fully ready and Nepali date picker to be loaded
    if (typeof $ === 'undefined' || typeof calendarFunctions === 'undefined') {
        console.error("jQuery or Nepali date picker not loaded");
        return;
    }
    
    // Initialize any date pickers on the page
    const dateInputs = document.querySelectorAll('.date-input');
    dateInputs.forEach(input => {
        try {
            // First, convert any existing Roman numerals to Nepali
            if (input.value) {
                // Convert Roman numbers to Nepali if needed
                input.value = convertToNepaliNumbers(input.value);
            } else {
                // Set today's date in Nepali numbers if empty
                input.value = getTodayNepaliDate();
            }
            
            // Initialize the date picker
            $(input).nepaliDatePicker({
                npdMonth: true,
                npdYear: true,
                npdYearCount: 10,
                dateFormat: "%y-%m-%d"
            });
            
        } catch (error) {
            console.error("Error initializing date picker:", error);
        }
    });
}

// Add this function to common.js
function convertToRomanNumbers(nepaliString) {
    if (!nepaliString) return '';
    
    const romanNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const nepaliNumbers = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    
    return nepaliString.replace(/[०-९]/g, function(match) {
        const index = nepaliNumbers.indexOf(match);
        return index !== -1 ? romanNumbers[index] : match;
    });
}

//Add this new helper function to convert numbers
function convertToNepaliNumbers(dateString) {
    const nepaliNumbers = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    
    return dateString.replace(/\d/g, function(match) {
        return nepaliNumbers[parseInt(match)];
    });
}

function formatNepaliDate(dateString) {
    try {
        // Handle both formats: Nepali numbers (२०८१-०१-०१) and Roman numbers (2081-01-01)
        let year, month, day;
        
        if (dateString.match(/[०-९]/)) {
            // Already in Nepali numbers - parse them
            const parts = dateString.split('-');
            year = calendarFunctions.getNumberByNepaliNumber(parts[0]);
            month = calendarFunctions.getNumberByNepaliNumber(parts[1]);
            day = calendarFunctions.getNumberByNepaliNumber(parts[2]);
        } else {
            // Roman numbers - parse normally
            const parts = dateString.split('-');
            year = parseInt(parts[0]);
            month = parseInt(parts[1]);
            day = parseInt(parts[2]);
        }
        
        // Add validation to prevent infinite recursion
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            console.error('Invalid date components:', year, month, day);
            return dateString;
        }
        
        return calendarFunctions.bsDateFormat("%M %d, %y", year, month, day);
    } catch (error) {
        console.error("Error formatting Nepali date:", error, "Input:", dateString);
        return dateString;
    }
}

function redirectToLogin() {
    window.location.href = 'index.html';
}

function checkAuth() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                resolve(user);
            } else {
                reject(new Error('Not authenticated'));
                redirectToLogin();
            }
        });
    });
}

function logoutUser() {
    auth.signOut()
        .then(() => {
            currentUser = null;
            redirectToLogin();
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

// Load classes from database for login page
// Load classes from database for login page
function populateClassSelect() {
    const select = document.getElementById('class-select');
    select.innerHTML = '<option value="">-- Select Class --</option>';

    database.ref('classes').once('value').then(snapshot => {
        if (snapshot.exists()) {
            const classEntries = Object.entries(snapshot.val());

            // ✅ Sort by number in the class name
            classEntries.sort(([idA, dataA], [idB, dataB]) => {
                const numA = parseInt((dataA.name || '').replace(/[^0-9]/g, '')) || 0;
                const numB = parseInt((dataB.name || '').replace(/[^0-9]/g, '')) || 0;
                return numA - numB;
            });

            classEntries.forEach(([classId, classData]) => {
                const opt = document.createElement('option');
                opt.value = classId;              // push ID
                opt.textContent = classData.name; // label shown to user
                select.appendChild(opt);
            });
        }
    });
}

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add logout event listeners if logout buttons exist
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', logoutUser);
    });
    
    // Load classes for login page if on login page
    if (document.getElementById('class-select')) {
        populateClassSelect();
    }
    
   // Initialize date pickers after a short delay to ensure everything is loaded
setTimeout(() => {
    if (document.querySelector('.date-input')) {
        initializeDatePickers();
    }
}, 100);
});