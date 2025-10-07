// Login page specific functionality

let loginAttempts = 0;
let selectedClass = '';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            // Redirect based on role
            checkUserRole(user.uid);
        }
    });
    
    // Login functionality
    document.getElementById('login-btn').addEventListener('click', loginUser);
    document.getElementById('reset-password').addEventListener('click', resetPassword);
});

function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    selectedClass = document.getElementById('class-select').value;
    
    if (!email || !password || !selectedClass) {
        showMessage('Please fill all fields', 'error');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            loginAttempts = 0;
            document.getElementById('forgot-password-link').classList.add('hidden');
            checkUserRole(userCredential.user.uid);
        })
        .catch(error => {
            loginAttempts++;
            if (loginAttempts >= 3) {
                document.getElementById('forgot-password-link').classList.remove('hidden');
            }
            showMessage(error.message, 'error');
        });
}

function resetPassword(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    if (!email) {
        showMessage('Please enter your email first', 'error');
        return;
    }
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            showMessage('Password reset email sent!', 'success');
        })
        .catch(error => {
            showMessage(error.message, 'error');
        });
}

function checkUserRole(uid) {
    database.ref('users/' + uid).once('value')
        .then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                if (userData.role === 'teacher') {
                    // Convert classes object → array of push IDs
                    const teacherClasses = userData.classes ? Object.keys(userData.classes) : [];

                    if (!teacherClasses.includes(selectedClass)) {
                        showMessage('You are not assigned to this class', 'error');
                        auth.signOut();
                        return;
                    }

                    sessionStorage.setItem('selectedClass', selectedClass);
                }

                // Redirect based on role
                if (userData.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'teacher.html';
                }
            } else {
                showMessage('User data not found', 'error');
                auth.signOut();
            }
        })
        .catch(error => {
            showMessage(error.message, 'error');
        });
}


function showMessage(message, type) {
    const messageEl = document.getElementById('login-message');
    messageEl.textContent = message;
    messageEl.style.color = type === 'error' ? 'var(--danger)' : 'var(--success)';
    
    setTimeout(() => {
        messageEl.textContent = '';
    }, 3000);
}