/**
 * REVIEW PAGE - COMPLETE WORKING VERSION
 */
function initReview() {
  // Load meetings and minutes
  const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const minutes = JSON.parse(localStorage.getItem('minutes')) || [];
  const $meetingsList = $('#past-meetings');
  
  $meetingsList.empty();

  if (meetings.length === 0) {
    $meetingsList.append('<tr><td colspan="5" class="text-center">No past meetings found</td></tr>');
    return;
  }

  // Sort meetings by date (newest first)
  meetings.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Populate meetings table
  meetings.forEach(meeting => {
    const meetingMinutes = minutes.find(m => m.meetingId == meeting.id);
    const hasMinutes = !!meetingMinutes;
    const actionCount = hasMinutes ? (meetingMinutes.actionItems?.length || 0) : 0;
    // Add data attributes for attendees, agenda, notes
    const attendees = (meeting.attendees || []).map(id => id).join(', ');
    const agenda = meetingMinutes?.agenda || '';
    const notes = meetingMinutes?.notes || '';
    $meetingsList.append(`
      <tr data-id="${meeting.id}" data-attendees="${attendees}" data-agenda="${agenda}" data-notes="${notes}">
        <td>${meeting.title}</td>
        <td>${formatMeetingDate(meeting.date)}</td>
        <td>${actionCount} action item${actionCount !== 1 ? 's' : ''}</td>
        <td>
          <div class="action-buttons">
            ${hasMinutes ? `
              <button class="btn btn-primary view-minutes" data-id="${meeting.id}">
                <i class="fas fa-eye"></i> View
              </button>
            ` : ''}
            <button class="btn btn-warning edit-minutes" data-id="${meeting.id}">
              <i class="fas fa-edit"></i> ${hasMinutes ? 'Edit' : 'Create'}
            </button>
            <button class="btn btn-danger delete-minutes" data-id="${meeting.id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    `);
  });

  // View minutes button
  $('.view-minutes').click(function() {
    const meetingId = $(this).data('id');
    showMinutesDetails(meetingId);
  });

  // Edit minutes button
  $('.edit-minutes').click(function() {
    const meetingId = $(this).data('id');
    window.location.href = `minutes.html?meeting=${meetingId}`;
  });

  // Delete minutes button
  $('.delete-minutes').click(function() {
    const meetingId = $(this).data('id');
    deleteMinutes(meetingId);
  });

  // Search functionality
  $('#search-minutes').on('input', function() {
    const searchTerm = $(this).val().toLowerCase();
    filterMeetings(searchTerm);
  });

  // Date filter functionality
  $('#filter-date').change(function() {
    filterMeetings('', $(this).val());
  });

  // Export buttons
  $('#export-pdf').click(() => exportMinutes('pdf'));
  
  // Download attachment handler
  $(document).on('click', '.download-attachment', function(e) {
    e.preventDefault();
    const fileName = $(this).data('file');
    showToast(`Downloading ${fileName}...`, 'info');
    // In a real app, this would trigger the file download
  });
}

