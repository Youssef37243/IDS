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
    const showRoomsBtn = document.getElementById('show-rooms');
    const showUsersBtn = document.getElementById('show-users');
    const roomsSection = document.getElementById('rooms-section');
    const usersSection = document.getElementById('users-section');
  
    showRoomsBtn.addEventListener('click', () => {
      showRoomsBtn.classList.add('active', 'btn-primary');
      showRoomsBtn.classList.remove('btn-secondary');
      showUsersBtn.classList.remove('active', 'btn-primary');
      showUsersBtn.classList.add('btn-secondary');
      usersSection.classList.remove('active');
      roomsSection.classList.add('active');
    });
  
    showUsersBtn.addEventListener('click', () => {
      showUsersBtn.classList.add('active', 'btn-primary');
      showUsersBtn.classList.remove('btn-secondary');
      showRoomsBtn.classList.remove('active', 'btn-primary');
      showRoomsBtn.classList.add('btn-secondary');
      roomsSection.classList.remove('active');
      usersSection.classList.add('active');
    });
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
  
  document.addEventListener('DOMContentLoaded', initAdmin);
  