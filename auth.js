// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    
    // If we're on the login page and user is logged in, redirect to dashboard
    if (window.location.pathname.includes('index.html') && user) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // If we're not on the login page and user is not logged in, redirect to login
    if (!window.location.pathname.includes('index.html') && !user) {
        window.location.href = 'index.html';
        return;
    }
}

// Initialize demo users if they don't exist
function initUsers() {
    if (!localStorage.getItem('users')) {
        const demoUsers = [
            {
                username: 'teacher1',
                password: 'password123',
                name: 'John Smith',
                sections: [
                    {
                        id: 1,
                        name: 'Science 101',
                        gradeLevel: '9',
                        schedule: 'MWF 9:00-10:30 AM',
                        students: 28,
                        attendance: [
                            {
                                date: '2023-10-01',
                                present: 25,
                                absent: 3,
                                rate: '89%'
                            },
                            {
                                date: '2023-10-03',
                                present: 26,
                                absent: 2,
                                rate: '93%'
                            },
                            {
                                date: '2023-10-05',
                                present: 28,
                                absent: 0,
                                rate: '100%'
                            }
                        ]
                    },
                    {
                        id: 2,
                        name: 'Biology 202',
                        gradeLevel: '10',
                        schedule: 'TTh 1:00-2:30 PM',
                        students: 32,
                        attendance: [
                            {
                                date: '2023-10-02',
                                present: 30,
                                absent: 2,
                                rate: '94%'
                            },
                            {
                                date: '2023-10-04',
                                present: 29,
                                absent: 3,
                                rate: '91%'
                            },
                            {
                                date: '2023-10-06',
                                present: 31,
                                absent: 1,
                                rate: '97%'
                            }
                        ]
                    }
                ]
            },
            {
                username: 'teacher2',
                password: 'password123',
                name: 'Jane Doe',
                sections: [
                    {
                        id: 3,
                        name: 'Math 101',
                        gradeLevel: '7',
                        schedule: 'MWF 8:00-9:30 AM',
                        students: 25,
                        attendance: [
                            {
                                date: '2023-10-01',
                                present: 23,
                                absent: 2,
                                rate: '92%'
                            },
                            {
                                date: '2023-10-03',
                                present: 24,
                                absent: 1,
                                rate: '96%'
                            },
                            {
                                date: '2023-10-05',
                                present: 22,
                                absent: 3,
                                rate: '88%'
                            }
                        ]
                    }
                ]
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(demoUsers));
    }
}

// Handle login form submission
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const users = JSON.parse(localStorage.getItem('users'));
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // Store current user (excluding password)
                const { password, ...userWithoutPassword } = user;
                localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid username or password');
            }
        });
    }
}

// Handle logout
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
}

// Get current user data
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// Update user data in storage
function updateUserData(userData) {
    // Update current user
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === userData.username);
    
    if (userIndex !== -1) {
        // Keep the password from the original user object
        const password = users[userIndex].password;
        users[userIndex] = { ...userData, password };
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initUsers();
    checkAuth();
    setupLoginForm();
    setupLogout();
    
    // Display teacher name if element exists
    const teacherNameElement = document.getElementById('teacherName');
    if (teacherNameElement) {
        const user = getCurrentUser();
        if (user) {
            teacherNameElement.textContent = user.name;
        }
    }
});