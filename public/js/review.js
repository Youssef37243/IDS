document.addEventListener('DOMContentLoaded', initReview);

let allMeetings = [];
let allMinutes = [];
let allUsers = [];

function initReview() {
  // Hide details initially
  document.getElementById('minutes-detail').style.display = 'none';

  // Load all data
  Promise.all([
    fetch('/api/meetings', { headers: getAuthHeaders() }).then(r => r.json()),
    fetch('/api/minutes', { headers: getAuthHeaders() }).then(r => r.json()),
    fetch('/api/users', { headers: getAuthHeaders() }).then(r => r.json())
  ])
  .then(([meetings, minutesData, usersData]) => {
    allMeetings = meetings;
    allMinutes = minutesData;
    allUsers = usersData.data || usersData;
    renderMeetingsTable();
  })
  .catch(err => {
    console.error('Error loading data:', err);
    showToast('Failed to load meeting data', 'error');
  });

  // Setup event listeners
  document.getElementById('search-minutes')?.addEventListener('input', filterMeetings);
  document.getElementById('filter-date')?.addEventListener('change', filterMeetings);
  document.getElementById('export-pdf')?.addEventListener('click', exportMinutes);
}

function renderMeetingsTable() {
  const tbl = document.getElementById('past-meetings');
  tbl.innerHTML = '';

  // Filter meetings that have minutes or can have minutes created
  const meetingsWithMinutes = allMeetings.filter(meeting => {
    const hasMinutes = allMinutes.some(m => m.meeting_id == meeting.id);
    const isPast = new Date(meeting.end_time) < new Date();
    return hasMinutes || isPast;
  });

  if (meetingsWithMinutes.length === 0) {
    tbl.innerHTML = '<tr><td colspan="4" class="text-center">No past meetings with minutes found</td></tr>';
    return;
  }

  meetingsWithMinutes.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  
  meetingsWithMinutes.forEach(meeting => {
    const minute = allMinutes.find(m => m.meeting_id == meeting.id);
    const actionCount = minute?.action_items?.length || 0;
    
    const row = document.createElement('tr');
    row.dataset.id = meeting.id;
    row.innerHTML = `
      <td>${meeting.title}</td>
      <td>${formatMeetingDate(meeting.start_time)}</td>
      <td>${actionCount} action item${actionCount !== 1 ? 's' : ''}</td>
      <td>
        <div class="action-buttons">
          ${minute ? `<button class="btn btn-primary view-minutes" data-id="${meeting.id}"><i class="fas fa-eye"></i> View</button>` : ''}
          <button class="btn btn-warning edit-minutes" data-id="${meeting.id}">
            <i class="fas fa-edit"></i> ${minute ? 'Edit' : 'Create'}
          </button>
          ${minute ? `<button class="btn btn-danger delete-minutes" data-id="${meeting.id}"><i class="fas fa-trash"></i> Delete</button>` : ''}
        </div>
      </td>
    `;
    tbl.appendChild(row);
  });

  // Add event listeners to buttons
  document.querySelectorAll('.view-minutes').forEach(btn => {
    btn.addEventListener('click', () => showMinutesDetails(btn.dataset.id));
  });

  document.querySelectorAll('.edit-minutes').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = `/minutes?meeting=${btn.dataset.id}`;
    });
  });

  document.querySelectorAll('.delete-minutes').forEach(btn => {
    btn.addEventListener('click', () => confirmDeleteMinutes(btn.dataset.id));
  });
}

