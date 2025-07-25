<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Meeting Room - Login</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header role="banner">
    <div class="container header-container">
      <div class="logo">
        <img src="{{ asset('images/logo.png') }}" alt="Smart Meeting Room Logo">
        <h1>Smart Meeting Room</h1>
      </div>
    </div>
  </header>

  <main class="container" id="main-content" tabindex="-1">
    <div class="card login-card-wrapper">
      <div class="card-header">
        <h2>Login</h2>
      </div>
      <form id="login-form" aria-label="Login Form" autocomplete="on">
        <div id="login-error" class="alert alert-danger hidden" aria-live="polite"></div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" class="form-control" required autocomplete="username" aria-required="true">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" class="form-control" required autocomplete="current-password" aria-required="true">
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Login</button>
        </div>
        <div class="form-group text-center">
          <a href="#" id="forgot-password">Forgot Password?</a>
        </div>
      </form>
    </div>
  </main>

  <!-- Toast and Modal Containers -->
  <div id="toast-container" aria-live="polite" aria-atomic="true"></div>
  <div id="modal-container"></div>

  <script src="{{ asset('js/login.js') }}"></script>
</body>
</html>