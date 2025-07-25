document.addEventListener('DOMContentLoaded', () => {
  let currentUser = null;

  // Improved helper function to safely get input value
  const getInputValue = (id) => {
    const element = document.getElementById(id);
    if (!element || element.value === undefined || element.value === null) return null;
    const value = element.value.trim();
    return value === "" ? null : value;
  };

  // Fetch current user profile
  fetch('/api/profile', {
    method: 'GET',
    headers: getAuthHeaders()
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    })
    .then(response => {
      console.log('API response:', response); // Add this
      if (!response || !response.user) throw new Error('Invalid user data');
      
      currentUser = response.user;
      
      // Set initial form values
      const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.value = value || '';
      };
      
      setValue('profile-first-name', currentUser.first_name);
      setValue('profile-last-name', currentUser.last_name);
      setValue('profile-email', currentUser.email);
      setValue('profile-password-old', '');
      setValue('profile-password-new', '');
    })
    .catch((error) => {
      console.error('Profile load error:', error);
      showToast('Failed to load profile data', 'error');
      window.location.href = '/dashboard';
    });

  // Handle form submission
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const saveBtn = document.getElementById('save-changes-btn');
      if (!saveBtn) return;
      
      // Disable button during submission
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      try {
        // Get current values
        const newFirstName = getInputValue('profile-first-name');
        const newLastName = getInputValue('profile-last-name');
        const newEmail = getInputValue('profile-email');
        const oldPassword = getInputValue('profile-password-old');
        const newPassword = getInputValue('profile-password-new');

        // Prepare update data
        const updateData = {
          first_name: newFirstName || currentUser.first_name,
          last_name: newLastName || currentUser.last_name,
          email: newEmail || currentUser.email
      };

        // Handle password change
        if (oldPassword || newPassword) {
          if (!oldPassword || !newPassword) {
            throw new Error('Both current and new passwords are required');
          }
          updateData.old_password = oldPassword;
          updateData.password = newPassword;
          updateData.password_confirmation = newPassword;
        }

        console.log('First Name:', newFirstName);
        console.log('Last Name:', newLastName);
        console.log('Email:', newEmail);
        console.log('Old Password:', oldPassword);
        console.log('New Password:', newPassword);

        console.log('Setting values:', {
          firstName: currentUser.first_name,
          lastName: currentUser.last_name,
          email: currentUser.email
        });

        console.log('Current form values:', {
  firstName: document.getElementById('profile-first-name').value,
  lastName: document.getElementById('profile-last-name').value,
  email: document.getElementById('profile-email').value
});
        
        console.log('Submitting update:', updateData); // Debug log

       // Now check if anything actually changed
const hasChanges = Object.keys(updateData).some(key => {
  return updateData[key] !== currentUser[key];
});

if (!hasChanges) {
  showToast('No changes to save', 'info');
  return;
}

        // Verify user session
        if (!currentUser?.id) {
          throw new Error('Session expired. Please login again.');
        }

        // Send update request
        const response = await fetch(`/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(updateData)
        });

        // Handle response
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Update failed');
        }

        const result = await response.json();
        
        // Update local user data
        if (result.data) {
          localStorage.setItem('currentUser', JSON.stringify(result.data));
        }

        // Clear password fields
        ['profile-password-old', 'profile-password-new'].forEach(id => {
          const field = document.getElementById(id);
          if (field) field.value = '';
        });

        showToast('Profile updated successfully!', 'success');
        
        // Refresh UI if needed
        if (typeof updateUIForUser === 'function') {
          updateUIForUser();
        }
      } catch (error) {
        console.error('Update error:', error);
        showToast(error.message || 'Failed to update profile', 'error');
      } finally {
        // Re-enable button
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      }
    });
  }

  // Password visibility toggle
  document.querySelectorAll('.toggle-password').forEach(toggle => {
    if (!toggle) return;
    
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('data-target');
      if (!targetId) return;
      
      const input = document.getElementById(targetId);
      if (!input) return;

      // Toggle input type
      input.type = input.type === 'password' ? 'text' : 'password';

      // Toggle eye icons
      const showIcon = toggle.querySelector('.eye-icon.show');
      const hideIcon = toggle.querySelector('.eye-icon.hide');
      
      if (showIcon) showIcon.style.display = input.type === 'password' ? 'none' : 'inline';
      if (hideIcon) hideIcon.style.display = input.type === 'password' ? 'inline' : 'none';
    });
  });

  // Initialize hide icons
  document.querySelectorAll('.eye-icon.hide').forEach(icon => {
    if (icon) icon.style.display = 'none';
  });
});

// Helper function for auth headers
function getAuthHeaders() {
  try {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  } catch (error) {
    console.error('Error getting auth token:', error);
    return {};
  }
}