let currentUser = null;

function showModal(options) {
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${options.title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>${options.message}</p>
        ${options.showInput ? `
          <input type="${options.inputType || 'text'}" 
                  id="modal-input" 
                  placeholder="${options.inputPlaceholder || ''}" 
                  class="form-control mt-3">
        ` : ''}
      </div>
      <div class="modal-actions">
        ${options.showCancel ? `
          <button id="modal-cancel" class="btn btn-secondary">${options.cancelText}</button>
        ` : ''}
        <button id="modal-confirm" class="btn btn-primary">${options.confirmText}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);

  // Close handlers
  const closeModal = () => {
    document.body.removeChild(modal);
    document.removeEventListener('keydown', handleKeyDown);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      if (options.onCancel) options.onCancel();
    }
  };

  // Close button
  modal.querySelector('.modal-close').addEventListener('click', () => {
    closeModal();
    if (options.onCancel) options.onCancel();
  });

  // Outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
      if (options.onCancel) options.onCancel();
    }
  });

  // Confirm button
  document.getElementById('modal-confirm').addEventListener('click', () => {
    const inputValue = options.showInput 
      ? document.getElementById('modal-input').value 
      : null;
    closeModal();
    if (options.onConfirm) options.onConfirm(inputValue);
  });

  // Cancel button
  if (options.showCancel) {
    document.getElementById('modal-cancel').addEventListener('click', () => {
      closeModal();
      if (options.onCancel) options.onCancel();
    });
  }

  // Keyboard support
  document.addEventListener('keydown', handleKeyDown);

  // Focus on input if present
  if (options.showInput) {
    setTimeout(() => {
      document.getElementById('modal-input').focus();
    }, 100);
  }
}

function showToast(message, type = "success") {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 
                     type === 'error' ? 'exclamation-circle' : 
                     'info-circle'}"></i>
    ${message}
  `;
  document.body.appendChild(toast);
  setTimeout(() => document.body.removeChild(toast), 3000);
}

/* ========== AUTHENTICATION FUNCTIONS ========== */

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

function updateUIForUser() {
  currentUser = getCurrentUser();
  const authOnly = document.querySelectorAll('.auth-only');
  const guestOnly = document.querySelectorAll('.guest-only');
  const adminOnly = document.querySelectorAll('.admin-only');

  if (currentUser) {
    authOnly.forEach(el => el.style.display = 'block');
    guestOnly.forEach(el => el.style.display = 'none');
    if (currentUser.role === 'admin') {
      adminOnly.forEach(el => el.style.display = 'block');
    } else {
      adminOnly.forEach(el => el.style.display = 'none');
    }
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    if (userName) userName.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
  } else {
    authOnly.forEach(el => el.style.display = 'none');
    guestOnly.forEach(el => el.style.display = 'block');
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');
  currentUser = null;
  window.location.href = '/login';
}

/* ========== BASE EVENT HANDLERS ========== */

document.addEventListener('DOMContentLoaded', function() {
  updateUIForUser();
  
  // Initialize page-specific scripts if they exist
  if (typeof initDashboard === 'function') initDashboard();
  if (typeof initActiveMeeting === 'function') initActiveMeeting();
  if (typeof initBooking === 'function') initBooking();
  if (typeof initMinutes === 'function') initMinutes();
  if (typeof initReview === 'function') initReview();
  if (typeof initAdmin === 'function') initAdmin();
});

