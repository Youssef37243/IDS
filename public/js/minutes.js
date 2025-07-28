function initMinutes() {
  const urlParams = new URLSearchParams(window.location.search);
  const meetingId = urlParams.get('meeting');
  const attendeeIds = urlParams.get('attendees')?.split(',') || [];
  const isEdit = urlParams.has('edit');
  const isEndedMeeting = urlParams.has('ended');

  if (meetingId) {
    loadMeetingData(meetingId, attendeeIds);
    
    // Show appropriate notifications
    if (isEndedMeeting) {
      showToast('Meeting ended. Please complete the minutes.', 'info');
    } else if (isEdit) {
      showToast('Editing existing minutes.', 'info');
    }
  } else {
    // Set default date for new minutes
    const minutesDateInput = document.getElementById('minutes-date');
    if (minutesDateInput) {
      minutesDateInput.value = new Date().toISOString().split('T')[0];
    }
    loadAttendees([]); // Pass empty array if no specific attendees
  }

  // Form submission
  const minutesForm = document.getElementById('minutes-form');
  if (minutesForm) {
    minutesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveMinutes(meetingId, false);
    });
  }

  // Add discussion point button
  const addPointBtn = document.getElementById('add-point');
  if (addPointBtn) {
    addPointBtn.addEventListener('click', () => {
      const container = document.getElementById('discussion-points');
      if (!container) return;

      const div = document.createElement('div');
      div.className = 'discussion-point';
      div.innerHTML = `
        <input type="text" class="form-control" placeholder="Topic" required>
        <textarea class="form-control" rows="2" placeholder="Details" required></textarea>
        <button type="button" class="btn btn-danger remove-point">
          <i class="fas fa-trash"></i> Remove
        </button>
      `;
      container.appendChild(div);
    });
  }

  // Delegate remove discussion point
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('.remove-point')) {
      const pointDiv = e.target.closest('.discussion-point');
      if (pointDiv) pointDiv.remove();
    }
    if (e.target.closest && e.target.closest('.remove-action')) {
      const row = e.target.closest('tr');
      if (row) row.remove();
    }
  });

  // Add action item button
  const addActionBtn = document.getElementById('add-action');
  if (addActionBtn) {
    addActionBtn.addEventListener('click', () => {
      const actionItemsTable = document.getElementById('action-items');
      if (!actionItemsTable) return;

      const tr = document.createElement('tr');
      tr.innerHTML = `
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
      `;
      actionItemsTable.appendChild(tr);
    });
  }

  // File attachment change handler
  const attachmentsInput = document.getElementById('minutes-attachments');
  if (attachmentsInput) {
    attachmentsInput.addEventListener('change', () => {
      updateAttachmentsList(attachmentsInput.files);
    });
  }

  // Cancel button(s) - redirect to /review
  const cancelButtons = document.querySelectorAll('.btn-danger');
  cancelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = '/review';
    });
  });
}

