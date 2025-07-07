/**
 * BOOKING PAGE - COMPLETE WORKING VERSION
 */
function initBooking() {
  // Initialize datetime picker
  $('#meeting-date').datetimepicker({
    format: 'Y-m-d H:i',
    minDate: 0
  });

  // Load rooms and attendees
  loadRooms();
  loadAttendees();

  // Check for edit mode
  const urlParams = new URLSearchParams(window.location.search);
  const meetingId = urlParams.get('edit');
  
  if (meetingId) {
    loadMeetingData(meetingId);
    $('.card-header h2').text('Edit Meeting');
    $('#booking-form button[type="submit"]').text('Update Meeting');
  }

  // Setup validation
  $('#room, #meeting-date, #duration').change(() => validateBooking());
  
  // Form submission
  $('#booking-form').submit(function(e) {
    e.preventDefault();
    
    if (!validateBooking(true)) {
      showToast('Please fix validation errors', 'error');
      return false;
    }
    
    const meeting = createMeetingObject();
    saveMeeting(meeting);
    
    const message = meetingId ? 'Meeting updated!' : 'Meeting booked!';
    showToast(message, 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
  });
}

function loadRooms() {
  const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
  const $roomSelect = $('#room');
  
  // Clear existing options except the first one
  $roomSelect.find('option:not(:first)').remove();
  
  if (rooms.length === 0) {
    $roomSelect.append('<option value="" disabled>No rooms available</option>');
    return;
  }
  
  rooms.forEach(room => {
    $roomSelect.append(`
      <option value="${room.id}">
        ${room.name} (Capacity: ${room.capacity})${room.equipment ? ' - Equipment: ' + room.equipment : ''}
      </option>
    `);
  });
}

function loadAttendees() {
  const registeredUsers = JSON.parse(localStorage.getItem('users')) || [];
  const adminAddedUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
  const allUsers = [...registeredUsers, ...adminAddedUsers];
  
  // Filter out current user
  const otherUsers = allUsers.filter(user => 
    currentUser && user.email !== currentUser.email
  );
  
  const $attendeesSelect = $('#attendees');
  $attendeesSelect.empty();
  
  if (otherUsers.length === 0) {
    $attendeesSelect.append('<option value="" disabled>No other users available</option>');
    return;
  }
  
  otherUsers.forEach(user => {
    $attendeesSelect.append(`
      <option value="${user.id}">
        ${user.firstName} ${user.lastName} (${user.email})
      </option>
    `);
  });
}

function createMeetingObject() {
  return {
    id: localStorage.getItem('editingMeetingId') || Date.now(),
    title: $('#meeting-title').val(),
    date: $('#meeting-date').val(),
    duration: parseInt($('#duration').val()),
    room: $('#room').val(),
    attendees: $('#attendees').val() || [],
    agenda: $('#agenda').val(),
    recurring: $('#recurring').is(':checked'),
    videoConference: $('#video-conference').is(':checked'),
    organizer: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown'
  };
}

function saveMeeting(meeting) {
  let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  
  // Remove old version if editing
  if (localStorage.getItem('editingMeetingId')) {
    meetings = meetings.filter(m => m.id != meeting.id);
    localStorage.removeItem('editingMeetingId');
  }
  
  meetings.push(meeting);
  localStorage.setItem('meetings', JSON.stringify(meetings));
}

function loadMeetingData(meetingId) {
  const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const meeting = meetings.find(m => m.id == meetingId);
  
  if (meeting) {
    $('#meeting-title').val(meeting.title);
    $('#meeting-date').val(meeting.date);
    $('#duration').val(meeting.duration);
    $('#room').val(meeting.room);
    $('#attendees').val(meeting.attendees);
    $('#agenda').val(meeting.agenda);
    $('#recurring').prop('checked', meeting.recurring);
    $('#video-conference').prop('checked', meeting.videoConference);
    
    // Validate immediately when loading existing meeting
    setTimeout(() => validateBooking(true), 100);
  }
}

function validateBooking(showFeedback = true) {
  const room = $('#room').val();
  const dateTime = $('#meeting-date').val();
  const duration = parseInt($('#duration').val());
  const currentMeetingId = localStorage.getItem('editingMeetingId');
  
  // Reset UI
  if (showFeedback) {
    $('#availability-status').html('<i class="fas fa-sync-alt fa-spin"></i> Checking availability...').css('color', 'inherit');
  }
  
  // Check required fields
  if (!room || !dateTime || !duration || isNaN(duration)) {
    if (showFeedback) {
      $('#availability-status').text('Complete all fields to check availability').css('color', 'inherit');
      $('#booking-form button[type="submit"]').prop('disabled', true);
    }
    return false;
  }
  
  const selectedDate = new Date(dateTime);
  const selectedEnd = new Date(selectedDate.getTime() + duration * 60000);
  
  // Validate future date
  if (selectedDate < new Date()) {
    if (showFeedback) {
      $('#availability-status').html('<i class="fas fa-exclamation-triangle"></i> Cannot book in the past').css('color', 'red');
      $('#booking-form button[type="submit"]').prop('disabled', true);
    }
    return false;
  }
  
  // Validate duration
  if (duration < 15 || duration > 240) {
    if (showFeedback) {
      $('#availability-status').html('<i class="fas fa-exclamation-triangle"></i> Duration must be 15-240 minutes').css('color', 'red');
      $('#booking-form button[type="submit"]').prop('disabled', true);
    }
    return false;
  }
  
  // Check conflicts
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
      
      $('#availability-status').html(`
        <i class="fas fa-times-circle"></i> <strong>Room unavailable</strong><br>
        Conflicts with: ${conflictingMeeting.title}<br>
        ${formatTime(mStart)} - ${formatTime(mEnd)}
      `).css('color', 'red');
      $('#booking-form button[type="submit"]').prop('disabled', true);
    }
    return false;
  }
  
  if (showFeedback) {
    $('#availability-status').html(`
      <i class="fas fa-check-circle"></i> <strong>Room available</strong><br>
      ${formatTime(selectedDate)} - ${formatTime(selectedEnd)}
    `).css('color', 'green');
    $('#booking-form button[type="submit"]').prop('disabled', false);
  }
  
  return true;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}