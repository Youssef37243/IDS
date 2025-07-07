/**
 * MINUTES PAGE - COMPLETE WORKING VERSION
 */
function initMinutes() {
  const urlParams = new URLSearchParams(window.location.search);
  const meetingId = urlParams.get('meeting');
  
  if (meetingId) {
    loadMeetingData(meetingId);
  } else {
    // Set default values for new minutes
    $('#minutes-date').val(new Date().toISOString().split('T')[0]);
  }

  // Load attendees
  loadAttendees();

  // Form submission handler
  $('#minutes-form').submit(function(e) {
    e.preventDefault();
    saveMinutes(meetingId, false);
  });

  // Add discussion point button
  $('#add-point').click(function() {
    $('#discussion-points').append(`
      <div class="discussion-point">
        <input type="text" class="form-control" placeholder="Topic" required>
        <textarea class="form-control" rows="2" placeholder="Details" required></textarea>
        <button type="button" class="btn btn-danger remove-point">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>
    `);
  });

  // Remove discussion point handler
  $(document).on('click', '.remove-point', function() {
    $(this).closest('.discussion-point').remove();
  });

  // Add action item button
  $('#add-action').click(function() {
    $('#action-items').append(`
      <tr>
        <td><input type="text" class="form-control" placeholder="Action" required></td>
        <td>
          <select class="form-control" required>
            ${getAttendeeOptions()}
          </select>
        </td>
        <td><input type="date" class="form-control" required></td>
        <td>
          <select class="form-control" required>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </td>
        <td>
          <button type="button" class="btn btn-danger remove-action">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `);
  });

  // Remove action item handler
  $(document).on('click', '.remove-action', function() {
    $(this).closest('tr').remove();
  });

  // File attachment handler
  $('#minutes-attachments').change(function() {
    updateAttachmentsList(this.files);
  });

  // Cancel button handler
  $('.btn-danger').click(function() {
    window.location.href = 'review.html';
  });
}

function loadMeetingData(meetingId) {
  const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const minutes = JSON.parse(localStorage.getItem('minutes')) || [];
  const meeting = meetings.find(m => m.id == meetingId);
  
  if (!meeting) {
    showToast('Meeting not found!', 'error');
    setTimeout(() => window.location.href = 'review.html', 1000);
    return;
  }

  // Set meeting title
  $('#minutes-title').text(meeting.title);

  // Load existing minutes or create new structure
  const minute = minutes.find(m => m.meetingId == meetingId) || {
    meetingId: meeting.id,
    agenda: '',
    discussionPoints: [],
    actionItems: [],
    notes: '',
    attachments: []
  };

  // Populate form fields
  $('#minutes-date').val(meeting.date.split(' ')[0]);
  $('#minutes-attendees').val(meeting.attendees);
  $('#minutes-agenda').val(minute.agenda);
  
  // Populate discussion points
  const $discussionPoints = $('#discussion-points');
  $discussionPoints.empty();
  if (minute.discussionPoints?.length > 0) {
    minute.discussionPoints.forEach(point => {
      $discussionPoints.append(`
        <div class="discussion-point">
          <input type="text" class="form-control" value="${point.topic || ''}" required>
          <textarea class="form-control" rows="2" required>${point.details || ''}</textarea>
          <button type="button" class="btn btn-danger remove-point">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      `);
    });
  }

  // Populate action items
  const $actionItems = $('#action-items');
  // For action items:
$actionItems.empty();
// Update the action items loading part
if (minute.actionItems?.length > 0) {
  minute.actionItems.forEach(item => {
    const $row = $(`
      <tr>
        <td><input type="text" class="form-control" value="${item.action || ''}" required></td>
        <td>
          <select class="form-control" required>
            ${getAttendeeOptions(item.assignee)}
          </select>
        </td>
        <td><input type="date" class="form-control" value="${item.dueDate || ''}" required></td>
        <td>
          <select class="form-control" required>
            <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>
          <button type="button" class="btn btn-danger remove-action">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `);
    $actionItems.append($row);
  });
}

// For attachments:
$('#attachments-list').data('existing', minute.attachments || []);
updateAttachmentsList(null, minute.attachments);
}

