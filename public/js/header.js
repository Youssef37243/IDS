fetch('/api/profile', {
  method: 'GET',
  headers: getAuthHeaders()
})
  .then(res => res.ok ? res.json() : Promise.reject())
  .then(data => {
    const currentUser = data.user;
    renderHeader(currentUser);
  })
  .catch(() => renderHeader(null));

function renderHeader(currentUser) {
  fetch('/header')
    .then(response => response.text())
    .then(html => {
      document.getElementById('header').innerHTML = html;

      // Give time for the HTML to render
      setTimeout(() => {
        const burger = document.getElementById('burger');
        const nav = document.getElementById('nav');

        if (currentUser) {
          // Remove admin-only <li> if user is not admin
          if (currentUser.role !== 'admin') {
            const adminLi = nav?.querySelector('.admin-only');
            if (adminLi) adminLi.remove();
          }

          // Insert Profile link before Logout for ALL authenticated users
          const logoutBtn = document.getElementById('logout-btn');
          const logoutLi = logoutBtn?.closest('li');
          if (logoutLi) {
            const profileLi = document.createElement('li');
            profileLi.className = 'auth-only'; // Add auth-only class
            profileLi.innerHTML = `<a href="#" id="profile-link"><i class="fas fa-user"></i> Profile</a>`;
            logoutLi.parentNode.insertBefore(profileLi, logoutLi);
          }
        }

        if (burger && nav) {
          // Burger menu toggle
          burger.addEventListener('click', () => {
            nav.classList.toggle('show');
          });

          // Highlight active link & save
          const links = nav.querySelectorAll('a');
          links.forEach(link => {
            if (link.href === localStorage.getItem('activeHeaderLink')) {
              link.classList.add('clicked');
            }
            link.addEventListener('click', () => {
              localStorage.setItem('activeHeaderLink', link.href);
            });
          });

          // Logout button
          const logoutBtn = document.getElementById('logout-btn');
          if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
              e.preventDefault();
              const logoutModal = document.getElementById('logout-modal');
              if (logoutModal) logoutModal.style.display = 'block';
            });
          }

          // Logout modal controls
          const logoutModal = document.getElementById('logout-modal');
          const closeBtn = document.getElementById('close-logout-modal');
          const cancelBtn = document.getElementById('cancel-logout');
          const confirmBtn = document.getElementById('confirm-logout');

          if (logoutModal && closeBtn && cancelBtn && confirmBtn) {
            const closeModal = () => logoutModal.style.display = 'none';

            closeBtn.onclick = closeModal;
            cancelBtn.onclick = closeModal;

            confirmBtn.onclick = () => {
                logoutModal.style.display = 'none';

                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                currentUser = null;
                window.location.href = '/login';
            };

            // Hide modal if click outside
            window.addEventListener('click', event => {
              if (event.target === logoutModal) {
                logoutModal.style.display = 'none';
              }
            });
          }
        }

        // Profile redirection for ALL authenticated users
        if (currentUser) {
          const profileLink = document.getElementById('profile-link');
          if (profileLink) {
            profileLink.addEventListener('click', function (e) {
              e.preventDefault();
              window.location.href = '/profile';
            });
          }
        }

      }, 100);
    });
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}