function showMinutesDetails(meetingId) {
  const meeting = allMeetings.find(m => m.id == meetingId);
  if (!meeting) {
    showToast('Meeting not found!', 'error');
    return;
  }

  fetch(`/api/minutes?meeting_id=${meetingId}`, { headers: getAuthHeaders() })
    .then(res => res.json())
    .then(minutes => {
      const minute = Array.isArray(minutes) ? minutes[0] : minutes;
      if (!minute) {
        showToast('No minutes found for this meeting!', 'error');
        return;
      }

      const detail = document.getElementById('minutes-detail');
      detail.style.display = 'block';
      detail.dataset.meetingId = meetingId;
      detail.scrollIntoView({ behavior: 'smooth' });

      // Populate details
      document.getElementById('detail-title').textContent = meeting.title;
      document.getElementById('detail-date').textContent = formatMeetingDateTime(meeting.start_time);

      // Format attendees
      const attendeeNames = minute.attendees.map(attendeeId => {
        const user = allUsers.find(u => u.id == attendeeId);
        return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
      }).join(', ');
      document.getElementById('detail-attendees').textContent = attendeeNames;

      // Format agenda
      document.getElementById('detail-agenda').innerHTML = 
        minute.agenda?.replace(/\n/g, '<br>') || '<em>No agenda</em>';

      // Format discussion points
      const discussionDiv = document.getElementById('detail-discussion');
      discussionDiv.innerHTML = '';
      if (minute.discussion_points?.length) {
        minute.discussion_points.forEach(point => {
          const pointDiv = document.createElement('div');
          pointDiv.className = 'discussion-point';
          pointDiv.innerHTML = `
            <h4>${point.topic || 'Untitled discussion'}</h4>
            <p>${point.details || 'No details provided'}</p>
          `;
          discussionDiv.appendChild(pointDiv);
        });
      } else {
        discussionDiv.innerHTML = '<p><em>No discussion points</em></p>';
      }

      // Format action items
      const actionsTable = document.getElementById('detail-actions');
      actionsTable.innerHTML = '';
      if (minute.action_items?.length) {
        minute.action_items.forEach(item => {
          const assignee = allUsers.find(u => u.id == item.assignee_id);
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${item.action}</td>
            <td>${assignee ? `${assignee.first_name} ${assignee.last_name}` : 'Unassigned'}</td>
            <td>${item.due_date}</td>
            <td><span class="status-badge ${item.status}">${item.status}</span></td>
          `;
          actionsTable.appendChild(tr);
        });
      } else {
        actionsTable.innerHTML = '<tr><td colspan="4"><em>No action items</em></td></tr>';
      }

      // Format notes
      document.getElementById('detail-notes').innerHTML = 
        minute.notes?.replace(/\n/g, '<br>') || '<em>No additional notes</em>';

      // Format attachments
      const attachmentsDiv = document.getElementById('detail-attachments');
      attachmentsDiv.innerHTML = '';
      if (minute.attachments?.length) {
        minute.attachments.forEach(file => {
          const fileDiv = document.createElement('div');
          fileDiv.className = 'attachment';
          fileDiv.innerHTML = `
            <i class="fas ${getFileIcon(file.name)}"></i> ${file.name}
            <a href="#" class="download-attachment" data-file="${file.name}">
              <i class="fas fa-download"></i> Download
            </a>
          `;
          attachmentsDiv.appendChild(fileDiv);
        });
      } else {
        attachmentsDiv.innerHTML = '<p><em>No attachments</em></p>';
      }
    })
    .catch(err => {
      console.error('Error loading minute details:', err);
      showToast('Failed to load minute details', 'error');
    });
}

function confirmDeleteMinutes(meetingId) {
  showModal({
    title: 'Confirm Deletion',
    message: 'Are you sure you want to delete these minutes? This action cannot be undone.',
    onConfirm: () => deleteMinutes(meetingId),
    showCancel: true,
    confirmText: 'Delete',
    cancelText: 'Cancel'
  });
}

function deleteMinutes(meetingId) {
  fetch(`/api/minutes/${meetingId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) throw new Error('Failed to delete');
    return response.json();
  })
  .then(() => {
    showToast('Minutes deleted successfully', 'success');
    // Refresh the data
    initReview();
    // Hide the details view
    document.getElementById('minutes-detail').style.display = 'none';
  })
  .catch(err => {
    console.error('Error deleting minutes:', err);
    showToast('Failed to delete minutes', 'error');
  });
}

function exportMinutes() {
  const meetingId = document.getElementById('minutes-detail').dataset.meetingId;
  if (!meetingId) {
    showToast('No meeting selected for export', 'error');
    return;
  }

  const meeting = allMeetings.find(m => m.id == meetingId);
  if (!meeting) {
    showToast('Meeting not found for export', 'error');
    return;
  }

  // In a real app, you would generate a PDF here
  // For demo purposes, we'll just show a message
  showToast(`Preparing PDF export for ${meeting.title}...`, 'info');
  
  // Simulate PDF generation delay
  setTimeout(() => {
    showToast(`Minutes for "${meeting.title}" exported as PDF`, 'success');
  }, 1500);
}

function filterMeetings() {
  const searchTerm = document.getElementById('search-minutes')?.value.toLowerCase() || '';
  const filterDate = document.getElementById('filter-date')?.value;

  document.querySelectorAll('#past-meetings tr').forEach(row => {
    if (row.cells.length < 4) return; // Skip header/empty rows

    const title = row.cells[0]?.textContent.toLowerCase();
    const dateText = row.cells[1]?.textContent;
    const actionsText = row.cells[2]?.textContent.toLowerCase();
    const meetingId = row.dataset.id;

    // Find the full meeting data
    const meeting = allMeetings.find(m => m.id == meetingId);
    const minute = allMinutes.find(m => m.meeting_id == meetingId);

    // Check search term against various fields
    const matchesSearch = !searchTerm || 
      title.includes(searchTerm) ||
      (meeting.description && meeting.description.toLowerCase().includes(searchTerm)) ||
      (minute?.agenda && minute.agenda.toLowerCase().includes(searchTerm)) ||
      (minute?.notes && minute.notes.toLowerCase().includes(searchTerm));

    // Check date filter
    let matchesDate = true;
    if (filterDate) {
      const meetingDate = new Date(meeting.start_time);
      const filterDateObj = new Date(filterDate);
      matchesDate = 
        meetingDate.getFullYear() === filterDateObj.getFullYear() && 
        meetingDate.getMonth() === filterDateObj.getMonth();
    }

    row.style.display = matchesSearch && matchesDate ? '' : 'none';
  });
}

// Utility functions
function formatMeetingDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatMeetingDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getFileIcon(filename) {
  if (!filename) return 'fa-file';
  const extension = filename.split('.').pop().toLowerCase();
  switch (extension) {
    case 'pdf': return 'fa-file-pdf';
    case 'doc': case 'docx': return 'fa-file-word';
    case 'xls': case 'xlsx': return 'fa-file-excel';
    case 'ppt': case 'pptx': return 'fa-file-powerpoint';
    case 'jpg': case 'jpeg': case 'png': case 'gif': return 'fa-file-image';
    default: return 'fa-file';
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}