function loadAttendees() {
  const registeredUsers = JSON.parse(localStorage.getItem('users')) || [];
  const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
  const allUsers = [...registeredUsers, ...adminUsers];
  const $attendeesSelect = $('#minutes-attendees');
  
  $attendeesSelect.empty();
  
  allUsers.forEach(user => {
    $attendeesSelect.append(`
      <option value="${user.id}">
        ${user.firstName} ${user.lastName} (${user.email})
      </option>
    `);
  });
}

function getAttendeeOptions(selectedId = null) {
  const registeredUsers = JSON.parse(localStorage.getItem('users')) || [];
  const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
  const allUsers = [...registeredUsers, ...adminUsers];
  
  let options = '<option value="">Select Assignee</option>';
  allUsers.forEach(user => {
    // Make sure we're comparing strings to strings
    const isSelected = String(user.id) === String(selectedId) ? 'selected' : '';
    options += `<option value="${user.id}" ${isSelected}>${user.firstName} ${user.lastName}</option>`;
  });
  
  return options;
}

function updateAttachmentsList(files, existingAttachments = []) {
  const $attachmentsList = $('#attachments-list');
  $attachmentsList.empty();
  
  // Add existing attachments
  if (existingAttachments?.length > 0) {
    existingAttachments.forEach(attachment => {
      $attachmentsList.append(`
        <div class="attachment">
          <i class="fas ${getFileIcon(attachment.name)}"></i> ${attachment.name}
          <span class="file-size">(${formatFileSize(attachment.size)})</span>
        </div>
      `);
    });
  }
  
  // Add new files
  if (files?.length > 0) {
    for (let i = 0; i < files.length; i++) {
      $attachmentsList.append(`
        <div class="attachment">
          <i class="fas ${getFileIcon(files[i].name)}"></i> ${files[i].name}
          <span class="file-size">(${formatFileSize(files[i].size)})</span>
        </div>
      `);
    }
  }
}

function saveMinutes(meetingId, isDraft = false) {
  const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const meeting = meetings.find(m => m.id == meetingId);
  
  if (!meeting && meetingId) {
    showToast('Meeting not found!', 'error');
    return;
  }

  // Collect discussion points
  const discussionPoints = [];
  $('.discussion-point').each(function() {
    const topic = $(this).find('input').val();
    const details = $(this).find('textarea').val();
    if (topic && details) {
      discussionPoints.push({ topic, details });
    }
  });

  // Collect action items
 // Update the action items collection part in saveMinutes()
const actionItems = [];
$('#action-items tr').each(function() {
  const $row = $(this);
  const action = $row.find('td:eq(0) input').val().trim();
  const assignee = $row.find('td:eq(1) select').val(); // Get selected assignee ID
  const dueDate = $row.find('td:eq(2) input').val();
  const status = $row.find('td:eq(3) select').val();
  
  if (action && assignee && dueDate) {
    actionItems.push({
      action,
      assignee, // Make sure this is the user ID
      dueDate,
      status: status || 'pending' // Default status
    });
  }
});

  // Collect attachments
  const attachments = [];
  const files = $('#minutes-attachments')[0].files;
  for (let i = 0; i < files.length; i++) {
    attachments.push({
      name: files[i].name,
      size: files[i].size,
      type: files[i].type
    });
  }

  // Create minutes object
  const minutes = {
    meetingId: meetingId || Date.now(),
    title: $('#minutes-title').text(),
    date: $('#minutes-date').val(),
    attendees: $('#minutes-attendees').val() || [],
    agenda: $('#minutes-agenda').val(),
    discussionPoints,
    actionItems,
    notes: $('#minutes-notes').val(),
    attachments,
    isDraft,
    lastUpdated: new Date().toISOString()
  };

  // Save to localStorage
  let allMinutes = JSON.parse(localStorage.getItem('minutes')) || [];
  
  // Remove existing minutes if editing
  allMinutes = allMinutes.filter(m => m.meetingId != minutes.meetingId);
  
  allMinutes.push(minutes);
  localStorage.setItem('minutes', JSON.stringify(allMinutes));
  
  showToast(isDraft ? 'Draft saved!' : 'Minutes finalized and saved!', 'success');
  setTimeout(() => window.location.href = 'review.html', 1000);
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

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}