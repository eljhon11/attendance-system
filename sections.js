document.addEventListener('DOMContentLoaded', function() {
    loadSections();
    setupAddSectionForm();
});

// Load sections
function loadSections() {
    const user = getCurrentUser();
    const sectionsListElement = document.getElementById('sectionsList');
    
    if (!sectionsListElement || !user) return;
    
    // Clear existing content
    sectionsListElement.innerHTML = '';
    
    if (!user.sections || user.sections.length === 0) {
        sectionsListElement.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">
                    <i class="bi bi-grid-3x3-gap display-1"></i>
                    <p class="mt-3">No sections found. Add your first section to get started.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Create cards for each section
    user.sections.forEach(section => {
        const sectionCard = document.createElement('div');
        sectionCard.className = 'col-md-4 mb-4';
        
        // Calculate attendance rate
        let averageRate = 0;
        if (section.attendance && section.attendance.length > 0) {
            const totalRate = section.attendance.reduce((sum, record) => {
                return sum + parseInt(record.rate);
            }, 0);
            averageRate = Math.round(totalRate / section.attendance.length);
        }
        
        sectionCard.innerHTML = `
            <div class="card section-card h-100">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${section.name}</h5>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-light" type="button" id="dropdownMenuButton${section.id}" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton${section.id}">
                            <li><a class="dropdown-item edit-section" href="#" data-section-id="${section.id}">
                                <i class="bi bi-pencil me-2"></i> Edit
                            </a></li>
                            <li><a class="dropdown-item take-attendance" href="#" data-section-id="${section.id}">
                                <i class="bi bi-clipboard-check me-2"></i> Take Attendance
                            </a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger delete-section" href="#" data-section-id="${section.id}">
                                <i class="bi bi-trash me-2"></i> Delete
                            </a></li>
                        </ul>
                    </div>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <span class="badge bg-secondary">Grade ${section.gradeLevel}</span>
                        <span class="badge bg-info text-dark">${section.schedule}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-3">
                        <div>
                            <small class="text-muted">Students</small>
                            <h5>${section.students}</h5>
                        </div>
                        <div>
                            <small class="text-muted">Attendance Rate</small>
                            <h5>${averageRate}%</h5>
                        </div>
                    </div>
                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar bg-success" role="progressbar" style="width: ${averageRate}%" 
                            aria-valuenow="${averageRate}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                <div class="card-footer bg-light">
                    <small class="text-muted">
                        ${section.attendance ? section.attendance.length : 0} attendance records
                    </small>
                </div>
            </div>
        `;
        
        sectionsListElement.appendChild(sectionCard);
    });
    
    // Add event listeners to action buttons
    setupSectionActionListeners();
}

// Setup event listeners for section actions
function setupSectionActionListeners() {
    // Edit section
    document.querySelectorAll('.edit-section').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = parseInt(this.getAttribute('data-section-id'));
            editSection(sectionId);
        });
    });
    
    // Take attendance
    document.querySelectorAll('.take-attendance').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = parseInt(this.getAttribute('data-section-id'));
            takeAttendance(sectionId);
        });
    });
    
    // Delete section
    document.querySelectorAll('.delete-section').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = parseInt(this.getAttribute('data-section-id'));
            deleteSection(sectionId);
        });
    });
}

// Setup add section form
function setupAddSectionForm() {
    const saveButton = document.getElementById('saveSection');
    if (!saveButton) return;
    
    saveButton.addEventListener('click', function() {
        const sectionName = document.getElementById('sectionName').value;
        const gradeLevel = document.getElementById('gradeLevel').value;
        const schedule = document.getElementById('schedule').value;
        
        if (!sectionName || !gradeLevel || !schedule) {
            alert('Please fill in all fields');
            return;
        }
        
        addNewSection(sectionName, gradeLevel, schedule);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSectionModal'));
        modal.hide();
    });
}

