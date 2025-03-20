document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
});

// Load dashboard data
function loadDashboardData() {
    const user = getCurrentUser();
    
    if (!user) return;
    
    // Update dashboard stats
    updateDashboardStats(user);
    
    // Load recent attendance data
    loadRecentAttendance(user);
}

// Update dashboard statistics
function updateDashboardStats(user) {
    const totalSectionsElement = document.getElementById('totalSections');
    const totalStudentsElement = document.getElementById('totalStudents');
    const attendanceRateElement = document.getElementById('attendanceRate');
    
    if (!user.sections) {
        user.sections = [];
    }
    
    // Calculate total sections
    const totalSections = user.sections.length;
    totalSectionsElement.textContent = totalSections;
    
    // Calculate total students
    const totalStudents = user.sections.reduce((sum, section) => sum + section.students, 0);
    totalStudentsElement.textContent = totalStudents;
    
    // Calculate average attendance rate
    let totalAttendanceRate = 0;
    let attendanceCount = 0;
    
    user.sections.forEach(section => {
        if (section.attendance && section.attendance.length > 0) {
            section.attendance.forEach(record => {
                totalAttendanceRate += parseInt(record.rate);
                attendanceCount++;
            });
        }
    });
    
    const averageRate = attendanceCount > 0 ? Math.round(totalAttendanceRate / attendanceCount) : 0;
    attendanceRateElement.textContent = `${averageRate}%`;
}

// Load recent attendance data
function loadRecentAttendance(user) {
    const recentAttendanceElement = document.getElementById('recentAttendance');
    
    if (!recentAttendanceElement) return;
    
    // Clear existing content
    recentAttendanceElement.innerHTML = '';
    
    // Collect all attendance records from all sections
    let allAttendance = [];
    
    user.sections.forEach(section => {
        if (section.attendance && section.attendance.length > 0) {
            section.attendance.forEach(record => {
                allAttendance.push({
                    sectionId: section.id,
                    sectionName: section.name,
                    ...record
                });
            });
        }
    });
    
    // Sort by date (most recent first)
    allAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Take only the 10 most recent records
    const recentAttendance = allAttendance.slice(0, 10);
    
    if (recentAttendance.length === 0) {
        recentAttendanceElement.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No attendance records found</td>
            </tr>
        `;
        return;
    }
    
    // Create table rows for each record
    recentAttendance.forEach(record => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        row.innerHTML = `
            <td>${record.sectionName}</td>
            <td>${formattedDate}</td>
            <td>${record.present}</td>
            <td>${record.absent}</td>
            <td>${record.rate}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-attendance" data-section-id="${record.sectionId}" data-date="${record.date}">
                    <i class="bi bi-eye"></i> View
                </button>
            </td>
        `;
        
        recentAttendanceElement.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-attendance').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section-id');
            const date = this.getAttribute('data-date');
            
            // Redirect to detailed view (this would be implemented in a real app)
            alert(`Viewing attendance for section ID ${sectionId} on ${date}`);
        });
    });
}