function showMinutesDetails(meetingId) {
  const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const minutes = JSON.parse(localStorage.getItem('minutes')) || [];
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
  const allUsers = [...users, ...adminUsers];
  
  const meeting = meetings.find(m => m.id == meetingId);
  const minute = minutes.find(m => m.meetingId == meetingId);

  if (!meeting) {
    showToast('Meeting not found!', 'error');
    return;
  }

  if (!minute) {
    showToast('No minutes found for this meeting!', 'error');
    return;
  }

  // Show details section
  $('#minutes-detail').show().attr('data-meeting-id', meetingId);
  $('html, body').animate({ scrollTop: $('#minutes-detail').offset().top }, 500);

  // Populate meeting details
  $('#detail-title').text(meeting.title).data('meeting-id', meetingId);
  $('#detail-date').text(formatMeetingDateTime(meeting.date));
  
  // Format attendees
  const attendeeNames = meeting.attendees.map(attendeeId => {
    const user = allUsers.find(u => u.id == attendeeId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  });
  $('#detail-attendees').text(attendeeNames.join(', '));

  // Populate agenda
  $('#detail-agenda').html(minute.agenda?.replace(/\n/g, '<br>') || '<em>No agenda provided</em>');

  // Populate discussion points
  const $discussion = $('#detail-discussion');
  $discussion.empty();
  if (minute.discussionPoints?.length > 0) {
    minute.discussionPoints.forEach(point => {
      $discussion.append(`
        <div class="discussion-point">
          <h4>${point.topic || 'Untitled Topic'}</h4>
          <p>${point.details?.replace(/\n/g, '<br>') || '<em>No details provided</em>'}</p>
        </div>
      `);
    });
  } else {
    $discussion.append('<p><em>No discussion points recorded</em></p>');
  }

  // Populate action items
  const $actions = $('#detail-actions');
  $actions.empty();
  // Update the action items display part
if (minute.actionItems?.length > 0) {
  minute.actionItems.forEach(action => {
    const assignee = allUsers.find(u => String(u.id) === String(action.assignee)); // String comparison
    $actions.append(`
      <tr>
        <td>${action.action || 'Unspecified action'}</td>
        <td>${assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned'}</td>
        <td>${action.dueDate || 'No due date'}</td>
        <td><span class="status-badge ${action.status || 'pending'}">${action.status || 'Pending'}</span></td>
      </tr>
    `);
  });
}else {
    $actions.append('<tr><td colspan="4"><em>No action items</em></td></tr>');
  }

  // Populate notes
  $('#detail-notes').html(minute.notes ? minute.notes.replace(/\n/g, '<br>') : '<em>No additional notes</em>');

  // Populate attachments
  const $attachments = $('#detail-attachments');
  $attachments.empty();
  if (minute.attachments?.length > 0) {
    minute.attachments.forEach(attachment => {
      $attachments.append(`
        <div class="attachment">
          <i class="fas ${getFileIcon(attachment.name)}"></i> ${attachment.name}
          <a href="#" class="download-attachment" data-file="${attachment.name}">
            <i class="fas fa-download"></i> Download
          </a>
        </div>
      `);
    });
  } else {
    $attachments.append('<p><em>No attachments</em></p>');
  }
}

function deleteMinutes(meetingId) {
  showModal({
    title: 'Delete Minutes',
    message: 'Are you sure you want to delete these minutes? This cannot be undone.',
    onConfirm: () => {
      let minutes = JSON.parse(localStorage.getItem('minutes')) || [];
      let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
      minutes = minutes.filter(m => m.meetingId != meetingId);
      meetings = meetings.filter(m => m.id != meetingId);
      localStorage.setItem('minutes', JSON.stringify(minutes));
      localStorage.setItem('meetings', JSON.stringify(meetings));
      showToast('Minutes and meeting deleted successfully!', 'success');
      initReview(); // Refresh the list
      $('#minutes-detail').hide();
    },
    showCancel: true,
    confirmText: 'Delete',
    cancelText: 'Cancel'
  });
}

function exportMinutes(format) {
  const meetingId = $('#detail-title').data('meeting-id');
  if (!meetingId) {
    showToast('No meeting selected for export', 'error');
    return;
  }

  const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const minutes = JSON.parse(localStorage.getItem('minutes')) || [];
  const meeting = meetings.find(m => m.id == meetingId);
  const minute = minutes.find(m => m.meetingId == meetingId);

  if (!meeting || !minute) {
    showToast('Meeting minutes not found for export', 'error');
    return;
  }

  if (format === 'pdf') {
    // Use jsPDF to generate PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text(`Meeting Minutes: ${meeting.title}`, 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Date: ${formatMeetingDateTime(meeting.date)}`, 10, y);
    y += 8;
    doc.text(`Attendees: ${(meeting.attendees || []).join(', ')}`, 10, y);
    y += 8;
    doc.text('Agenda:', 10, y);
    y += 6;
    doc.text(minute.agenda || 'No agenda provided', 14, y);
    y += 10;
    doc.text('Discussion Points:', 10, y);
    y += 6;
    (minute.discussionPoints || []).forEach(point => {
      doc.text(`- ${point.topic}: ${point.details}`, 14, y);
      y += 6;
    });
    y += 4;
    doc.text('Action Items:', 10, y);
    y += 6;
    (minute.actionItems || []).forEach(action => {
      doc.text(`- ${action.action} [${action.status}] (Assignee: ${action.assignee}, Due: ${action.dueDate})`, 14, y);
      y += 6;
    });
    y += 4;
    doc.text('Notes:', 10, y);
    y += 6;
    doc.text(minute.notes || 'No additional notes', 14, y);
    const fileName = `Minutes_${meeting.title.replace(/[^a-z0-9]/gi, '_')}_${formatDateForExport(new Date())}.pdf`;
    doc.save(fileName);
    // Show a custom alert similar to download, but for PDF export
    showToast(`PDF exported and downloaded: ${fileName}`, 'info');
    alert(`PDF exported and downloaded: ${fileName}`);
    return;
  }
  showToast('Only PDF export is currently supported for download.', 'info');
}

function filterMeetings(searchTerm = '', monthFilter = '') {
  const $rows = $('#past-meetings tr');
  if (!searchTerm && !monthFilter) {
    $rows.show();
    return;
  }
  $rows.each(function() {
    const $row = $(this);
    const title = $row.find('td:first').text().toLowerCase();
    const dateText = $row.find('td:nth-child(2)').text();
    const date = new Date(dateText);
    const actionItems = $row.find('td:nth-child(3)').text().toLowerCase();
    // Enhanced: search in attendees, agenda, and notes (requires storing these as data attributes)
    const attendees = $row.data('attendees') ? $row.data('attendees').toLowerCase() : '';
    const agenda = $row.data('agenda') ? $row.data('agenda').toLowerCase() : '';
    const notes = $row.data('notes') ? $row.data('notes').toLowerCase() : '';
    const matchesSearch = !searchTerm ||
      title.includes(searchTerm) ||
      attendees.includes(searchTerm) ||
      agenda.includes(searchTerm) ||
      notes.includes(searchTerm) ||
      actionItems.includes(searchTerm);
    const matchesMonth = !monthFilter ||
      (date.getMonth() === new Date(monthFilter).getMonth() &&
        date.getFullYear() === new Date(monthFilter).getFullYear());
    $row.toggle(matchesSearch && matchesMonth);
  });
}

function getFileIcon(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  switch(extension) {
    case 'pdf': return 'fa-file-pdf';
    case 'doc':
    case 'docx': return 'fa-file-word';
    case 'xls':
    case 'xlsx': return 'fa-file-excel';
    case 'ppt':
    case 'pptx': return 'fa-file-powerpoint';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return 'fa-file-image';
    default: return 'fa-file';
  }
}

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

function formatDateForExport(date) {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}