// Add new section
function addNewSection(name, gradeLevel, schedule) {
    const user = getCurrentUser();
    
    if (!user) return;
    
    if (!user.sections) {
        user.sections = [];
    }
    
    // Generate a new ID
    const newId = user.sections.length > 0 
        ? Math.max(...user.sections.map(s => s.id)) + 1 
        : 1;
    
    // Create a new section with random number of students (20-35)
    const newSection = {
        id: newId,
        name: name,
        gradeLevel: gradeLevel,
        schedule: schedule,
        students: Math.floor(Math.random() * 16) + 20, // Random number between 20-35
        attendance: []
    };
    
    // Add to user's sections
    user.sections.push(newSection);
    
    // Update storage
    updateUserData(user);
    
    // Reload sections
    loadSections();
    
    // Reset form
    document.getElementById('sectionName').value = '';
    document.getElementById('gradeLevel').value = '';
    document.getElementById('schedule').value = '';
    
    // Show success message
    alert(`Section "${name}" has been added successfully!`);
}

// Edit section
function editSection(sectionId) {
    const user = getCurrentUser();
    
    if (!user || !user.sections) return;
    
    const section = user.sections.find(s => s.id === sectionId);
    
    if (!section) {
        alert('Section not found');
        return;
    }
    
    // In a real app, you would open a modal with form fields pre-filled with section data
    // For this demo, we'll use prompt dialogs
    
    const newName = prompt('Enter new section name:', section.name);
    if (!newName) return;
    
    const newGradeLevel = prompt('Enter new grade level:', section.gradeLevel);
    if (!newGradeLevel) return;
    
    const newSchedule = prompt('Enter new schedule:', section.schedule);
    if (!newSchedule) return;
    
    // Update section
    section.name = newName;
    section.gradeLevel = newGradeLevel;
    section.schedule = newSchedule;
    
    // Update storage
    updateUserData(user);
    
    // Reload sections
    loadSections();
    
    // Show success message
    alert(`Section "${newName}" has been updated successfully!`);
}

// Take attendance
function takeAttendance(sectionId) {
    const user = getCurrentUser();
    
    if (!user || !user.sections) return;
    
    const section = user.sections.find(s => s.id === sectionId);
    
    if (!section) {
        alert('Section not found');
        return;
    }
    
    // In a real app, you would open a form to mark attendance for each student
    // For this demo, we'll simulate it with random values
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if attendance already taken for today
    if (section.attendance && section.attendance.some(a => a.date === today)) {
        alert('Attendance for today has already been recorded');
        return;
    }
    
    // Generate random attendance data
    const present = Math.floor(Math.random() * (section.students + 1));
    const absent = section.students - present;
    const rate = Math.round((present / section.students) * 100);
    
    // Create attendance record
    const attendanceRecord = {
        date: today,
        present: present,
        absent: absent,
        rate: `${rate}%`
    };
    
    // Add to section's attendance
    if (!section.attendance) {
        section.attendance = [];
    }
    
    section.attendance.push(attendanceRecord);
    
    // Update storage
    updateUserData(user);
    
    // Reload sections
    loadSections();
    
    // Show success message
    alert(`Attendance recorded for ${section.name}: ${present} present, ${absent} absent (${rate}%)`);
}

// Delete section
function deleteSection(sectionId) {
    if (!confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
        return;
    }
    
    const user = getCurrentUser();
    
    if (!user || !user.sections) return;
    
    // Find section index
    const sectionIndex = user.sections.findIndex(s => s.id === sectionId);
    
    if (sectionIndex === -1) {
        alert('Section not found');
        return;
    }
    
    // Get section name for confirmation message
    const sectionName = user.sections[sectionIndex].name;
    
    // Remove section
    user.sections.splice(sectionIndex, 1);
    
    // Update storage
    updateUserData(user);
    
    // Reload sections
    loadSections();
    
    // Show success message
    alert(`Section "${sectionName}" has been deleted successfully!`);
}