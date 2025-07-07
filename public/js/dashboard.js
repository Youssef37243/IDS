/**
 * DASHBOARD PAGE - COMPLETE WORKING VERSION
 */
function initDashboard() {
  loadUpcomingMeetings();
  
  $('#schedule-meeting').click(() => window.location.href = 'booking.html');
  $('#view-minutes').click(() => window.location.href = 'review.html');
  
  if (currentUser?.role === 'admin') showAdminDashboard();
}

function showAdminDashboard() {
  $('.card').first().after(`
    <div class="card admin-dashboard">
      <div class="card-header">
        <h2>Admin Dashboard</h2>
      </div>
      <div class="admin-stats">
        <div class="stat-card">
          <h3>Total Meetings</h3>
          <p id="total-meetings">0</p>
        </div>
        <div class="stat-card">
          <h3>Active Users</h3>
          <p id="active-users">0</p>
        </div>
      </div>
    </div>
  `);
  loadAdminStats();
}

function loadAdminStats() {
  const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
  
  $('#total-meetings').text(meetings.length);
  $('#active-users').text(users.length + adminUsers.length);
}

function loadUpcomingMeetings() {
  let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
  
  // Sort meetings by date (soonest first)
  meetings.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const $meetingsList = $('#upcoming-meetings');
  $meetingsList.empty();
  
  if (meetings.length === 0) {
    $meetingsList.html('<p>No upcoming meetings. Book one now!</p>');
    return;
  }
  
  meetings.forEach(meeting => {
    const isOrganizer = currentUser && 
      (currentUser.role === 'admin' || 
       meeting.organizer === `${currentUser.firstName} ${currentUser.lastName}`);
    
    // Find room details
    const room = rooms.find(r => r.id == meeting.room) || {};
    
    $meetingsList.append(`
      <div class="meeting-card" data-id="${meeting.id}">
        <h3>${meeting.title}</h3>
        <p><strong>Time:</strong> ${formatMeetingDateTime(meeting.date)} (${meeting.duration} mins)</p>
        <p><strong>Room:</strong> ${room.name || 'Unknown Room'} (Capacity: ${room.capacity || 'N/A'})</p>
        <p><strong>Organizer:</strong> ${meeting.organizer}</p>
        <div class="meeting-actions">
          <button class="btn btn-primary join-meeting" data-id="${meeting.id}">Join</button>
          ${isOrganizer ? `
            <button class="btn btn-warning edit-meeting" data-id="${meeting.id}">Edit</button>
          ` : ''}
          ${currentUser?.role === 'admin' ? `
            <button class="btn btn-danger cancel-meeting" data-id="${meeting.id}">Cancel</button>
          ` : ''}
        </div>
      </div>
    `);
  });
  
  $('.join-meeting').click(function() {
    window.location.href = `active-meeting.html?id=${$(this).data('id')}`;
  });
  
  $('.edit-meeting').click(function() {
    const meetingId = $(this).data('id');
    localStorage.setItem('editingMeetingId', meetingId);
    window.location.href = `booking.html?edit=${meetingId}`;
  });
  
  $('.cancel-meeting').click(function() {
    cancelMeeting($(this).data('id'));
  });
}

function cancelMeeting(meetingId) {
  showModal({
    title: 'Confirm Cancellation',
    message: 'Are you sure you want to cancel this meeting?',
    onConfirm: () => {
      let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
      meetings = meetings.filter(m => m.id != meetingId);
      localStorage.setItem('meetings', JSON.stringify(meetings));
      showToast('Meeting cancelled', 'success');
      loadUpcomingMeetings();
      if (currentUser?.role === 'admin') loadAdminStats();
    },
    showCancel: true,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });
}

function getRoomName(roomId) {
  const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
  const room = rooms.find(r => r.id == roomId);
  return room ? `${room.name} (${room.capacity})` : 'Unknown Room';
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