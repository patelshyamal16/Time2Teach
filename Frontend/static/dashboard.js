function openModal() {
    document.getElementById('formModal').style.display = 'block';
}
function closeModal() {
    document.getElementById('formModal').style.display = 'none';
}
// Close modal when clicking outside modal content
window.onclick = function(event) {
    const modal = document.getElementById('formModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Listen for form submission inside iframe and close modal + reload dashboard
const iframe = document.querySelector('#formModal iframe');
iframe.onload = function() {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const form = iframeDoc.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(form);
            fetch(form.action, {
                method: form.method,
                body: formData
            }).then(response => {
                if (response.ok) {
                    closeModal();
                    // Reload the dashboard to show new member
                    window.location.reload();
                } else {
                    alert('Failed to submit form.');
                }
            }).catch(() => {
                alert('Failed to submit form.');
            });
        });
    }
};

// Add click event listener to member-box divs to open modal with user info
document.querySelectorAll('.member-box').forEach(box => {
    box.addEventListener('click', () => {
        const userId = box.getAttribute('data-user-id');
        const iframe = document.querySelector('#formModal iframe');
        iframe.src = `/user_info?user_id=${userId}`;
        // Add modal-member class and remove modal-add class
        const modalContent = document.querySelector('#formModal .modal-content');
        modalContent.classList.add('modal-member');
        modalContent.classList.remove('modal-add');
        openModal();
    });
});

// Add click event listener to add-box div to open modal with add member form
const addBox = document.querySelector('.add-box');
if (addBox) {
    addBox.addEventListener('click', () => {
        const iframe = document.querySelector('#formModal iframe');
        iframe.src = '/add_member';
        // Add modal-add class and remove modal-member class
        const modalContent = document.querySelector('#formModal .modal-content');
        modalContent.classList.add('modal-add');
        modalContent.classList.remove('modal-member');
        openModal();
    });
}

// Listen for postMessage from iframe to open course modal or handle course submission
window.addEventListener('message', (event) => {
    if (event.data.action === 'openCourseModal' && event.data.userId) {
        const courseModal = document.getElementById('courseModal');
        if (!courseModal) {
            // Create course modal if it doesn't exist
            const modalDiv = document.createElement('div');
            modalDiv.id = 'courseModal';
            modalDiv.className = 'modal';
            modalDiv.innerHTML = `
                <div class="modal-content modal-course">
                    <span class="close-btn" id="courseModalClose">&times;</span>
                    <iframe src="/add_course?user_id=${event.data.userId}" class="modal-iframe"></iframe>
                </div>
            `;
            document.body.appendChild(modalDiv);
            modalDiv.style.display = 'block';

            document.getElementById('courseModalClose').addEventListener('click', () => {
                modalDiv.style.display = 'none';
            });

            // Close modal when clicking outside modal content
            modalDiv.addEventListener('click', (e) => {
                if (e.target === modalDiv) {
                    modalDiv.style.display = 'none';
                }
            });
        } else {
            // Update iframe src if modal exists
            const iframe = courseModal.querySelector('iframe');
            iframe.src = `/add_course?user_id=${event.data.userId}`;
            courseModal.style.display = 'block';
        }
    } else if (event.data.action === 'courseSubmitted' && event.data.userId) {
        // Close course modal only
        const courseModal = document.getElementById('courseModal');
        if (courseModal) {
            courseModal.style.display = 'none';
        }
        // Refresh user_info modal iframe
        const formModal = document.getElementById('formModal');
        if (formModal) {
            const iframe = formModal.querySelector('iframe');
            iframe.src = `/user_info?user_id=${event.data.userId}&_ts=${new Date().getTime()}`;
            formModal.style.display = 'block';
        }
    } else if (event.data.action === 'openUserEditModal' && event.data.userId) {
        const userEditModal = document.getElementById('userEditModal');
        if (!userEditModal) {
            // Create user_edit modal if it doesn't exist
            const modalDiv = document.createElement('div');
            modalDiv.id = 'userEditModal';
            modalDiv.className = 'modal';
            modalDiv.innerHTML = `
                <div class="modal-content modal-course">
                    <span class="close-btn" id="userEditModalClose">&times;</span>
                    <iframe src="/edit_user?user_id=${event.data.userId}" class="modal-iframe"></iframe>
                </div>
            `;
            document.body.appendChild(modalDiv);
            modalDiv.style.display = 'block';

            document.getElementById('userEditModalClose').addEventListener('click', () => {
                modalDiv.style.display = 'none';
            });

            // Close modal when clicking outside modal content
            modalDiv.addEventListener('click', (e) => {
                if (e.target === modalDiv) {
                    modalDiv.style.display = 'none';
                }
            });
        } else {
            // Update iframe src if modal exists
            const iframe = userEditModal.querySelector('iframe');
            iframe.src = `/edit_user?user_id=${event.data.userId}`;
            userEditModal.style.display = 'block';
        }
    } else if (event.data.action === 'userEditSubmitted' && event.data.userId) {
        // Close user_edit modal only
        const userEditModal = document.getElementById('userEditModal');
        if (userEditModal) {
            userEditModal.style.display = 'none';
        }
        // Refresh user_info modal iframe
        const formModal = document.getElementById('formModal');
        if (formModal) {
            const iframe = formModal.querySelector('iframe');
            iframe.src = `/user_info?user_id=${event.data.userId}&_ts=${new Date().getTime()}`;
            formModal.style.display = 'block';
        }
    }   else if (event.data.action === 'closeUserInfoModal') {
        closeModal();
        window.location.reload();
    }
});

