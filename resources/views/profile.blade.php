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
          <div class="form-group">
            <label for="profile-password-old">Old Password</label>
            <input type="password" id="profile-password-old" class="form-control" placeholder="Enter current password to change">
          </div>
          <div class="form-group">
            <label for="profile-password-new">New Password</label>
            <input type="password" id="profile-password-new" class="form-control" placeholder="Leave blank to keep current password">
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