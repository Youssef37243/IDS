  /**
   * SMART MEETING ROOM - COMMON SCRIPT
   * This file contains all the shared functionality across pages
   * including authentication, utilities, and base event handlers
   */

  // Global variables
  let currentUser = null;

  /* ========== UTILITY FUNCTIONS ========== */

  /**
   * Shows a simple modal dialog (replace with a proper modal library in production)
   * @param {Object} options - Modal configuration
   * @param {string} options.title - Modal title
   * @param {string} options.message - Modal message/content
   * @param {function} [options.onConfirm] - Callback when user confirms
   * @param {function} [options.onCancel] - Callback when user cancels
   * @param {string} [options.confirmText="OK"] - Confirm button text
   * @param {string} [options.cancelText="Cancel"] - Cancel button text
   * @param {boolean} [options.showCancel=false] - Whether to show cancel button
   */
  function showModal({ title, message, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancel", showCancel = false }) {
    // Simple modal implementation (replace with a real modal in production)
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
    
    // Confirm button handler
    document.getElementById('modal-confirm').onclick = () => {
      document.body.removeChild(modal);
      if (onConfirm) onConfirm();
    };
    
    // Cancel button handler (if shown)
    if (showCancel) {
      document.getElementById('modal-cancel').onclick = () => {
        document.body.removeChild(modal);
        if (onCancel) onCancel();
      };
    }
  }

  /**
   * Shows a temporary toast notification
   * @param {string} message - The message to display
   * @param {string} [type="success"] - The type of toast (success, info, error)
   */
  function showToast(message, type = "success") {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  }

  /* ========== AUTHENTICATION FUNCTIONS ========== */

  /**
   * Checks if a user is logged in by checking localStorage
   * Updates the currentUser variable if found
   */
  function checkAuth() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      currentUser = JSON.parse(userData);
      updateUIForUser();
    }
  }

  /**
   * Updates the UI based on the current user's role
   * Shows/hides elements based on authentication state
   */
  function updateUIForUser() {
    if (currentUser) {
      $('.auth-only').show();
      $('.guest-only').hide();
      
      // Show admin features if user is admin
      if (currentUser.role === 'admin') {
        $('.admin-only').show();
      } else {
        $('.admin-only').hide();
      }
      
      // Update user info in navbar
      $('#user-name').text(currentUser.firstName + ' ' + currentUser.lastName);
      $('#user-role').text(currentUser.role);
    } else {
      $('.auth-only').hide();
      $('.guest-only').show();
    }
  }

  /**
   * Attempts to log in a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {boolean} True if login successful, false otherwise
   */
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

  /**
 * Registers a new user
 * @param {Object} userData - User data to register
 * @returns {boolean} True if registration successful, false if email exists
 */
function register(userData) {
  let users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Check if user already exists
  if (users.some(u => u.email === userData.email)) {
    return false;
  }
  
  // Add source field to identify registered users
  userData.source = 'registered';
  
  users.push(userData);
  localStorage.setItem('users', JSON.stringify(users));
  return true;
}

// Update the register form submission handler
$('#register-form').submit(function(e) {
  e.preventDefault();
  const userData = {
    id: Date.now(),
    firstName: $('#first-name').val(),
    lastName: $('#last-name').val(),
    email: $('#reg-email').val(),
    password: $('#reg-password').val(),
    role: $('#role').val() || 'user' // Default to 'user' if not selected
  };
  
  if (register(userData)) {
    showToast('Registration successful! Please login.', 'success');
    setTimeout(() => window.location.href = 'index.html', 1000);
  } else {
    $('#register-error').removeClass('hidden').text('Email already registered');
  }
});

  /**
   * Logs out the current user
   */
  function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForUser();
  }

  /* ========== BASE EVENT HANDLERS ========== */

  /**
   * Document ready handler - sets up common event listeners
   */
  $(document).ready(function() {
    // Check authentication state on page load
    checkAuth();

    // Login form submission
    $('#login-form').submit(function(e) {
      e.preventDefault();
      const email = $('#email').val();
      const password = $('#password').val();
      
      if (login(email, password)) {
        showToast('Login successful!', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
      } else {
        $('#login-error').removeClass('hidden').text('Invalid email or password');
      }
    });


    // Logout button
    $('#logout-btn').click(function() {
      logout();
      showToast('Logged out successfully.', 'success');
      setTimeout(() => window.location.href = 'index.html', 1000);
    });

    // Forgot password handler
    $('#forgot-password').click(function(e) {
      e.preventDefault();
      showModal({
        title: 'Forgot Password',
        message: 'Enter your registered email:',
        onConfirm: () => showToast('Password reset link sent! (Demo only)', 'success')
      });
    });

    // Common cancel buttons
    $('#booking-form .btn-secondary').click(function(e) {
      e.preventDefault();
      window.location.href = 'dashboard.html';
    });

    $('#minutes-form .btn-danger').click(function(e) {
      e.preventDefault();
      window.location.href = 'dashboard.html';
    });

    // Initialize page-specific scripts if they exist
    if (typeof initDashboard === 'function') initDashboard();
    if (typeof initBooking === 'function') initBooking();
    if (typeof initActiveMeeting === 'function') initActiveMeeting();
    if (typeof initMinutes === 'function') initMinutes();
    if (typeof initReview === 'function') initReview();
    if (typeof initAdmin === 'function') initAdmin();
  });