function initBooking() {
  // Initialize datetime picker - replace your jQuery plugin with a vanilla alternative if needed
  // For demonstration, assume an input of type="datetime-local" is used

  loadRooms();
  loadAttendees();

  const urlParams = new URLSearchParams(window.location.search);
  const meetingId = urlParams.get('edit');

  if (meetingId) {
    loadMeetingData(meetingId);
    const headerH2 = document.querySelector('.card-header h2');
    if (headerH2) headerH2.textContent = 'Edit Meeting';

    const submitBtn = document.querySelector('#booking-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Update Meeting';

    localStorage.setItem('editingMeetingId', meetingId);
  }

  // Setup validation event listeners
  ['room', 'meeting-date', 'duration'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => validateBooking());
    }
  });

  // Form submission
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();

      if (!validateBooking(true)) {
        showToast('Please fix validation errors', 'error');
        return false;
      }

      const meeting = createMeetingObject();
      saveMeeting(meeting);

      const message = localStorage.getItem('editingMeetingId') ? 'Meeting updated!' : 'Meeting booked!';
      showToast(message, 'success');
      setTimeout(() => window.location.href = '/dashboard', 1000);
    });
  }
}

function loadRooms() {
  fetch('/api/rooms', { headers: getAuthHeaders() })
    .then(res => res.json())
    .then(rooms => {
      const roomSelect = document.getElementById('room');
      if (!roomSelect) return;
      // Remove all options except first
      Array.from(roomSelect.options).slice(1).forEach(opt => opt.remove());

      if (!rooms.length) {
        const option = document.createElement('option');
        option.value = '';
        option.disabled = true;
        option.textContent = 'No rooms available';
        roomSelect.appendChild(option);
        return;
      }

      rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `${room.name} (Capacity: ${room.capacity}) (Location: ${room.location})`;
        roomSelect.appendChild(option);
      });
    })
    .catch(() => {
      const roomSelect = document.getElementById('room');
      if (!roomSelect) return;
      const option = document.createElement('option');
      option.value = '';
      option.disabled = true;
      option.textContent = 'Error loading rooms';
      roomSelect.appendChild(option);
    });
}

