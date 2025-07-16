<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <title>Header</title>
</head>
<body>
    <header>
<div class="container header-container">
    <div class="logo">
    <img src="{{ asset('images/logo.png') }}" alt="Smart Meeting Room Logo">
    <h1>Smart Meeting Room</h1>
    </div>
    <div class="burger" id="burger">
    <i class="fas fa-bars"></i>
    </div>
    <nav id="nav">
    <ul>
        <li class="auth-only"><a href="/dashboard"><i class="fas fa-home"></i> Dashboard</a></li>
        <li class="auth-only"><a href="/booking"><i class="fas fa-calendar-plus"></i> Book Meeting</a></li>
        <li class="auth-only"><a href="/review"><i class="fas fa-file-alt"></i> Minutes</a></li>
        <li class="admin-only"><a href="/admin"><i class="fas fa-cog"></i> Admin</a></li>
        <li class="auth-only"><a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    </ul>
    </nav>
</div>
</header>
<!-- Profile Modal -->
<div id="profile-modal" class="modal" style="display:none;">
  <div class="modal-content">
    <span class="close" id="close-profile-modal">&times;</span>
    <h2>User Profile</h2>
    <table class="profile-table">
      <tr><th>ID</th><td id="profile-id"></td></tr>
      <tr><th>First Name</th><td id="profile-first-name"></td></tr>
      <tr><th>Last Name</th><td id="profile-last-name"></td></tr>
      <tr><th>Email</th><td id="profile-email"></td></tr>
      <tr><th>Password Hash</th><td id="profile-password-hash"></td></tr>
      <tr><th>Role</th><td id="profile-role"></td></tr>
    </table>
  </div>
</div>
<!-- Logout Confirmation Modal -->
<div id="logout-modal" class="modal" style="display:none;">
  <div class="modal-content">
    <span class="close" id="close-logout-modal">&times;</span>
    <h2>Confirm Logout</h2>
    <p>Are you sure you want to logout?</p>
    <div style="text-align:right;">
      <button id="cancel-logout" class="btn btn-secondary">Cancel</button>
      <button id="confirm-logout" class="btn btn-danger">Logout</button>
    </div>
  </div>
</div>
</body>
</html>