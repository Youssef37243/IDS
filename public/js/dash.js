// Add this function before initDashboard
function showAdminDashboard() {
  // Create admin dashboard section
  const adminSection = document.createElement('div');
  adminSection.className = 'card admin-dashboard';
  adminSection.innerHTML = `
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
        <h3>Available Rooms</h3>
        <p id="total-rooms"><i class="fas fa-spinner fa-spin"></i> Loading...</p>
      </div>
    </div>
  `;

  // Insert after the first card
  const firstCard = document.querySelector('.card');
  if (firstCard) {
    firstCard.parentNode.insertBefore(adminSection, firstCard.nextSibling);
  }

  // Load admin statistics
  loadAdminStats();
}

// Add this function to load admin statistics
async function loadAdminStats() {
  try {
    // Show loading states
    setAdminStat('total-meetings', '<i class="fas fa-spinner fa-spin"></i> Loading...');
    setAdminStat('active-users', '<i class="fas fa-spinner fa-spin"></i> Loading...');
    setAdminStat('total-rooms', '<i class="fas fa-spinner fa-spin"></i> Loading...');

    // Fetch all data in parallel
    const [meetingsRes, usersRes, roomsRes] = await Promise.all([
      fetch('/api/meetings', { headers: getAuthHeaders() }),
      fetch('/api/users', { headers: getAuthHeaders() }),
      fetch('/api/rooms', { headers: getAuthHeaders() })
    ]);

    if (!meetingsRes.ok || !usersRes.ok || !roomsRes.ok) {
      throw new Error('Failed to load admin statistics');
    }

    const [meetings, users, rooms] = await Promise.all([
      meetingsRes.json(),
      usersRes.json(),
      roomsRes.json()
    ]);

    // Update stats
    setAdminStat('total-meetings', meetings.length);
    setAdminStat('active-users', users.length);
    setAdminStat('total-rooms', rooms.length);

  } catch (error) {
    console.error('Error loading admin stats:', error);
    setAdminStat('total-meetings', 'Error');
    setAdminStat('active-users', 'Error');
    setAdminStat('total-rooms', 'Error');
  }
}

// Helper function to set admin stat values
function setAdminStat(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = typeof value === 'number' ? value : value;
  }
}

function initDashboard() {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    window.location.href = '/login';
    return;
  }

  // Hide quick actions for guests
  if (currentUser.role === 'guest') {
    const quickActions = document.querySelector('.quick-actions');
    if (quickActions) quickActions.style.display = 'none';
  }

  loadUpcomingMeetings();
  setupEventListeners();
  
  // Check if user is admin
  if (currentUser?.role === 'admin') {
    showAdminDashboard();
  }
}

async function loadUpcomingMeetings() {
  try {
    const response = await fetch('/api/meetings', { 
      headers: getAuthHeaders() 
    });
    
    if (!response.ok) throw new Error('Failed to load meetings');
    
    const meetings = await response.json();
    renderMeetings(meetings);
  } catch (error) {
    console.error('Error loading meetings:', error);
    const list = document.getElementById('upcoming-meetings');
    if (list) {
      list.innerHTML = '<p class="error">Failed to load meetings. Please try again.</p>';
    }
  }
}

function renderMeetings(meetings) {
  const list = document.getElementById('upcoming-meetings');
  if (!list) return;
  
  list.innerHTML = '';
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    list.innerHTML = '<p>Please log in to view meetings</p>';
    return;
  }

  // Filter meetings based on user role
  const now = new Date();
  let upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.end_time) > now);

  // For guests, only show meetings they're invited to
  if (currentUser.role === 'guest') {
    upcomingMeetings = upcomingMeetings.filter(meeting => 
      meeting.attendees?.some(a => a.user_id === currentUser.id)
    );
  }

  // Sort meetings
  upcomingMeetings.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  if (!upcomingMeetings.length) {
    const message = currentUser.role === 'guest' 
      ? 'No upcoming meetings you are invited to.' 
      : 'No upcoming meetings. Schedule one now!';
    list.innerHTML = `<p>${message}</p>`;
    return;
  }

  upcomingMeetings.forEach(meeting => {
    const meetingEl = createMeetingElement(meeting, currentUser);
    list.appendChild(meetingEl);
  });
}

