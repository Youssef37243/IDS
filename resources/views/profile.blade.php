<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Profile</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body id="profile-page">
  <div id="header"></div>
  <main class="container">
    <div class="card profile-card">
      <div class="card-header">
        <h2><i class="fas fa-user"></i> My Profile</h2>
      </div>
      <div class="card-body">
        <form id="profile-form">
          <div class="form-group">
            <label for="profile-first-name">First Name</label>
            <input type="text" id="profile-first-name" class="form-control" required>
          </div>
          <div class="form-group">
            <label for="profile-last-name">Last Name</label>
            <input type="text" id="profile-last-name" class="form-control" required>
          </div>
          <div class="form-group">
            <label for="profile-email">Email</label>
            <input type="email" id="profile-email" class="form-control" required>
          </div>
          <div class="form-group position-relative">
  <label for="profile-password-old">Old Password</label>
  <input type="password" id="profile-password-old" class="form-control" placeholder="Enter current password to change">
  <span class="toggle-password" data-target="profile-password-old">
    <svg class="eye-icon show" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
      <path fill="currentColor" d="M572.52 241.4C518.76 135.1 407.41 64 288 64S57.24 135.1 3.48 241.4a48.07 48.07 0 0 0 0 29.2C57.24 376.9 168.59 448 288 448s230.76-71.1 284.52-177.4a48.07 48.07 0 0 0 0-29.2zM288 400a112 112 0 1 1 112-112 112.15 112.15 0 0 1-112 112zm0-176a64 64 0 1 0 64 64 64.07 64.07 0 0 0-64-64z"/>
    </svg>
    <svg class="eye-icon hide" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
      <path fill="currentColor" d="M634 471L598.6 434.9C620.4 412 637.7 388.5 649.5 365.5a47.78 47.78 0 0 0 0-41C597.5 189.5 464.3 96 320 96a311.6 311.6 0 0 0-75.4 9.2L45 9.4A16 16 0 0 0 22.6 32.6l588 459a16 16 0 1 0 22.4-22.6zM320 400c-88.4 0-171.2-51.4-219.7-128C132.6 215.4 211.1 160 288 160a144 144 0 0 1 144 144c0 31.6-10.2 60.8-27.5 85.1l-50.6-39.6a64 64 0 0 0-84.9-84.9l-50.6-39.6C233.2 210.2 256 224 288 224a96 96 0 0 1 96 96c0 35.3-20.6 65.9-50.6 81.6L320 400z"/>
    </svg>
  </span>
</div>

<div class="form-group position-relative">
  <label for="profile-password-new">New Password</label>
  <input type="password" id="profile-password-new" class="form-control" placeholder="Leave blank to keep current password">
  <span class="toggle-password" data-target="profile-password-new">
    <svg class="eye-icon show" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
      <path fill="currentColor" d="M572.52 241.4C518.76 135.1 407.41 64 288 64S57.24 135.1 3.48 241.4a48.07 48.07 0 0 0 0 29.2C57.24 376.9 168.59 448 288 448s230.76-71.1 284.52-177.4a48.07 48.07 0 0 0 0-29.2zM288 400a112 112 0 1 1 112-112 112.15 112.15 0 0 1-112 112zm0-176a64 64 0 1 0 64 64 64.07 64.07 0 0 0-64-64z"/>
    </svg>
    <svg class="eye-icon hide" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
      <path fill="currentColor" d="M634 471L598.6 434.9C620.4 412 637.7 388.5 649.5 365.5a47.78 47.78 0 0 0 0-41C597.5 189.5 464.3 96 320 96a311.6 311.6 0 0 0-75.4 9.2L45 9.4A16 16 0 0 0 22.6 32.6l588 459a16 16 0 1 0 22.4-22.6zM320 400c-88.4 0-171.2-51.4-219.7-128C132.6 215.4 211.1 160 288 160a144 144 0 0 1 144 144c0 31.6-10.2 60.8-27.5 85.1l-50.6-39.6a64 64 0 0 0-84.9-84.9l-50.6-39.6C233.2 210.2 256 224 288 224a96 96 0 0 1 96 96c0 35.3-20.6 65.9-50.6 81.6L320 400z"/>
    </svg>
  </span>
</div>

          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      </div>
    </div>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/profile.js') }}"></script>
  <script src="{{ asset('js/header.js') }}"></script>
  
</body>
</html> 