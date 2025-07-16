/**
 * SMART MEETING ROOM - COMMON SCRIPT (PURE JS VERSION)
 */

// Global variables
let currentUser = null;

/* ========== UTILITY FUNCTIONS ========== */

function showModal({ title, message, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancel", showCancel = false }) {
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button id="modal-confirm">${confirmText}</button>
        ${showCancel ? `<button id="modal-cancel">${cancelText}</button>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('modal-confirm').onclick = () => {
    document.body.removeChild(modal);
    if (onConfirm) onConfirm();
  };

  if (showCancel) {
    document.getElementById('modal-cancel').onclick = () => {
      document.body.removeChild(modal);
      if (onCancel) onCancel();
    };
  }
}

function showToast(message, type = "success") {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
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
    if (userRole) userRole.textContent = currentUser.role;
  } else {
    authOnly.forEach(el => el.style.display = 'none');
    guestOnly.forEach(el => el.style.display = 'block');
  }
}

function login(email, password) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateUIForUser();
    return true;
  }
  return false;
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateUIForUser();
}

/* ========== BASE EVENT HANDLERS ========== */

document.addEventListener('DOMContentLoaded', function () {
  updateUIForUser();

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      if (login(email, password)) {
        showToast('Login successful!', 'success');
        setTimeout(() => window.location.href = '/dashboard', 1000);
      } else {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
          errorDiv.classList.remove('hidden');
          errorDiv.textContent = 'Invalid email or password';
        }
      }
    });
  }

  const forgotPassword = document.getElementById('forgot-password');
  if (forgotPassword) {
    forgotPassword.addEventListener('click', function (e) {
      e.preventDefault();
      showModal({
        title: 'Forgot Password',
        message: 'Enter your registered email:',
        onConfirm: () => showToast('Password reset link sent! (Demo only)', 'success')
      });
    });
  }

  const cancelButtons = document.querySelectorAll('#booking-form .btn-secondary, #minutes-form .btn-danger');
  cancelButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = '/dashboard';
    });
  });

  if (typeof initDashboard === 'function') initDashboard();
  if (typeof initBooking === 'function') initBooking();
  if (typeof initActiveMeeting === 'function') initActiveMeeting();
  if (typeof initMinutes === 'function') initMinutes();
  if (typeof initReview === 'function') initReview();
  if (typeof initAdmin === 'function') initAdmin();
});
