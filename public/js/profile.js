document.addEventListener('DOMContentLoaded', () => {
  let currentUser = null;

  // Fetch current user
  fetch('/api/profile', {
    method: 'GET',
    headers: getAuthHeaders()
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(response => {
      currentUser = response.user;

      document.getElementById('profile-first-name').value = currentUser.first_name || '';
      document.getElementById('profile-last-name').value = currentUser.last_name || '';
      document.getElementById('profile-email').value = currentUser.email || '';
    })
    .catch(() => {
      window.location.href = '/dashboard';
    });

  // Submit profile form
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const newFirstName = document.getElementById('profile-first-name').value.trim();
      const newLastName = document.getElementById('profile-last-name').value.trim();
      const newEmail = document.getElementById('profile-email').value.trim();
      const oldPassword = document.getElementById('profile-password-old').value;
      const newPassword = document.getElementById('profile-password-new').value;

      if (!newFirstName || !newLastName) {
        alert('First or last name empty, not saving.');
        return;
      }
      if (!newEmail) {
        alert('Email cannot be empty.');
        return;
      }

      const updateData = {
        first_name: newFirstName,
        last_name: newLastName,
        email: newEmail
      };

      if (oldPassword && newPassword) {
        updateData.old_password = oldPassword;
        updateData.password = newPassword;
      }

      fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updateData)
      })
        .then(res => {
          if (!res.ok) return res.json().then(data => Promise.reject(data));
          return res.json();
        })
        .then(updatedUser => {
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          document.getElementById('profile-password-old').value = '';
          document.getElementById('profile-password-new').value = '';
          alert('Profile updated successfully!');
        })
        .catch(err => {
          alert('Failed to update profile: ' + (err.message || 'Unknown error'));
        });
    });
  }
});

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = document.getElementById(toggle.dataset.target);
      const showIcon = toggle.querySelector('.eye-icon.show');
      const hideIcon = toggle.querySelector('.eye-icon.hide');

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      showIcon.style.display = isPassword ? 'none' : 'inline';
      hideIcon.style.display = isPassword ? 'inline' : 'none';
    });
  });