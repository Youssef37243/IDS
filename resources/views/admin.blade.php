<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Meeting Room - Admin Panel</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body id="admin-page">
    <div id="header"></div>

  <main class="container">
    <div class="card">
      <div class="card-header">
        <h2>System Management</h2>
        <div class="management-buttons">
          <button id="show-rooms" class="btn btn-primary active">Rooms</button>
          <button id="show-users" class="btn btn-secondary">Users</button>
        </div>
      </div>
      
      <div id="rooms-section" class="management-section active">
        <div class="add-room-form">
          <h3>Add New Room</h3>
          <form id="add-room-form">
            <div class="form-group">
              <label for="room-name">Room Name</label>
              <input type="text" id="room-name" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="room-capacity">Capacity</label>
              <input type="number" id="room-capacity" class="form-control" min="1" required>
            </div>
            <div class="form-group">
              <label>Equipment</label>
              <div class="equipment-checkboxes">
                <label><input type="checkbox" name="equipment" value="projector"> Projector</label>
                <label><input type="checkbox" name="equipment" value="whiteboard"> Whiteboard</label>
                <label><input type="checkbox" name="equipment" value="microphone"> Microphone</label>
                <label><input type="checkbox" name="equipment" value="video"> Video Conferencing</label>
              </div>
            </div>
            <button type="submit" class="btn btn-primary">Add Room</button>
          </form>
        </div>
        
        <div class="rooms-list">
          <h3>Available Rooms</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Capacity</th>
                <th>Equipment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="rooms-table"></tbody>
          </table>
        </div>
      </div>
      
      <div id="users-section" class="management-section">
        <div class="add-user-form">
          <h3>Add New User</h3>
          <form id="add-user-form">
            <div class="form-group">
              <label for="user-first-name">First Name</label>
              <input type="text" id="user-first-name" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="user-last-name">Last Name</label>
              <input type="text" id="user-last-name" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="user-email">Email</label>
              <input type="email" id="user-email" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="user-password">Password</label>
              <input type="password" id="user-password" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="user-role">Role</label>
              <select id="user-role" class="form-control" >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary">Add User</button>
          </form>
        </div>
        
        <div class="users-list">
          <h3>System Users</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="users-table"></tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/admin.js') }}"></script>
  <script src="{{ asset('js/header.js') }}"></script>
</body>
</html>