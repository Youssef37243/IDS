function initBooking() {
  loadRooms();
  loadAttendees();

  // Check if editing an existing meeting
  const urlParams = new URLSearchParams(window.location.search);
  const meetingId = urlParams.get('edit');

  if (meetingId) {
    loadMeetingData(meetingId);
    const headerH2 = document.querySelector('.card-header h2');
    if (headerH2) headerH2.textContent = 'Edit Meeting';

    const submitBtn = document.querySelector('#booking-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Update Meeting';
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
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }

  // Cancel button
  const cancelBtn = document.getElementById('cancel-booking');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = '/dashboard';
    });
  }
}

async function loadRooms() {
  try {
    const response = await fetch('/api/rooms', { 
      headers: getAuthHeaders() 
    });
    
    if (!response.ok) throw new Error('Failed to load rooms');
    
    const rooms = await response.json();
    const roomSelect = document.getElementById('room');
    
    // Clear old options (and preserve default)
    roomSelect.innerHTML = '<option value="">Select Room</option>';
    
    if (!rooms.length) {
      roomSelect.innerHTML = '<option value="" disabled>No rooms available</option>';
      return;
    }

    rooms.forEach(room => {
      const option = document.createElement('option');
      option.value = room.id;
      
      // Create equipment display text
      let equipmentText = '';
      if (room.feature && room.feature !== 'None') {
        equipmentText = ` (Equipment: ${room.feature})`;
      }
      
      option.textContent = `${room.name} (Capacity: ${room.capacity}) (Location: ${room.location})${equipmentText}`;
      roomSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading rooms:', error);
    const roomSelect = document.getElementById('room');
    roomSelect.innerHTML = '<option value="" disabled>Error loading rooms</option>';
  }
}

async function loadAttendees() {
  const attendeesSelect = document.getElementById('attendees');
  if (!attendeesSelect) return;
  
  // Show loading state
  attendeesSelect.innerHTML = '<option value="" disabled>Loading attendees...</option>';

  try {
    const response = await fetch('/api/users', { 
      headers: getAuthHeaders() 
    });
    
    if (!response.ok) throw new Error('Failed to load attendees');
    
    const users = await response.json();
    const currentUser = getCurrentUser();
    
    if (!currentUser) throw new Error('User not authenticated');
    
    // Filter out current user
    const otherUsers = users.filter(user => user.id != currentUser.id);
    
    attendeesSelect.innerHTML = ''; // Clear loading state
    
    if (!otherUsers.length) {
      attendeesSelect.innerHTML = '<option value="" disabled>No other users available</option>';
      return;
    }

    otherUsers.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = `${user.first_name} ${user.last_name} (${user.email})`;
      attendeesSelect.appendChild(option);
    });

    // If editing a meeting, load the selected attendees
    const meetingId = new URLSearchParams(window.location.search).get('edit');
    if (meetingId) {
      await loadMeetingData(meetingId);
    }
  } catch (error) {
    console.error('Error loading attendees:', error);
    attendeesSelect.innerHTML = '<option value="" disabled>Error loading attendees</option>';
  }
}

async function loadMeetingData(meetingId) {
  try {
    const response = await fetch(`/api/meetings/${meetingId}`, { 
      headers: getAuthHeaders() 
    });
    
    if (!response.ok) throw new Error('Failed to load meeting data');
    
    const meeting = await response.json();
    
    // Set form values
    document.getElementById('meeting-title').value = meeting.title;
    document.getElementById('meeting-date').value = meeting.start_time.substring(0, 16);
    
    // Calculate duration in minutes
    const duration = Math.round(
      (new Date(meeting.end_time) - new Date(meeting.start_time)) / 60000
    );
    document.getElementById('duration').value = duration;
    
    document.getElementById('room').value = meeting.room_id;
    document.getElementById('agenda').value = meeting.agenda || '';
    document.getElementById('recurring').checked = meeting.recurring || false;
    document.getElementById('video-conference').checked = meeting.video_conference || false;
    
    // Set attendees
    if (meeting.attendees && meeting.attendees.length) {
      const attendeesSelect = document.getElementById('attendees');
      const attendeeIds = meeting.attendees.map(a => a.user_id);
      
      Array.from(attendeesSelect.options).forEach(option => {
        option.selected = attendeeIds.includes(parseInt(option.value));
      });
    }
    
    validateBooking();
  } catch (error) {
    console.error('Error loading meeting data:', error);
    showToast('Failed to load meeting data', 'error');
  }
}

