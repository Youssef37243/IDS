let currentUser = JSON.parse(localStorage.getItem('currentUser'));

function initDashboard() {
  console.log('Dashboard JS loaded');
  console.log('Current user:', currentUser);

  loadUpcomingMeetings();

  const scheduleBtn = document.getElementById('schedule-meeting');
  const minutesBtn = document.getElementById('view-minutes');

  if (scheduleBtn) scheduleBtn.addEventListener('click', () => window.location.href = '/booking');
  if (minutesBtn) minutesBtn.addEventListener('click', () => window.location.href = '/review');

  if (currentUser?.role === 'admin') showAdminDashboard();
}

function showAdminDashboard() {
  const cards = document.querySelectorAll('.card');
  if (!cards.length) return;

  const adminCard = document.createElement('div');
  adminCard.className = 'card admin-dashboard';
  adminCard.innerHTML = `
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
  `;
  cards[0].parentNode.insertBefore(adminCard, cards[0].nextSibling);

  loadAdminStats();
}

function loadAdminStats() {
  const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const users = JSON.parse(localStorage.getItem('users')) || [];

  document.getElementById('total-meetings').textContent = meetings.length;
  document.getElementById('active-users').textContent = users.length;
}

function loadUpcomingMeetings() {
  fetch('/api/meetings', { headers: getAuthHeaders() })
    .then(res => res.json())
    .then(meetings => {
      fetch('/api/rooms', { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(rooms => renderMeetings(meetings, rooms))
        .catch(() => renderMeetings(meetings, []));
    })
    .catch(() => renderMeetings([], []));
}

function renderMeetings(meetings, rooms) {
  meetings.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  const list = document.getElementById('upcoming-meetings');
  list.innerHTML = '';

  if (!meetings.length) {
    list.innerHTML = '<p>No upcoming meetings. Book one now!</p>';
    return;
  }

  meetings.forEach(meeting => {
    const room = rooms.find(r => r.id == meeting.room_id) || {};
    const isOrganizer = getCurrentUser() &&
      (getCurrentUser().role === 'admin' || meeting.user_id === getCurrentUser().id);

    const div = document.createElement('div');
    div.className = 'meeting-card';
    div.dataset.id = meeting.id;
    div.innerHTML = `
      <h3>${meeting.title}</h3>
      <p><strong>Time:</strong> ${formatMeetingDateTime(meeting.start_time)} - ${formatMeetingDateTime(meeting.end_time)}</p>
      <p><strong>Room:</strong> ${room.name || 'Unknown Room'} (Capacity: ${room.capacity || 'N/A'})</p>
      <p><strong>Organizer:</strong> ${meeting.user_id}</p>
      <div class="meeting-actions">
        <button class="btn btn-primary join-meeting" data-id="${meeting.id}">Join</button>
        ${isOrganizer ? `<button class="btn btn-warning edit-meeting" data-id="${meeting.id}">Edit</button>` : ''}
        ${getCurrentUser()?.role === 'admin' ? `<button class="btn btn-danger cancel-meeting" data-id="${meeting.id}">Cancel</button>` : ''}
      </div>
    `;
    list.appendChild(div);
  });

  document.querySelectorAll('.join-meeting').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = `/active-meeting?id=${btn.dataset.id}`;
    });
  });

  document.querySelectorAll('.edit-meeting').forEach(btn => {
    btn.addEventListener('click', () => {
      const meetingId = btn.dataset.id;
      window.location.href = `/booking?edit=${meetingId}`;
    });
  });

  document.querySelectorAll('.cancel-meeting').forEach(btn => {
    btn.addEventListener('click', () => {
      cancelMeeting(btn.dataset.id);
    });
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

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// WAIT FOR BUTTONS TO EXIST BEFORE RUNNING initDashboard
document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver(() => {
    const scheduleBtn = document.getElementById('schedule-meeting');
    const minutesBtn = document.getElementById('view-minutes');
    if (scheduleBtn && minutesBtn) {
      observer.disconnect();
      initDashboard();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
