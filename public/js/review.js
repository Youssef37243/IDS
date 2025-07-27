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
  .then(([meetings, minutes, users]) => {
    allMeetings = meetings;
    allMinutes = minutes;
    allUsers = users;
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

  // Create a map of meetings with their minutes
  const meetingsMap = new Map();
  allMeetings.forEach(meeting => {
    const minutes = allMinutes.find(m => m.meeting_id === meeting.id);
    meetingsMap.set(meeting.id, {
      meeting,
      minutes
    });
  });

  if (meetingsMap.size === 0) {
    tbl.innerHTML = '<tr><td colspan="4" class="text-center">No meetings with minutes found</td></tr>';
    return;
  }

  // Convert to array and sort by date (newest first)
  const sortedMeetings = Array.from(meetingsMap.values()).sort((a, b) => {
    return new Date(b.meeting.start_time) - new Date(a.meeting.start_time);
  });

  sortedMeetings.forEach(({meeting, minutes}) => {
    const actionCount = minutes?.action_items?.length || 0;
    
    const row = document.createElement('tr');
    row.dataset.id = meeting.id;
    row.innerHTML = `
      <td>${meeting.title}</td>
      <td>${formatMeetingDate(meeting.start_time)}</td>
      <td>${actionCount} action item${actionCount !== 1 ? 's' : ''}</td>
      <td>
        <div class="action-buttons">
          ${minutes ? `
            <button class="btn btn-primary view-minutes" data-id="${meeting.id}">
              <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-warning edit-minutes" data-id="${meeting.id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger delete-minutes" data-id="${meeting.id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          ` : `
            <button class="btn btn-success create-minutes" data-id="${meeting.id}">
              <i class="fas fa-plus"></i> Create Minutes
            </button>
          `}
        </div>
      </td>
    `;
    tbl.appendChild(row);
  });

  // Add event listeners to all buttons
  document.querySelectorAll('.view-minutes').forEach(btn => {
    btn.addEventListener('click', () => showMinutesDetails(btn.dataset.id));
  });

  document.querySelectorAll('.edit-minutes').forEach(btn => {
    btn.addEventListener('click', () => {
      const meetingId = btn.dataset.id;
      const meeting = allMeetings.find(m => m.id == meetingId);
      const attendees = meeting.attendees?.map(a => a.user_id || a) || [];
      window.location.href = `/minutes?meeting=${meetingId}&attendees=${attendees.join(',')}`;
    });
  });

  document.querySelectorAll('.create-minutes').forEach(btn => {
    btn.addEventListener('click', () => {
      const meetingId = btn.dataset.id;
      const meeting = allMeetings.find(m => m.id == meetingId);
      const attendees = meeting.attendees?.map(a => a.user_id || a) || [];
      window.location.href = `/minutes?meeting=${meetingId}&attendees=${attendees.join(',')}`;
    });
  });

  document.querySelectorAll('.delete-minutes').forEach(btn => {
    btn.addEventListener('click', () => confirmDeleteMinutes(btn.dataset.id));
  });
}

// Update showMinutesDetails to show richer information
function showMinutesDetails(meetingId) {
  const meeting = allMeetings.find(m => m.id == meetingId);
  if (!meeting) {
    showToast('Meeting not found!', 'error');
    return;
  }

  const minute = allMinutes.find(m => m.meeting_id == meetingId);
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
    minute.discussion_points.forEach((point, index) => {
      const pointDiv = document.createElement('div');
      pointDiv.className = 'discussion-point';
      pointDiv.innerHTML = `
        <h4>${index + 1}. ${point.topic || 'Untitled discussion'}</h4>
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
        <td>${item.due_date || 'Not set'}</td>
        <td><span class="status-badge ${item.status}">${formatStatus(item.status)}</span></td>
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
        <span class="file-size">(${formatFileSize(file.size)})</span>
      `;
      attachmentsDiv.appendChild(fileDiv);
    });
  } else {
    attachmentsDiv.innerHTML = '<p><em>No attachments</em></p>';
  }
}

function formatStatus(status) {
  if (!status) return 'Pending';
  return status.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
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