// Calendar rendering and navigation
const calendarBody = document.getElementById('calendar-body');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentDate = new Date();

function renderCalendar(date) {
    calendarBody.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();

    monthYear.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    let row = document.createElement('tr');
    let dayCount = 0;

    // Fill initial empty cells
    for (let i = 0; i < startDay; i++) {
        const cell = document.createElement('td');
        row.appendChild(cell);
        dayCount++;
    }

    for (let day = 1; day <= totalDays; day++) {
        if (dayCount === 7) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
            dayCount = 0;
        }
        const cell = document.createElement('td');
        cell.textContent = day;

        // Highlight today
        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add('calendar-today');
        } else {
            cell.classList.remove('calendar-today');
        }

        row.appendChild(cell);
        dayCount++;
    }

    // Fill remaining empty cells
    while (dayCount > 0 && dayCount < 7) {
        const cell = document.createElement('td');
        row.appendChild(cell);
        dayCount++;
    }
    calendarBody.appendChild(row);
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

renderCalendar(currentDate);

// New event listener for generateReportBtn to send POST request and download Excel file
const generateReportBtn = document.getElementById('generateReportBtn');
if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
        fetch('/generate_report', {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || 'Failed to generate report');
                });
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Teaching Percentage.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            alert('Failed to generate report: ' + error.message);
        });
    });
}

// Fetch and render pending updates in update container
function fetchPendingUpdates() {
    fetch('/pending_updates')
        .then(response => response.json())
        .then(data => {
            const updatesList = document.getElementById('updates-list');
            updatesList.innerHTML = '';
            if (data.length === 0) {
                updatesList.innerHTML = '<p>No pending updates.</p>';
                return;
            }
            data.forEach(update => {
                const updateDiv = document.createElement('div');
                updateDiv.classList.add('update-item');
                let contentHtml = `<p><strong>${update.user_name}</strong> (${update.created_at})</p>`;

                // Determine if this is a course update or APPE update
                const isCourseUpdate = update.enroll !== null || update.coordinator !== null || update.clinical_lead !== null || update.lecture_faculty !== null || update.lab_design !== null || update.lab_proctor !== null;
                const isAppeUpdate = update.clinical_appe !== null || update.academic_appe !== null;

                if (isCourseUpdate) {
                    contentHtml += `
                        <p>Course: ${update.course_info || 'N/A'}</p>
                        <p>Enroll: ${update.enroll || 'N/A'}</p>
                        <p>Coordinator: ${update.coordinator || 'N/A'}</p>
                        <p>Clinical Lead: ${update.clinical_lead || 'N/A'}</p>
                        <p>Lecture Faculty: ${update.lecture_faculty !== null ? update.lecture_faculty : 'N/A'}</p>
                        <p>Lab Design: ${update.lab_design !== null ? update.lab_design : 'N/A'}</p>
                        <p>Lab Proctor: ${update.lab_proctor !== null ? update.lab_proctor : 'N/A'}</p>
                    `;
                }

                if (isAppeUpdate) {
                    contentHtml = `<p><strong>${update.user_name}</strong> (${update.created_at})</p>
                        <p>Clinical APPE: ${update.clinical_appe !== null ? update.clinical_appe : 'N/A'}</p>
                        <p>Academic APPE: ${update.academic_appe !== null ? update.academic_appe : 'N/A'}</p>
                    `;
                }

                contentHtml += `
                    <button class="approve-btn" data-id="${update.id}">Approve</button>
                    <button class="reject-btn" data-id="${update.id}">Reject</button>
                    <hr/>
                `;

                updateDiv.innerHTML = contentHtml;
                updatesList.appendChild(updateDiv);
            });

            // Add event listeners for approve/reject buttons
            document.querySelectorAll('.approve-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const updateId = button.getAttribute('data-id');
                    updateRequestAction(updateId, 'approve');
                });
            });
            document.querySelectorAll('.reject-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const updateId = button.getAttribute('data-id');
                    updateRequestAction(updateId, 'reject');
                });
            });
        })
        .catch(error => {
            console.error('Error fetching pending updates:', error);
        });
}

// Function to send approve/reject action to backend
function updateRequestAction(updateId, action) {
    fetch(`/update_request/${updateId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchPendingUpdates(); // Refresh the list

        // Refresh user_info modal iframe if open and showing the user related to this update
        const formModal = document.getElementById('formModal');
        if (formModal && formModal.style.display === 'block') {
            const iframe = formModal.querySelector('iframe');
            if (iframe) {
                // Extract user_id from iframe src
                const urlParams = new URLSearchParams(new URL(iframe.src).search);
                const userIdInIframe = urlParams.get('user_id');
                // If userIdInIframe matches the user_id from the update request, reload iframe
                if (userIdInIframe && data.user_id && userIdInIframe === data.user_id.toString()) {
                    iframe.src = `/user_info?user_id=${userIdInIframe}&_ts=${new Date().getTime()}`;
                }
            }
        }
    })
    .catch(error => {
        alert('Failed to update request: ' + error.message);
    });
}

// Initial fetch of pending updates
fetchPendingUpdates();