function createMeetingElement(meeting, currentUser) {
  const isOrganizer = meeting.user_id === currentUser.id;
  const isAttendee = meeting.attendees?.some(a => a.user_id === currentUser.id);
  
  // For guests, they can only be attendees
  const showActions = currentUser.role !== 'guest' || isAttendee;
  
  const div = document.createElement('div');
  div.className = 'meeting-card';
  div.dataset.id = meeting.id;
  
  const startTime = new Date(meeting.start_time);
  const endTime = new Date(meeting.end_time);
  
  div.innerHTML = `
    <div class="meeting-header">
      <h3>${meeting.title}</h3>
      ${isOrganizer ? '<span class="badge organizer">Organizer</span>' : ''}
      ${isAttendee && !isOrganizer ? '<span class="badge attendee">Attendee</span>' : ''}
    </div>
    <div class="meeting-details">
      <p><i class="fas fa-clock"></i> ${formatMeetingDateTime(startTime)} - ${formatTime(endTime)}</p>
      <p><i class="fas fa-map-marker-alt"></i> ${meeting.room?.name || 'Unknown Room'}</p>
      <p><i class="fas fa-user"></i> Organized by: ${meeting.user?.first_name} ${meeting.user?.last_name}</p>
      ${meeting.agenda ? `<p><i class="fas fa-clipboard"></i> ${meeting.agenda}</p>` : ''}
    </div>
    ${showActions ? `
    <div class="meeting-actions">
      <button class="btn btn-primary join-meeting" data-id="${meeting.id}">
        <i class="fas fa-video"></i> Join
      </button>
      ${isOrganizer && currentUser.role !== 'guest' ? `
        <button class="btn btn-warning edit-meeting" data-id="${meeting.id}">
          <i class="fas fa-edit"></i> Edit
        </button>
      ` : ''}
      ${currentUser.role === 'admin' && isOrganizer ? `
        <button class="btn btn-danger cancel-meeting" data-id="${meeting.id}">
          <i class="fas fa-trash"></i> Cancel
        </button>
      ` : ''}
    </div>
    ` : ''}
  `;
  
  return div;
}

function setupEventListeners() {
  // Schedule meeting button
  const scheduleBtn = document.getElementById('schedule-meeting');
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', () => {
      window.location.href = '/booking';
    });
  }

  // View minutes button
  const minutesBtn = document.getElementById('view-minutes');
  if (minutesBtn) {
    minutesBtn.addEventListener('click', () => {
      window.location.href = '/minutes';
    });
  }

  // Meeting actions (delegated events)
  document.addEventListener('click', (e) => {
    const joinBtn = e.target.closest('.join-meeting');
    const editBtn = e.target.closest('.edit-meeting');
    const cancelBtn = e.target.closest('.cancel-meeting');
    
    if (joinBtn) {
      window.location.href = `/active-meeting?id=${joinBtn.dataset.id}`;
    }
    
    if (editBtn) {
      window.location.href = `/booking?edit=${editBtn.dataset.id}`;
    }
    
    if (cancelBtn) {
      showCancelConfirmation(cancelBtn.dataset.id);
    }
  });
}

function showCancelConfirmation(meetingId) {
  showModal({
    title: 'Confirm Cancellation',
    message: 'Are you sure you want to cancel this meeting?',
    confirmText: 'Yes, Cancel',
    cancelText: 'No, Keep It',
    showCancel: true,
    onConfirm: () => cancelMeeting(meetingId)
  });
}

async function cancelMeeting(meetingId) {
  try {
    showToast('Cancelling meeting...', 'info');
    
    const response = await fetch(`/api/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to cancel meeting');
    
    showToast('Meeting cancelled successfully', 'success');
    loadUpcomingMeetings();
    
    // Refresh admin stats if admin
    const currentUser = getCurrentUser();
    if (currentUser?.role === 'admin') {
      loadAdminStats();
    }
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    showToast('Failed to cancel meeting', 'error');
  }
}

function formatMeetingDateTime(date) {
  return date.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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

document.addEventListener('DOMContentLoaded', initDashboard);