async function loadMeetingData(meetingId, attendeeIds) {
  try {
    const [meetingRes, minutesRes, usersRes] = await Promise.all([
      fetch(`/api/meetings/${meetingId}`, { headers: getAuthHeaders() }),
      fetch(`/api/minutes?meeting_id=${meetingId}`, { headers: getAuthHeaders() }),
      fetch('/api/users', { headers: getAuthHeaders() })
    ]);
    
    // Check for authentication issues
    if (meetingRes.status === 401 || minutesRes.status === 401 || usersRes.status === 401) {
      throw new Error('Authentication failed');
    }
    
    if (!meetingRes.ok || !minutesRes.ok || !usersRes.ok) {
      throw new Error(`Failed to load data: Meeting ${meetingRes.status}, Minutes ${minutesRes.status}, Users ${usersRes.status}`);
    }

    const meeting = await meetingRes.json();
    const minutesArr = await minutesRes.json();
    const usersData = await usersRes.json();
    const users = usersData.data || usersData;
    const minute = Array.isArray(minutesArr) && minutesArr.length > 0 ? minutesArr[0] : null;

    // Filter users to only include meeting attendees
    const meetingAttendees = attendeeIds.length > 0 
      ? users.filter(user => attendeeIds.includes(String(user.id)))
      : users;

    // Store attendees for action items dropdown
    localStorage.setItem('meetingAttendees', JSON.stringify(meetingAttendees));

    // Set meeting title
    const titleElem = document.getElementById('minutes-title');
    if (titleElem) titleElem.textContent = meeting.title;

    // Populate form fields
    const dateInput = document.getElementById('minutes-date');
    if (dateInput) dateInput.value = meeting.start_time.split('T')[0];

    const attendeesSelect = document.getElementById('minutes-attendees');
    if (attendeesSelect) {
      attendeesSelect.innerHTML = '';
      meetingAttendees.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.first_name} ${user.last_name} (${user.email})`;
        option.selected = attendeeIds.includes(String(user.id));
        attendeesSelect.appendChild(option);
      });
    }

    const agendaInput = document.getElementById('minutes-agenda');
    if (agendaInput) agendaInput.value = minute ? minute.agenda : meeting.agenda || '';

    if (discussionPointsContainer) {
      discussionPointsContainer.innerHTML = '';
      if (minute && minute.discussionPoints?.length) {
        minute.discussionPoints.forEach(point => {
          const div = document.createElement('div');
          div.className = 'discussion-point';
          div.innerHTML = `
            <input type="text" class="form-control" value="${point.topic || ''}" required>
            <textarea class="form-control" rows="2" required>${point.details || ''}</textarea>
            <button type="button" class="btn btn-danger remove-point">
              <i class="fas fa-trash"></i> Remove
            </button>
          `;
          discussionPointsContainer.appendChild(div);
        });
      }
    }

    // Action items
    const actionItemsTable = document.getElementById('action-items');
    if (actionItemsTable) {
      actionItemsTable.innerHTML = '';
      if (minute && minute.actionItems?.length) {
        minute.actionItems.forEach(item => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><input type="text" class="form-control" value="${item.action || ''}" required></td>
            <td>
              <select class="form-control" required>
                ${getAttendeeOptions(item.assignee, users)}
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
          `;
          actionItemsTable.appendChild(tr);
        });
      }
    }

    // Attachments
    const attachmentsList = document.getElementById('attachments-list');
    if (attachmentsList) {
      attachmentsList.dataset.existing = JSON.stringify(minute ? minute.attachments : []);
      updateAttachmentsList(null, minute ? minute.attachments : []);
    }

    // Notes
    const notesInput = document.getElementById('minutes-notes');
    if (notesInput) notesInput.value = minute ? minute.notes : '';

  } catch (error) {
    console.error('Error loading meeting data:', error);
    if (error.message.includes('Authentication failed')) {
      showToast('Session expired. Please log in again.', 'error');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      setTimeout(() => window.location.href = '/login', 1000);
    } else {
      showToast(error.message || 'Failed to load meeting data', 'error');
    }
  }
}

function loadAttendees(attendeeIds) {
  // If we have specific attendees, use those
  const storedAttendees = JSON.parse(localStorage.getItem('meetingAttendees')) || [];
  if (storedAttendees.length > 0) {
    populateAttendeesDropdown(storedAttendees, attendeeIds);
    return;
  }

  // Otherwise load all users (for cases where minutes are created directly)
  fetch('/api/users', { headers: getAuthHeaders() })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      const users = data.data || data;
      populateAttendeesDropdown(users, attendeeIds);
    })
    .catch(err => {
      console.error('Error loading users:', err);
      showToast('Failed to load attendees', 'error');
    });
}

function populateAttendeesDropdown(users, selectedIds = []) {
  const attendeesSelect = document.getElementById('minutes-attendees');
  if (!attendeesSelect) return;

  attendeesSelect.innerHTML = '';
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = `${user.first_name} ${user.last_name} (${user.email})`;
    option.selected = selectedIds.includes(String(user.id));
    attendeesSelect.appendChild(option);
  });
}

// Update getAttendeeOptions to use meeting attendees
function getAttendeeOptions(selectedId = null) {
  const users = JSON.parse(localStorage.getItem('meetingAttendees')) || [];
  let options = '<option value="">Select Assignee</option>';
  users.forEach(user => {
    const isSelected = String(user.id) === String(selectedId) ? 'selected' : '';
    options += `<option value="${user.id}" ${isSelected}>${user.first_name} ${user.last_name}</option>`;
  });
  return options;
}

