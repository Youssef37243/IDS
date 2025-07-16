function initMinutes() {
  const urlParams = new URLSearchParams(window.location.search);
  const meetingId = urlParams.get('meeting');

  if (meetingId) {
    loadMeetingData(meetingId);
  } else {
    // Set default date for new minutes
    const minutesDateInput = document.getElementById('minutes-date');
    if (minutesDateInput) {
      minutesDateInput.value = new Date().toISOString().split('T')[0];
    }
    loadAttendees();
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

async function loadMeetingData(meetingId) {
  try {
    const [meetingRes, minutesRes, usersRes] = await Promise.all([
      fetch(`/api/meetings/${meetingId}`, { headers: getAuthHeaders() }),
      fetch(`/api/minutes?meeting_id=${meetingId}`, { headers: getAuthHeaders() }),
      fetch('/api/users', { headers: getAuthHeaders() })
    ]);
    if (!meetingRes.ok || !minutesRes.ok || !usersRes.ok) throw new Error('Failed to load data');

    const meeting = await meetingRes.json();
    const minutesArr = await minutesRes.json();
    const usersData = await usersRes.json();
    const users = usersData.data || usersData;
    const minute = Array.isArray(minutesArr) && minutesArr.length > 0 ? minutesArr[0] : null;

    // Set meeting title
    const titleElem = document.getElementById('minutes-title');
    if (titleElem) titleElem.textContent = meeting.title;

    // Populate form fields
    const dateInput = document.getElementById('minutes-date');
    if (dateInput) dateInput.value = meeting.start_time.split('T')[0];

    const attendeesSelect = document.getElementById('minutes-attendees');
    if (attendeesSelect) {
      attendeesSelect.innerHTML = '';
      users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.first_name} ${user.last_name} (${user.email})`;
        attendeesSelect.appendChild(option);
      });
      const selectedAttendees = (minute && minute.attendees) || meeting.attendees?.map(a => a.user_id || a) || [];
      attendeesSelect.value = null;
      // For multiple select
      Array.from(attendeesSelect.options).forEach(opt => {
        opt.selected = selectedAttendees.includes(opt.value) || selectedAttendees.includes(Number(opt.value));
      });
    }

    const agendaInput = document.getElementById('minutes-agenda');
    if (agendaInput) agendaInput.value = minute ? minute.agenda : meeting.agenda || '';

    // Discussion points
    const discussionPointsContainer = document.getElementById('discussion-points');
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

  } catch (err) {
    console.error('Error loading meeting data:', err);
    // You can show an error UI here if needed
  }
}

async function loadAttendees() {
  try {
    const response = await fetch('/api/users', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to load users');

    const data = await response.json();
    const users = data.data || data;
    const attendeesSelect = document.getElementById('minutes-attendees');
    if (!attendeesSelect) return;

    attendeesSelect.innerHTML = '';
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = `${user.first_name} ${user.last_name} (${user.email})`;
      attendeesSelect.appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
}

function getAttendeeOptions(selectedId = null, usersList = null) {
  const users = usersList || JSON.parse(localStorage.getItem('users')) || [];
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

  // Gather attachments
  const attachments = [];
  const attachmentsInput = document.getElementById('minutes-attachments');
  if (attachmentsInput && attachmentsInput.files) {
    for (let i = 0; i < attachmentsInput.files.length; i++) {
      const file = attachmentsInput.files[i];
      attachments.push({
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
  }

  // Build minutes object
  const minutes = {
    meeting_id: meetingId,
    title: document.getElementById('minutes-title')?.textContent || '',
    date: document.getElementById('minutes-date')?.value || '',
    attendees: Array.from(document.getElementById('minutes-attendees')?.selectedOptions || []).map(opt => opt.value),
    agenda: document.getElementById('minutes-agenda')?.value || '',
    discussionPoints,
    actionItems,
    notes: document.getElementById('minutes-notes')?.value || '',
    attachments,
    isDraft,
    lastUpdated: new Date().toISOString()
  };

  fetch('/api/minutes', {
    method: 'POST',
    headers: Object.assign({
      'Content-Type': 'application/json'
    }, getAuthHeaders()),
    body: JSON.stringify(minutes)
  })
    .then(res => {
      if (!res.ok) return res.json().then(data => Promise.reject(data));
      return res.json();
    })
    .then(() => {
      showToast(isDraft ? 'Draft saved!' : 'Minutes finalized and saved!', 'success');
      setTimeout(() => window.location.href = '/review', 1000);
    })
    .catch(err => {
      const msg = err.message || 'Unknown error';
      showToast('Failed to save minutes: ' + msg, 'error');
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
