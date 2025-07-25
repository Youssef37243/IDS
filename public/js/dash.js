let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let currentMeetingIdToCancel = null;

function initDashboard() {
  currentUser = getCurrentUser(); // Refresh current user
  console.log('Current user:', currentUser);

  loadUpcomingMeetings();

  const scheduleBtn = document.getElementById('schedule-meeting');
  const minutesBtn = document.getElementById('view-minutes');

  if (scheduleBtn) scheduleBtn.addEventListener('click', () => window.location.href = '/booking');
  if (minutesBtn) minutesBtn.addEventListener('click', () => window.location.href = '/review');

  // Check if user is admin
  if (currentUser?.role === 'admin') {
    showAdminDashboard();
  }
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
        <p id="total-meetings"><i class="fas fa-spinner fa-spin"></i> Loading...</p>
      </div>
      <div class="stat-card">
        <h3>Active Users</h3>
        <p id="active-users"><i class="fas fa-spinner fa-spin"></i> Loading...</p>
      </div>
      <div class="stat-card">
        <h3>Rooms</h3>
        <p id="total-rooms"><i class="fas fa-spinner fa-spin"></i> Loading...</p>
      </div>
    </div>
  `;
  cards[0].parentNode.insertBefore(adminCard, cards[0].nextSibling);

  loadAdminStats();
}

function loadAdminStats() {
  // Show loading states
  document.getElementById('total-meetings').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  document.getElementById('active-users').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  document.getElementById('total-rooms').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

  // Fetch all data in parallel
  Promise.all([
    fetch('/api/meetings', { headers: getAuthHeaders() }),
    fetch('/api/users', { headers: getAuthHeaders() }),
    fetch('/api/rooms', { headers: getAuthHeaders() })
  ])
  .then(responses => Promise.all(responses.map(res => res.json())))
  .then(([meetings, users, rooms]) => {
    document.getElementById('total-meetings').textContent = meetings.length || 0;
    document.getElementById('active-users').textContent = users.length || 0;
    document.getElementById('total-rooms').textContent = rooms.length || 0;
  })
  .catch(err => {
    console.error('Error loading admin stats:', err);
    document.getElementById('total-meetings').textContent = 'Error';
    document.getElementById('active-users').textContent = 'Error';
    document.getElementById('total-rooms').textContent = 'Error';
  });
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

  const currentUser = getCurrentUser();
  if (!currentUser) {
    list.innerHTML = '<p>Please log in to view meetings</p>';
    return;
  }

  // Get users for organizer names
  const users = JSON.parse(localStorage.getItem('users')) || [];

  // Filter meetings where user is organizer or attendee
  const userMeetings = meetings.filter(meeting => 
    meeting.user_id === currentUser.id || 
    (meeting.attendees && meeting.attendees.includes(currentUser.id))
  );

  if (!userMeetings.length) {
    list.innerHTML = '<p>No upcoming meetings. Book one now!</p>';
    return;
  }

  userMeetings.forEach(meeting => {
    const room = rooms.find(r => r.id == meeting.room_id) || {};
    const organizer = users.find(u => u.id == meeting.user_id);
    const isOrganizer = currentUser.id === meeting.user_id;

    const div = document.createElement('div');
    div.className = 'meeting-card';
    div.dataset.id = meeting.id;
    div.innerHTML = `
      <h3>${meeting.title}</h3>
      <p><strong>Time:</strong> ${formatMeetingDateTime(meeting.start_time)} - ${formatMeetingDateTime(meeting.end_time)}</p>
      <p><strong>Room:</strong> ${room.name || 'Unknown Room'} (Capacity: ${room.capacity || 'N/A'}) (Location: ${room.location || 'N/A'})</p>
      <p><strong>Organizer:</strong> ${organizer ? `${organizer.first_name} ${organizer.last_name}` : 'Unknown'}</p>
      <div class="meeting-actions">
        <button class="btn btn-primary join-meeting" data-id="${meeting.id}">Join</button>
        ${isOrganizer ? `<button class="btn btn-warning edit-meeting" data-id="${meeting.id}">Edit</button>` : ''}
        ${currentUser.role === 'admin' ? `<button class="btn btn-danger cancel-meeting" data-id="${meeting.id}">Cancel</button>` : ''}
      </div>
    `;
    list.appendChild(div);
  });

  document.getElementById('upcoming-meetings').addEventListener('click', (e) => {
    const joinBtn = e.target.closest('.join-meeting');
    const editBtn = e.target.closest('.edit-meeting');
    const cancelBtn = e.target.closest('.cancel-meeting');
    
    if (joinBtn) {
      window.location.href = `/active-meeting?id=${joinBtn.dataset.id}`;
    }
    
    if (editBtn) {
      const meetingId = editBtn.dataset.id;
      window.location.href = `/booking?edit=${meetingId}`;
    }
    
    if (cancelBtn) {
      cancelMeeting(cancelBtn.dataset.id);
    }
  });
}

function cancelMeeting(meetingId) {
  currentMeetingIdToCancel = meetingId;
  
  // Show confirmation modal
  const modal = document.getElementById('confirmation-modal');
  const title = document.getElementById('confirmation-title');
  const message = document.getElementById('confirmation-message');
  
  if (modal && title && message) {
    title.textContent = 'Confirm Cancellation';
    message.textContent = 'Are you sure you want to cancel this meeting?';
    modal.style.display = 'block';
    
    // Set up event listeners for modal buttons
    document.getElementById('cancel-confirmation').onclick = () => {
      modal.style.display = 'none';
    };
    
    document.getElementById('confirm-action').onclick = () => {
      modal.style.display = 'none';
      confirmMeetingCancellation();
    };
    
    // Close when clicking outside modal
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  } else {
    // Fallback to browser confirm
    if (confirm('Are you sure you want to cancel this meeting?')) {
      confirmMeetingCancellation();
    }
  }
}

function confirmMeetingCancellation() {
  if (!currentMeetingIdToCancel) return;
  
  // Show loading state
  showToast('Cancelling meeting...', 'info');
  
  fetch(`/api/meetings/${currentMeetingIdToCancel}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  .then(response => {
    if (response.ok) {
      // Update local data
      let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
      meetings = meetings.filter(m => m.id != currentMeetingIdToCancel);
      localStorage.setItem('meetings', JSON.stringify(meetings));
      
      showToast('Meeting cancelled successfully', 'success');
      loadUpcomingMeetings();
      if (currentUser?.role === 'admin') loadAdminStats();
    } else {
      throw new Error('Failed to cancel meeting');
    }
  })
  .catch(error => {
    console.error('Error cancelling meeting:', error);
    showToast('Failed to cancel meeting', 'error');
  })
  .finally(() => {
    currentMeetingIdToCancel = null;
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
