document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
  
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent default form submit
  
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const loginError = document.getElementById('login-error');
  
      const email = emailInput ? emailInput.value : '';
      const password = passwordInput ? passwordInput.value : '';
  
      console.log('Email:', email, 'Password:', password);
  
      // Clear previous error
      if (loginError) {
        loginError.textContent = '';
        loginError.classList.add('hidden');
      }
  
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          let errorMsg = errorData.message || 'Login failed.';
          throw new Error(errorMsg);
        }
  
        const data = await response.json();
  
        console.log('Login success:', data);
                  // After successful login
localStorage.setItem('currentUser', JSON.stringify(response.user));
localStorage.setItem('token', response.token); // Don't forget the token
  
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
  
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
  
          const role = data.user.role;
          console.log('User role:', role);
  
          if (role === 'admin') {
            redirectWithFallback('/dashboard');
          } else if (role === 'guest') {
            redirectWithFallback('/guest-dashboard');
          } else {
            redirectWithFallback('/dashboard');
          }
        } else {
          // Fallback redirect
          redirectWithFallback('/dashboard');
        }
  
      } catch (error) {
        console.error('Login error:', error);
  
        if (loginError) {
          loginError.textContent = error.message || 'Login failed.';
          loginError.classList.remove('hidden');
        }
      }
    });
  });
  
  function redirectWithFallback(path) {
    window.location.replace(path);
  
    setTimeout(() => {
      if (window.location.pathname !== path) {
        showRedirectFallback(path);
      }
    }, 1000);
  }
  
  function showRedirectFallback(path) {
    let fallback = document.getElementById('redirect-fallback');
    if (!fallback) {
      fallback = document.createElement('div');
      fallback.id = 'redirect-fallback';
      fallback.style.margin = '20px';
      fallback.style.color = 'red';
      fallback.style.fontWeight = 'bold';
      fallback.innerHTML = `If you are not redirected, <a href='${path}'>click here to continue</a>.`;
      document.body.appendChild(fallback);
    }
  }
