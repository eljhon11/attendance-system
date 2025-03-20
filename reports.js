document.addEventListener('DOMContentLoaded', function() {
    loadSectionsForReport();
    setupReportForm();
});

// Load sections for the report dropdown
function loadSectionsForReport() {
    const user = getCurrentUser();
    const sectionSelectElement = document.getElementById('sectionSelect');
    
    if (!sectionSelectElement || !user || !user.sections) return;
    
    // Clear existing options except the first one
    while (sectionSelectElement.options.length > 1) {
        sectionSelectElement.remove(1);
    }
    
    // Add options for each section
    user.sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.id;
        option.textContent = section.name;
        sectionSelectElement.appendChild(option);
    });
}

// Setup report form
function setupReportForm() {
    const reportForm = document.getElementById('reportForm');
    if (!reportForm) return;
    
    reportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const sectionId = parseInt(document.getElementById('sectionSelect').value);
        const month = parseInt(document.getElementById('monthSelect').value);
        const year = parseInt(document.getElementById('yearSelect').value);
        
        if (!sectionId || !month || !year) {
            alert('Please select all required fields');
            return;
        }
        
        generateReport(sectionId, month, year);
    });
}

// Generate attendance report
function generateReport(sectionId, month, year) {
    const user = getCurrentUser();
    
    if (!user || !user.sections) return;
    
    const section = user.sections.find(s => s.id === sectionId);
    
    if (!section) {
        alert('Section not found');
        return;
    }
    
    // Get attendance records for the selected month and year
    const monthlyAttendance = section.attendance ? section.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() + 1 === month && recordDate.getFullYear() === year;
    }) : [];
    
    // Display report preview
    displayReportPreview(section, monthlyAttendance, month, year);
    
    // Enable download button if there are records
    const downloadBtn = document.getElementById('downloadReportBtn');
    if (downloadBtn) {
        downloadBtn.disabled = monthlyAttendance.length === 0;
        
        // Add event listener for download
        downloadBtn.onclick = function() {
            downloadReport(section, monthlyAttendance, month, year);
        };
    }
}

// Display report preview
function displayReportPreview(section, attendanceRecords, month, year) {
    const previewElement = document.getElementById('reportPreview');
    
    if (!previewElement) return;
    
    // Get month name
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[month - 1];
    
    if (attendanceRecords.length === 0) {
        previewElement.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-exclamation-circle display-1"></i>
                <p class="mt-3">No attendance records found for ${monthName} ${year}</p>
            </div>
        `;
        return;
    }
    
    // Calculate statistics
    const totalDays = attendanceRecords.length;
    const totalPresent = attendanceRecords.reduce((sum, record) => sum + record.present, 0);
    const totalAbsent = attendanceRecords.reduce((sum, record) => sum + record.absent, 0);
    const averageRate = Math.round((totalPresent / (totalPresent + totalAbsent)) * 100);
    
    // Create report HTML
    let reportHtml = `
        <div class="report-header mb-4">
            <h3>Attendance Report</h3>
            <h4>${section.name} - ${monthName} ${year}</h4>
            <p>Grade Level: ${section.gradeLevel} | Schedule: ${section.schedule}</p>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="card-title">Total Days</h5>
                        <p class="card-text display-5">${totalDays}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <h5 class="card-title">Total Present</h5>
                        <p class="card-text display-5">${totalPresent}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-danger text-white">
                    <div class="card-body text-center">
                        <h5 class="card-title">Total Absent</h5>
                        <p class="card-text display-5">${totalAbsent}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body text-center">
                        <h5 class="card-title">Average Rate</h5>
                        <p class="card-text display-5">${averageRate}%</p>
                    </div>
                </div>
            </div>
            <div class="table-responsive">
            <table class="table table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th>Date</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Attendance Rate</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Sort attendance records by date
    attendanceRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Add rows for each attendance record
    attendanceRecords.forEach(record => {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        });
        
        // Determine row color based on attendance rate
        const rate = parseInt(record.rate);
        let rowClass = '';
        if (rate >= 90) {
            rowClass = 'table-success';
        } else if (rate >= 75) {
            rowClass = 'table-warning';
        } else {
            rowClass = 'table-danger';
        }
        
        reportHtml += `
            <tr class="${rowClass}">
                <td>${formattedDate}</td>
                <td>${record.present}</td>
                <td>${record.absent}</td>
                <td>${record.rate}</td>
            </tr>
        `;
    });
    
    reportHtml += `
                </tbody>
            </table>
        </div>
        
        <div class="mt-4 text-muted">
            <p>Report generated on ${new Date().toLocaleDateString()} by ${getCurrentUser().name}</p>
        </div>
    `;
    
    previewElement.innerHTML = reportHtml;
}

// Download report as PDF
function downloadReport(section, attendanceRecords, month, year) {
    // Get month name
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[month - 1];
    
    // Create a new jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Attendance Report', 105, 15, { align: 'center' });
    
    // Add section info
    doc.setFontSize(14);
    doc.text(`${section.name} - ${monthName} ${year}`, 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Grade Level: ${section.gradeLevel} | Schedule: ${section.schedule}`, 105, 32, { align: 'center' });
    
    // Add statistics
    const totalDays = attendanceRecords.length;
    const totalPresent = attendanceRecords.reduce((sum, record) => sum + record.present, 0);
    const totalAbsent = attendanceRecords.reduce((sum, record) => sum + record.absent, 0);
    const averageRate = Math.round((totalPresent / (totalPresent + totalAbsent)) * 100);
    
    doc.setFontSize(12);
    doc.text('Summary Statistics:', 14, 45);
    
    doc.setFontSize(10);
    doc.text(`Total Days: ${totalDays}`, 14, 52);
    doc.text(`Total Present: ${totalPresent}`, 14, 58);
    doc.text(`Total Absent: ${totalAbsent}`, 14, 64);
    doc.text(`Average Attendance Rate: ${averageRate}%`, 14, 70);
    
    // Create attendance table
    const tableColumn = ["Date", "Present", "Absent", "Rate"];
    const tableRows = [];
    
    // Sort attendance records by date
    attendanceRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Add data for each attendance record
    attendanceRecords.forEach(record => {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const tableRow = [
            formattedDate,
            record.present,
            record.absent,
            record.rate
        ];
        tableRows.push(tableRow);
    });
    
    // Generate the table
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 80,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [67, 97, 238] }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Report generated on ${new Date().toLocaleDateString()} by ${getCurrentUser().name}`, 105, 290, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: 'right' });
    }
    
    // Save the PDF
    doc.save(`${section.name}_Attendance_${monthName}_${year}.pdf`);
}