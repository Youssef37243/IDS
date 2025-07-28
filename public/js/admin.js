// Add these at the top of your admin.js
let currentModalCallback = null;

function initModal() {
  const modal = document.getElementById('confirmation-modal');
  if (!modal) return;

  // Close modal when clicking X
  document.getElementById('close-confirmation-modal').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close modal when clicking Cancel
  document.getElementById('cancel-confirmation').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Handle confirm action
  document.getElementById('confirm-action').addEventListener('click', () => {
    modal.style.display = 'none';
    if (currentModalCallback) {
      currentModalCallback();
      currentModalCallback = null;
    }
  });

  // Close when clicking outside modal
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

function showModal(options) {
  const modal = document.getElementById('confirmation-modal');
  if (!modal) {
    // Fallback to browser confirm if modal doesn't exist
    if (confirm(options.message)) {
      options.onConfirm();
    }
    return;
  }

  // Set modal content
  document.getElementById('confirmation-title').textContent = options.title;
  document.getElementById('confirmation-message').textContent = options.message;
  
  // Update confirm button text if provided
  if (options.confirmText) {
    document.getElementById('confirm-action').textContent = options.confirmText;
  } else {
    document.getElementById('confirm-action').textContent = 'Delete';
  }

  // Store the callback
  currentModalCallback = options.onConfirm;

  // Show modal
  modal.style.display = 'block';
}

// Initialize the modal when the page loads
document.addEventListener('DOMContentLoaded', () => {
  initModal();
  initAdmin(); // Make sure this comes after initModal
});


function initAdmin() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
  
    setupTabs();
    loadRooms();
    loadUsers();
    setupForms();
  }
  
  function setupTabs() {
    const showDashboardBtn = document.getElementById('show-dashboard');
    const showRoomsBtn = document.getElementById('show-rooms');
    const showUsersBtn = document.getElementById('show-users');
    const dashboardSection = document.getElementById('dashboard-section');
    const roomsSection = document.getElementById('rooms-section');
    const usersSection = document.getElementById('users-section');

    function switchToTab(activeBtn, activeSectionId) {
      // Remove active state from all buttons
      [showDashboardBtn, showRoomsBtn, showUsersBtn].forEach(btn => {
        btn.classList.remove('active', 'btn-primary');
        btn.classList.add('btn-secondary');
      });
      
      // Remove active state from all sections
      [dashboardSection, roomsSection, usersSection].forEach(section => {
        section.classList.remove('active');
      });
      
      // Activate the selected button and section
      activeBtn.classList.add('active', 'btn-primary');
      activeBtn.classList.remove('btn-secondary');
      document.getElementById(activeSectionId).classList.add('active');
    }
  
    showDashboardBtn.addEventListener('click', () => {
      switchToTab(showDashboardBtn, 'dashboard-section');
      loadDashboardData();
    });
  
    showRoomsBtn.addEventListener('click', () => {
      switchToTab(showRoomsBtn, 'rooms-section');
    });
  
    showUsersBtn.addEventListener('click', () => {
      switchToTab(showUsersBtn, 'users-section');
    });
    
    // Load dashboard data on page load
    loadDashboardData();
  }
  
  let roomFormInitialized = false;

  function setupForms() {
    const roomForm = document.getElementById('add-room-form');
    if (!roomFormInitialized && roomForm) {
      roomFormInitialized = true;
    roomForm.addEventListener('submit', e => {
      console.log('Room form submitted');
      e.preventDefault();
      // In setupForms() function, modify the room object creation:
      const equipment = Array.from(document.querySelectorAll('input[name="equipment"]:checked')).map(el => el.value);
      const room = {
        name: document.getElementById('room-name').value.trim(),
        capacity: parseInt(document.getElementById('room-capacity').value),
        location: document.getElementById('room-location').value.trim(),
        feature: equipment.length > 0 ? equipment.join(', ') : 'None' // This ensures 'None' is stored if no equipment checked
      };
  
      if (!room.name || isNaN(room.capacity) || !room.location) {
        showToast('Please fill all required fields', 'error');
        return;
      }
  
      fetch('/api/rooms', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
      })
      .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
      .then(() => {
        showToast('Room added!', 'success');
        roomForm.reset();
        loadRooms();
      })
      .catch(err => {
        showToast('Failed to add room: ' + (err?.message || 'Unknown error'), 'error');
      });
    });
  
    // User form
    const userForm = document.getElementById('add-user-form');
    userForm.addEventListener('submit', e => {
      e.preventDefault();
      const user = {
        first_name: document.getElementById('user-first-name').value.trim(),
        last_name: document.getElementById('user-last-name').value.trim(),
        email: document.getElementById('user-email').value.trim(),
        password: document.getElementById('user-password').value,
        role: document.getElementById('user-role').value
      };
  
      if (!user.first_name || !user.last_name || !user.email || !user.password) {
        showToast('Please fill all required fields', 'error');
        return;
      }
  
      fetch('/api/users', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      })
      .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
      .then(() => {
        showToast('User added!', 'success');
        userForm.reset();
        loadUsers();
      })
      .catch(err => {
        showToast('Failed to add user: ' + "Password must be at least 8 characters long or Email Used", 'error');
      }, 10000);
    });
  }
}
  
  function loadRooms() {
  fetch('/api/rooms', { headers: getAuthHeaders() })
    .then(res => res.json())
    .then(rooms => {
      const table = document.getElementById('rooms-table');
      table.innerHTML = '';

      if (!rooms.length) {
        table.innerHTML = `<tr><td colspan="5" class="text-center">No rooms yet</td></tr>`;
        return;
      }

      rooms.forEach(room => {
        const row = document.createElement('tr');
        row.dataset.id = room.id;
        row.innerHTML = `
          <td>${room.name}</td>
          <td>${room.capacity}</td>
          <td>${room.location}</td>
          <td>${room.feature || 'None'}</td> <!-- Display 'None' if feature is empty -->
          <td><button class="btn btn-danger btn-sm delete-room">Delete</button></td>
        `;
        table.appendChild(row);

        row.querySelector('.delete-room').addEventListener('click', () => {
          deleteRoom(room.id);
        });
      });
    })
    .catch(() => {
      document.getElementById('rooms-table').innerHTML = '<tr><td colspan="5" class="text-center">Failed to load rooms</td></tr>';
    });
}
  
  function loadUsers() {
    fetch('/api/users', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(response => {
        const users = response.data || response;
        const table = document.getElementById('users-table');
        table.innerHTML = '';
  
        if (!users.length) {
          table.innerHTML = `<tr><td colspan="4" class="text-center">No users yet</td></tr>`;
          return;
        }
  
        users.forEach(user => {
          const row = document.createElement('tr');
          row.dataset.id = user.id;
          row.innerHTML = `
            <td>${user.first_name} ${user.last_name}</td>
            <td>${user.email}</td>
            <td>${user.role || 'user'}</td>
            <td><button class="btn btn-danger btn-sm delete-user">Delete</button></td>
          `;
          table.appendChild(row);
  
          row.querySelector('.delete-user').addEventListener('click', () => {
            deleteUser(user.id);
          });
        });
      })
      .catch(() => {
        document.getElementById('users-table').innerHTML = '<tr><td colspan="4" class="text-center">Failed to load users</td></tr>';
      });
  }
  
function deleteRoom(roomId) {
  showModal({
    title: 'Delete Room',
    message: 'Are you sure? This will cancel all meetings in this room.',
    onConfirm: () => {
      fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      .then(res => {
        if (!res.ok) return res.json().then(err => Promise.reject(err));
        showToast('Room deleted!', 'success');
        loadRooms();
      })
      .catch(err => {
        showToast('Failed to delete room: ' + (err?.message || 'Unknown error'), 'error');
      });
    }
  });
}

function deleteUser(userId) {
  const currentUser = getCurrentUser();
  if (currentUser.id === userId) {
    showToast("Can't delete your own account!", 'error');
    return;
  }

  showModal({
    title: 'Delete User',
    message: 'Are you sure? This will cancel all their meetings.',
    onConfirm: () => {
      fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      .then(res => {
        if (!res.ok) return res.json().then(err => Promise.reject(err));
        showToast('User deleted!', 'success');
        loadUsers();
      })
      .catch(err => {
        showToast('Failed to delete user: ' + (err?.message || 'Unknown error'), 'error');
      });
    }
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
  
  // Dashboard functions
  function loadDashboardData() {
    loadBasicStats();
    loadWeeklySummary();
    loadMonthlySummary();
    loadMostUsedRooms();
    loadUserActivity();
    setupDashboardEventListeners();
  }

  function loadBasicStats() {
    fetch('/api/admin/stats', {
      headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById('total-meetings').textContent = data.total_meetings || '0';
      document.getElementById('active-users').textContent = data.active_users || '0';
      document.getElementById('total-rooms').textContent = data.total_rooms || '0';
    })
    .catch(err => {
      console.error('Failed to load basic stats:', err);
    });

    // Load dashboard overview
    fetch('/api/admin/dashboard', {
      headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
      if (data.overview) {
        document.getElementById('recent-meetings').textContent = data.overview.recent_meetings || '0';
      }
    })
    .catch(err => {
      console.error('Failed to load dashboard overview:', err);
    });
  }

  function loadWeeklySummary() {
    const weeks = document.getElementById('weeks-select')?.value || 4;
    fetch(`/api/admin/meetings/weekly-summary?weeks=${weeks}`, {
      headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
      displayWeeklySummary(data);
    })
    .catch(err => {
      console.error('Failed to load weekly summary:', err);
      document.getElementById('weekly-summary').innerHTML = '<p class="error">Failed to load weekly summary</p>';
    });
  }

  function loadMonthlySummary() {
    const months = document.getElementById('months-select')?.value || 6;
    fetch(`/api/admin/meetings/monthly-summary?months=${months}`, {
      headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
      displayMonthlySummary(data);
    })
    .catch(err => {
      console.error('Failed to load monthly summary:', err);
      document.getElementById('monthly-summary').innerHTML = '<p class="error">Failed to load monthly summary</p>';
    });
  }

  function loadMostUsedRooms() {
    const days = document.getElementById('room-days-select')?.value || 30;
    const limit = document.getElementById('room-limit-select')?.value || 10;
    fetch(`/api/admin/rooms/most-used?days=${days}&limit=${limit}`, {
      headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
      displayMostUsedRooms(data);
    })
    .catch(err => {
      console.error('Failed to load room usage:', err);
      document.getElementById('room-usage-content').innerHTML = '<p class="error">Failed to load room usage data</p>';
    });
  }

  function loadUserActivity() {
    fetch('/api/admin/dashboard', {
      headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
      displayUserActivity(data.most_active_users);
    })
    .catch(err => {
      console.error('Failed to load user activity:', err);
      document.getElementById('user-activity-content').innerHTML = '<p class="error">Failed to load user activity data</p>';
    });
  }

  function displayWeeklySummary(data) {
    const container = document.getElementById('weekly-summary');
    if (!data.weekly_summary || data.weekly_summary.length === 0) {
      container.innerHTML = '<p>No meetings found for the selected period.</p>';
      return;
    }

    let html = '<table class="summary-table"><thead><tr><th>Week</th><th>Meetings</th></tr></thead><tbody>';
    data.weekly_summary.forEach(week => {
      html += `<tr>
        <td>${week.week_start} to ${week.week_end}</td>
        <td class="number">${week.meeting_count}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    html += `<p class="summary-info">Total: ${data.weekly_summary.reduce((sum, week) => sum + week.meeting_count, 0)} meetings over ${data.total_weeks} weeks</p>`;
    
    container.innerHTML = html;
  }

  function displayMonthlySummary(data) {
    const container = document.getElementById('monthly-summary');
    if (!data.monthly_summary || data.monthly_summary.length === 0) {
      container.innerHTML = '<p>No meetings found for the selected period.</p>';
      return;
    }

    let html = '<table class="summary-table"><thead><tr><th>Month</th><th>Meetings</th></tr></thead><tbody>';
    data.monthly_summary.forEach(month => {
      html += `<tr>
        <td>${month.month_name}</td>
        <td class="number">${month.meeting_count}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    html += `<p class="summary-info">Total: ${data.monthly_summary.reduce((sum, month) => sum + month.meeting_count, 0)} meetings over ${data.total_months} months</p>`;
    
    container.innerHTML = html;
  }

  function displayMostUsedRooms(data) {
    const container = document.getElementById('room-usage-content');
    if (!data.most_used_rooms || data.most_used_rooms.length === 0) {
      container.innerHTML = '<p>No room usage data found for the selected period.</p>';
      return;
    }

    let html = '<table class="usage-table"><thead><tr><th>Rank</th><th>Room</th><th>Location</th><th>Meetings</th><th>Total Hours</th><th>Avg Duration</th><th>Score</th></tr></thead><tbody>';
    data.most_used_rooms.forEach((room, index) => {
      html += `<tr>
        <td class="rank">#${index + 1}</td>
        <td><strong>${room.name}</strong><br><small>Capacity: ${room.capacity}</small></td>
        <td>${room.location}</td>
        <td class="number">${room.meeting_count}</td>
        <td class="number">${room.total_hours}h</td>
        <td class="number">${room.avg_meeting_duration_minutes}m</td>
        <td class="score">${room.utilization_score}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    html += `<p class="summary-info">Analysis period: ${data.period} | Total rooms: ${data.total_rooms_analyzed}</p>`;
    
    container.innerHTML = html;
  }

  function displayUserActivity(users) {
    const container = document.getElementById('user-activity-content');
    if (!users || users.length === 0) {
      container.innerHTML = '<p>No user activity data available.</p>';
      return;
    }

    let html = '<table class="activity-table"><thead><tr><th>Rank</th><th>User</th><th>Email</th><th>Meetings</th></tr></thead><tbody>';
    users.forEach((user, index) => {
      html += `<tr>
        <td class="rank">#${index + 1}</td>
        <td>${user.first_name} ${user.last_name}</td>
        <td>${user.email}</td>
        <td class="number">${user.meeting_count}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    
    container.innerHTML = html;
  }

  function setupDashboardEventListeners() {
    // Refresh buttons
    document.getElementById('refresh-weekly')?.addEventListener('click', loadWeeklySummary);
    document.getElementById('refresh-monthly')?.addEventListener('click', loadMonthlySummary);
    document.getElementById('refresh-rooms')?.addEventListener('click', loadMostUsedRooms);

    // Dropdown change listeners
    document.getElementById('weeks-select')?.addEventListener('change', loadWeeklySummary);
    document.getElementById('months-select')?.addEventListener('change', loadMonthlySummary);
    document.getElementById('room-days-select')?.addEventListener('change', loadMostUsedRooms);
    document.getElementById('room-limit-select')?.addEventListener('change', loadMostUsedRooms);
  }

  document.addEventListener('DOMContentLoaded', initAdmin);
  