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
  loadRoomAvailability();
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
      ${currentUser.role === 'admin' && isOrganizer || currentUser.role === 'user' && isOrganizer ? `
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
    const roomCard = e.target.closest('.room-availability-card');
    const modalClose = e.target.closest('.modal-close');
    
    if (joinBtn) {
      window.location.href = `/active-meeting?id=${joinBtn.dataset.id}`;
    }
    
    if (editBtn) {
      window.location.href = `/booking?edit=${editBtn.dataset.id}`;
    }
    
    if (cancelBtn) {
      showCancelConfirmation(cancelBtn.dataset.id);
    }

    if (roomCard) {
      const roomId = roomCard.dataset.roomId;
      if (roomId) {
        showRoomAvailabilityDetails(roomId);
      }
    }

    if (modalClose) {
      const modal = modalClose.closest('.modal');
      if (modal) {
        modal.classList.add('hidden');
      }
    }
  });

  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.add('hidden');
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

// Room Availability Functions
async function loadRoomAvailability() {
  try {
    const periodSelect = document.getElementById('availability-period');
    const period = periodSelect ? periodSelect.value : 'week';
    
    const response = await fetch(`/api/rooms-availability?period=${period}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to load room availability');
    
    const data = await response.json();
    renderRoomAvailability(data);
  } catch (error) {
    console.error('Error loading room availability:', error);
    const grid = document.getElementById('room-availability-grid');
    if (grid) {
      grid.innerHTML = '<p class="error">Failed to load room availability. Please try again.</p>';
    }
  }
}

function renderRoomAvailability(data) {
  const grid = document.getElementById('room-availability-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  if (!data.rooms || data.rooms.length === 0) {
    grid.innerHTML = '<p>No rooms available.</p>';
    return;
  }

  data.rooms.forEach(roomData => {
    const room = roomData.room;
    const availability = roomData.availability_summary;
    
    // Calculate overall availability status
    const totalDays = Object.keys(availability).length;
    const availableDays = Object.values(availability).filter(day => day === 'Available all day').length;
    const availabilityPercentage = Math.round((availableDays / totalDays) * 100);
    
    let statusClass = 'high';
    if (availabilityPercentage < 30) statusClass = 'low';
    else if (availabilityPercentage < 70) statusClass = 'medium';
    
    const roomCard = document.createElement('div');
    roomCard.className = 'room-availability-card';
    roomCard.dataset.roomId = room.id;
    
    roomCard.innerHTML = `
      <div class="room-header">
        <h3>${room.name}</h3>
        <div class="availability-badge ${statusClass}">
          ${availabilityPercentage}% Available
        </div>
      </div>
      <div class="room-details">
        <p><i class="fas fa-map-marker-alt"></i> ${room.location || 'No location specified'}</p>
        <p><i class="fas fa-users"></i> Capacity: ${room.capacity}</p>
        ${room.feature ? `<p><i class="fas fa-star"></i> ${room.feature}</p>` : ''}
      </div>
      <div class="availability-preview">
        ${renderAvailabilityPreview(availability)}
      </div>
      <div class="room-actions">
        <button class="btn btn-primary">
          <i class="fas fa-eye"></i> View Details
        </button>
      </div>
    `;
    
    grid.appendChild(roomCard);
  });
}

function renderAvailabilityPreview(availability) {
  const days = Object.keys(availability).slice(0, 7); // Show first 7 days
  let preview = '<div class="availability-days">';
  
  days.forEach(day => {
    const dayData = availability[day];
    const isAvailable = dayData === 'Available all day';
    const dayName = new Date(day).toLocaleDateString('en', { weekday: 'short' });
    
    preview += `
      <div class="availability-day ${isAvailable ? 'available' : 'busy'}">
        <span class="day-name">${dayName}</span>
        <div class="day-status ${isAvailable ? 'available' : 'busy'}"></div>
      </div>
    `;
  });
  
  preview += '</div>';
  return preview;
}

async function showRoomAvailabilityDetails(roomId) {
  const modal = document.getElementById('room-availability-modal');
  const title = document.getElementById('room-availability-title');
  const details = document.getElementById('room-availability-details');
  
  if (!modal || !title || !details) return;
  
  // Show modal with loading state
  details.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading availability...</div>';
  modal.classList.remove('hidden');
  
  try {
    const periodSelect = document.getElementById('availability-period');
    const period = periodSelect ? periodSelect.value : 'week';
    
    const response = await fetch(`/api/rooms/${roomId}/availability?period=${period}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to load room details');
    
    const data = await response.json();
    
    title.textContent = `${data.room.name} - Availability Details`;
    renderRoomAvailabilityDetails(data, details);
    
  } catch (error) {
    console.error('Error loading room details:', error);
    details.innerHTML = '<p class="error">Failed to load room availability details. Please try again.</p>';
  }
}

function renderRoomAvailabilityDetails(data, container) {
  const { room, availability, period, start_date, end_date } = data;
  
  let html = `
    <div class="room-details-header">
      <h3>${room.name}</h3>
      <p><i class="fas fa-map-marker-alt"></i> ${room.location || 'No location specified'}</p>
      <p><i class="fas fa-users"></i> Capacity: ${room.capacity}</p>
      ${room.feature ? `<p><i class="fas fa-star"></i> ${room.feature}</p>` : ''}
    </div>
    <div class="availability-period">
      <p><strong>Period:</strong> ${period === 'week' ? 'Week' : 'Month'} 
      (${new Date(start_date).toLocaleDateString()} - ${new Date(end_date).toLocaleDateString()})</p>
    </div>
    <div class="availability-details">
  `;
  
  Object.keys(availability).forEach(date => {
    const dayData = availability[date];
    const dayName = new Date(date).toLocaleDateString('en', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
    
    html += `
      <div class="day-availability">
        <h4>${dayName}</h4>
    `;
    
    if (dayData === 'Available all day') {
      html += `<p class="available-all-day"><i class="fas fa-check-circle"></i> Available all day</p>`;
    } else if (Array.isArray(dayData)) {
      html += `<div class="busy-periods">`;
      dayData.forEach(period => {
        html += `
          <div class="busy-period">
            <span class="time-range">${period.start_time} - ${period.end_time}</span>
            <span class="meeting-title">${period.title}</span>
          </div>
        `;
      });
      html += `</div>`;
    }
    
    html += `</div>`;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initDashboard);