function loadAttendees() {
  const attendeesSelect = document.getElementById('attendees');
  if (!attendeesSelect) return;
  
  // Show loading state
  attendeesSelect.innerHTML = '';
  const loadingOption = document.createElement('option');
  loadingOption.value = '';
  loadingOption.disabled = true;
  loadingOption.textContent = 'Loading attendees...';
  attendeesSelect.appendChild(loadingOption);

  fetch('/api/users', { headers: getAuthHeaders() })
    .then(res => {
      if (!res.ok) throw new Error('Failed to load attendees');
      return res.json();
    })
    .then(users => {
      attendeesSelect.innerHTML = ''; // Clear loading state
      
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('Current user information not available');
      }

      // Filter out the current user
      const otherUsers = users.filter(user => user.id != currentUser.id);

      if (otherUsers.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.disabled = true;
        option.textContent = 'No other users available';
        attendeesSelect.appendChild(option);
        return;
      }

      // Add all other users as options
      otherUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.first_name} ${user.last_name} (${user.email})`;
        attendeesSelect.appendChild(option);
      });

      // If editing a meeting, restore selected attendees
      const meetingId = new URLSearchParams(window.location.search).get('edit');
      if (meetingId) {
        loadMeetingData(meetingId);
      }
    })
    .catch(err => {
      console.error('Error loading attendees:', err);
      attendeesSelect.innerHTML = '';
      const errorOption = document.createElement('option');
      errorOption.value = '';
      errorOption.disabled = true;
      errorOption.textContent = 'Error loading attendees. Please try again.';
      attendeesSelect.appendChild(errorOption);
    });
}

function createMeetingObject() {
  const editingMeetingId = localStorage.getItem('editingMeetingId');
  return {
    id: editingMeetingId || Date.now(),
    title: document.getElementById('meeting-title')?.value || '',
    date: document.getElementById('meeting-date')?.value || '',
    duration: parseInt(document.getElementById('duration')?.value) || 0,
    room: document.getElementById('room')?.value || '',
    attendees: Array.from(document.getElementById('attendees')?.selectedOptions || []).map(o => o.value),
    agenda: document.getElementById('agenda')?.value || '',
    recurring: document.getElementById('recurring')?.checked || false,
    videoConference: document.getElementById('video-conference')?.checked || false,
    organizer: getCurrentUser() ? `${getCurrentUser().first_name} ${getCurrentUser().last_name}` : 'Unknown'
  };
}

function saveMeeting(meeting) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('You must be logged in to book a meeting', 'error');
    return;
  }

  const meetingData = {
    id: meeting.id,
    title: meeting.title,
    start_time: meeting.date,
    end_time: new Date(new Date(meeting.date).getTime() + meeting.duration * 60000).toISOString(),
    room_id: meeting.room,
    user_id: currentUser.id,
    attendees: meeting.attendees,
    agenda: meeting.agenda,
    recurring: meeting.recurring,
    video_conference: meeting.videoConference
  };

  fetch('/api/meetings', {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(meetingData)
  })
  .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
  .then(() => {
    showToast('Meeting booked!', 'success');
    setTimeout(() => window.location.href = '/dashboard', 1000);
  })
  .catch(err => {
    showToast('Failed to book meeting: ' + (err?.message || 'Unknown error'), 'error');
  });
}

function loadMeetingData(meetingId) {
  const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const meeting = meetings.find(m => m.id == meetingId);

  if (!meeting) return;

  const fields = {
    'meeting-title': meeting.title,
    'meeting-date': meeting.date,
    'duration': meeting.duration,
    'room': meeting.room,
    'agenda': meeting.agenda
  };

  for (const id in fields) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (Array.isArray(meeting.attendees) && id === 'attendees') {
        Array.from(el.options).forEach(option => {
          option.selected = meeting.attendees.includes(option.value);
        });
      } else {
        el.value = fields[id];
      }
    }
  }

  // Checkboxes
  const recurring = document.getElementById('recurring');
  const videoConference = document.getElementById('video-conference');
  if (recurring) recurring.checked = meeting.recurring;
  if (videoConference) videoConference.checked = meeting.videoConference;

  // Validate immediately
  setTimeout(() => validateBooking(true), 100);
}

function validateBooking(showFeedback = true) {
  const room = document.getElementById('room')?.value || '';
  const dateTime = document.getElementById('meeting-date')?.value || '';
  const durationStr = document.getElementById('duration')?.value || '';
  const duration = parseInt(durationStr);
  const currentMeetingId = localStorage.getItem('editingMeetingId');

  const statusEl = document.getElementById('availability-status');
  const submitBtn = document.querySelector('#booking-form button[type="submit"]');

  if (showFeedback) {
    if (statusEl) {
      statusEl.innerHTML = `<i class="fas fa-sync-alt fa-spin"></i> Checking availability...`;
      statusEl.style.color = '';
    }
  }

  if (!room || !dateTime || !duration || isNaN(duration)) {
    if (showFeedback) {
      if (statusEl) {
        statusEl.textContent = 'Complete all fields to check availability';
        statusEl.style.color = '';
      }
      if (submitBtn) submitBtn.disabled = true;
    }
    return false;
  }

  const selectedDate = new Date(dateTime);
  const selectedEnd = new Date(selectedDate.getTime() + duration * 60000);

  if (selectedDate < new Date()) {
    if (showFeedback) {
      if (statusEl) {
        statusEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Cannot book in the past`;
        statusEl.style.color = 'red';
      }
      if (submitBtn) submitBtn.disabled = true;
    }
    return false;
  }

  if (duration < 15 || duration > 240) {
    if (showFeedback) {
      if (statusEl) {
        statusEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Duration must be 15-240 minutes`;
        statusEl.style.color = 'red';
      }
      if (submitBtn) submitBtn.disabled = true;
    }
    return false;
  }

  const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const conflictingMeeting = meetings.find(m => {
    if (m.room !== room || m.id == currentMeetingId) return false;

    const mStart = new Date(m.date);
    const mEnd = new Date(mStart.getTime() + m.duration * 60000);

    return (
      (selectedDate >= mStart && selectedDate < mEnd) ||
      (selectedEnd > mStart && selectedEnd <= mEnd) ||
      (selectedDate <= mStart && selectedEnd >= mEnd)
    );
  });

  if (conflictingMeeting) {
    if (showFeedback) {
      const mStart = new Date(conflictingMeeting.date);
      const mEnd = new Date(mStart.getTime() + conflictingMeeting.duration * 60000);
      if (statusEl) {
        statusEl.innerHTML = `
          <i class="fas fa-times-circle"></i> <strong>Room unavailable</strong><br>
          Conflicts with: ${conflictingMeeting.title}<br>
          ${formatTime(mStart)} - ${formatTime(mEnd)}
        `;
        statusEl.style.color = 'red';
      }
      if (submitBtn) submitBtn.disabled = true;
    }
    return false;
  }

  if (showFeedback) {
    if (statusEl) {
      statusEl.innerHTML = `
        <i class="fas fa-check-circle"></i> <strong>Room available</strong><br>
        ${formatTime(selectedDate)} - ${formatTime(selectedEnd)}
      `;
      statusEl.style.color = 'green';
    }
    if (submitBtn) submitBtn.disabled = false;
  }

  return true;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

const cancelBtn = document.getElementById('cancel-booking');
          if (cancelBtn) {
            cancelBtn.addEventListener('click', function (e) {
              e.preventDefault();
              window.location.href = '/dashboard';
            });
          }

document.addEventListener('DOMContentLoaded', initBooking);
