document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements
    const loginBtn = document.getElementById('login-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const classSelect = document.getElementById('class-select');
    const viewStarsBtn = document.getElementById('view-stars-btn');
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');

    // Track failed attempts
    let failedAttempts = 0;
    const MAX_ATTEMPTS = 3;

    // Initialize dropdown
    classSelect.innerHTML = '<option value="">-- Select a Class --</option>';

    // Load classes
    loadPublicClasses();

    // Auth state listener
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadAllClasses(user.uid);
        } else {
            loadPublicClasses();
        }
    });

    // Login handler
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const selectedClass = classSelect.value;
        
        if (!selectedClass) {
            //loginError.textContent = 'Please select a class first';
            //loginError.classList.remove('hidden');
            showToast('Please select a class first', 'error');
            return;
        }

        try {
            const userCredential = await firebaseHelpers.login(emailInput.value, passwordInput.value);
            failedAttempts = 0;
            forgotPasswordBtn.classList.add('hidden');
            
            const role = await firebaseHelpers.getUserRole(userCredential.user.uid);
            window.location.href = role === 'principal' 
                ? 'principal.html' 
                : `edit.html?class=${selectedClass}`;
                
        } catch (error) {
            failedAttempts++;
            //loginError.textContent = error.message;
            //loginError.classList.remove('hidden');
            showToast('Either email or password is incorrect', 'error');
            if (failedAttempts >= MAX_ATTEMPTS) {
                forgotPasswordBtn.classList.remove('hidden');
            }
        }
    });

    // Forgot password handler
    forgotPasswordBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        if (!email) {
            showToast('Please enter your email first', 'error');
            return;
        }
        
        try {
            await firebaseHelpers.sendPasswordResetEmail(email);
            showToast('Password reset email sent. Check your inbox.', 'success');
            forgotPasswordBtn.classList.add('hidden');
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // View stars handler
    viewStarsBtn.addEventListener('click', () => {
        const selectedClass = classSelect.value;
        if (selectedClass) {
            window.location.href = `star.html?class=${selectedClass}`;
        } else {
            //alert('Please select a class first');
            showToast('Please select a class first', 'error');
        }
    });

    // Helper functions
    async function loadPublicClasses() {
        try {
            const [publicSnapshot, classesSnapshot] = await Promise.all([
                database.ref('publicClasses').once('value'),
                database.ref('classes').once('value')
            ]);

            updateClassDropdown(
                publicSnapshot.val() || {},
                classesSnapshot.val() || {}
            );
        } catch (error) {
            console.error("Error loading classes:", error);
            classSelect.innerHTML = '<option value="">Error loading classes</option>';
        }
    }

    async function loadAllClasses(uid) {
        try {
            const [publicSnapshot, classesSnapshot, teacherSnapshot] = await Promise.all([
                database.ref('publicClasses').once('value'),
                database.ref('classes').once('value'),
                database.ref(`teachers/${uid}/classes`).once('value')
            ]);

            updateClassDropdown(
                publicSnapshot.val() || {},
                classesSnapshot.val() || {},
                teacherSnapshot.val() || {}
            );
        } catch (error) {
            console.error("Error loading classes:", error);
        }
    }

    function updateClassDropdown(publicClasses, allClasses, teacherClasses = {}) {
        // Keep the default "-- Select a Class --" option
        while (classSelect.options.length > 1) {
            classSelect.remove(1);
        }
        
        Object.entries(allClasses).forEach(([classId, classData]) => {
            if (publicClasses[classId] || (teacherClasses && teacherClasses[classId])) {
                const option = document.createElement('option');
                option.value = classId;
                option.textContent = classData.name || `Class ${classId.replace('class', '')}`;
                classSelect.appendChild(option);
            }
        });
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

});