function updateAttachmentsList(files, existingAttachments = []) {
  const attachmentsList = document.getElementById('attachments-list');
  if (!attachmentsList) return;

  attachmentsList.innerHTML = '';

  if (existingAttachments.length > 0) {
    existingAttachments.forEach(attachment => {
      const div = document.createElement('div');
      div.className = 'attachment';
      div.innerHTML = `
        <i class="fas ${getFileIcon(attachment.name)}"></i> ${attachment.name}
        <span class="file-size">(${formatFileSize(attachment.size)})</span>
      `;
      attachmentsList.appendChild(div);
    });
  }

  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const div = document.createElement('div');
      div.className = 'attachment';
      div.innerHTML = `
        <i class="fas ${getFileIcon(files[i].name)}"></i> ${files[i].name}
        <span class="file-size">(${formatFileSize(files[i].size)})</span>
      `;
      attachmentsList.appendChild(div);
    }
  }
}

function saveMinutes(meetingId, isDraft = false) {
  // Gather discussion points
  const discussionPoints = [];
  document.querySelectorAll('.discussion-point').forEach(div => {
    const topicInput = div.querySelector('input[type="text"]');
    const detailsTextarea = div.querySelector('textarea');
    if (topicInput && detailsTextarea && topicInput.value && detailsTextarea.value) {
      discussionPoints.push({
        topic: topicInput.value,
        details: detailsTextarea.value
      });
    }
  });

  // Gather action items
  const actionItems = [];
  document.querySelectorAll('#action-items tr').forEach(tr => {
    const actionInput = tr.querySelector('td:nth-child(1) input');
    const assigneeSelect = tr.querySelector('td:nth-child(2) select');
    const dueDateInput = tr.querySelector('td:nth-child(3) input');
    const statusSelect = tr.querySelector('td:nth-child(4) select');
    if (actionInput && assigneeSelect && dueDateInput && actionInput.value && assigneeSelect.value && dueDateInput.value) {
      actionItems.push({
        action: actionInput.value.trim(),
        assignee: assigneeSelect.value,
        dueDate: dueDateInput.value,
        status: statusSelect ? statusSelect.value : 'pending'
      });
    }
  });

  // Gather attendees
  const attendees = Array.from(document.getElementById('minutes-attendees').selectedOptions)
    .map(opt => parseInt(opt.value));

  // Build minutes object
  const minutes = {
    meeting_id: meetingId || null,
    title: document.getElementById('minutes-title')?.textContent || 'Meeting Minutes',
    date: document.getElementById('minutes-date')?.value || new Date().toISOString().split('T')[0],
    attendees: attendees,
    agenda: document.getElementById('minutes-agenda')?.value || '',
    discussionPoints: discussionPoints,
    actionItems: actionItems,
    notes: document.getElementById('minutes-notes')?.value || '',
    isDraft: isDraft
  };

  // Add attachments if any
  const attachmentsInput = document.getElementById('minutes-attachments');
  if (attachmentsInput?.files?.length > 0) {
    minutes.attachments = Array.from(attachmentsInput.files).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));
  }

  // Check if we're editing existing minutes
  const urlParams = new URLSearchParams(window.location.search);
  const isEdit = urlParams.has('edit');
  
  let method = 'POST';
  let url = '/api/minutes';
  
  if (isEdit && meetingId) {
    // For editing, we need to find the existing minute ID
    // This would ideally be passed as a parameter or fetched
    // For now, we'll use POST to create new or update existing
    method = 'POST';
    url = '/api/minutes';
  }

  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(minutes)
  })
  .then(response => {
    if (response.status === 401) {
      throw new Error('Authentication failed');
    }
    if (!response.ok) {
      return response.json().then(err => Promise.reject(err));
    }
    return response.json();
  })
  .then(data => {
    showToast(isEdit ? 'Minutes updated successfully!' : 'Minutes saved successfully!', 'success');
    setTimeout(() => window.location.href = '/review', 1500);
  })
  .catch(error => {
    console.error('Error saving minutes:', error);
    if (error.message && error.message.includes('Authentication failed')) {
      showToast('Session expired. Please log in again.', 'error');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      setTimeout(() => window.location.href = '/login', 1000);
    } else {
      showToast(`Failed to save minutes: ${error.message || 'Unknown error'}`, 'error');
    }
  });
}

function getFileIcon(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  switch (extension) {
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

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}