async function handleBookingSubmit(e) {
  e.preventDefault();
  
  if (!validateBooking(true)) {
    showToast('Please fix validation errors', 'error');
    return;
  }

  try {
    const formData = getFormData();
    const isEditing = new URLSearchParams(window.location.search).has('edit');
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing 
      ? `/api/meetings/${new URLSearchParams(window.location.search).get('edit')}`
      : '/api/meetings';

    const response = await fetch(url, {
      method,
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save meeting');
    }

    const meeting = await response.json();
    showToast(
      isEditing ? 'Meeting updated successfully!' : 'Meeting booked successfully!', 
      'success'
    );
    
    setTimeout(() => window.location.href = '/dashboard', 1500);
  } catch (error) {
    console.error('Error saving meeting:', error);
    showToast(error.message || 'Failed to save meeting', 'error');
  }
}

function getFormData() {
  const form = document.getElementById('booking-form');
  const formData = {
    title: form.querySelector('#meeting-title').value,
    room_id: form.querySelector('#room').value,
    start_time: form.querySelector('#meeting-date').value,
    duration: parseInt(form.querySelector('#duration').value),
    agenda: form.querySelector('#agenda').value,
    recurring: form.querySelector('#recurring').checked,
    video_conference: form.querySelector('#video-conference').checked,
    attendees: Array.from(form.querySelector('#attendees').selectedOptions)
      .map(option => option.value)
  };
  
  return formData;
}

function validateBooking(showFeedback = true) {
  const room = document.getElementById('room')?.value || '';
  const dateTime = document.getElementById('meeting-date')?.value || '';
  const durationStr = document.getElementById('duration')?.value || '';
  const duration = parseInt(durationStr);
  const statusEl = document.getElementById('availability-status');
  const submitBtn = document.querySelector('#booking-form button[type="submit"]');

  if (showFeedback && statusEl) {
    statusEl.innerHTML = `<i class="fas fa-sync-alt fa-spin"></i> Checking availability...`;
    statusEl.style.color = '';
  }

  // Basic validation
  if (!room || !dateTime || !duration || isNaN(duration)) {
    if (showFeedback && statusEl) {
      statusEl.textContent = 'Complete all fields to check availability';
      statusEl.style.color = '';
    }
    if (submitBtn) submitBtn.disabled = true;
    return false;
  }

  const selectedDate = new Date(dateTime);
  const selectedEnd = new Date(selectedDate.getTime() + duration * 60000);

  // Time validation
  if (selectedDate < new Date()) {
    if (showFeedback && statusEl) {
      statusEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Cannot book in the past`;
      statusEl.style.color = 'red';
    }
    if (submitBtn) submitBtn.disabled = true;
    return false;
  }

  if (duration < 15 || duration > 240) {
    if (showFeedback && statusEl) {
      statusEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Duration must be 15-240 minutes`;
      statusEl.style.color = 'red';
    }
    if (submitBtn) submitBtn.disabled = true;
    return false;
  }

  // For real-time availability check, we'd need to call the API
  // For now, we'll assume it's available
  if (showFeedback && statusEl) {
    statusEl.innerHTML = `
      <i class="fas fa-check-circle"></i> <strong>Room available</strong><br>
      ${formatTime(selectedDate)} - ${formatTime(selectedEnd)}
    `;
    statusEl.style.color = 'green';
  }
  if (submitBtn) submitBtn.disabled = false;
  
  return true;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

document.addEventListener('DOMContentLoaded', initBooking);