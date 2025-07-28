<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Meeting Room - Admin Panel</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body id="admin-page">
    <div id="header"></div>

  <main class="container">
    <div class="card">
      <div class="card-header">
        <h2>System Management</h2>
        <div class="management-buttons">
          <button id="show-dashboard" class="btn btn-primary active">Dashboard</button>
          <button id="show-rooms" class="btn btn-secondary">Rooms</button>
          <button id="show-users" class="btn btn-secondary">Users</button>
        </div>
      </div>
      
      <div id="dashboard-section" class="management-section active">
        <div class="dashboard-grid">
          <div class="stats-overview">
            <h3>System Overview</h3>
            <div class="stats-cards">
              <div class="stat-card">
                <h4>Total Meetings</h4>
                <span id="total-meetings" class="stat-number">-</span>
              </div>
              <div class="stat-card">
                <h4>Active Users</h4>
                <span id="active-users" class="stat-number">-</span>
              </div>
              <div class="stat-card">
                <h4>Total Rooms</h4>
                <span id="total-rooms" class="stat-number">-</span>
              </div>
              <div class="stat-card">
                <h4>Recent Meetings (30 days)</h4>
                <span id="recent-meetings" class="stat-number">-</span>
              </div>
            </div>
          </div>

          <div class="meeting-summaries">
            <div class="summary-section">
              <h3>Meeting Summary by Week</h3>
              <div class="time-period-controls">
                <label for="weeks-select">Period:</label>
                <select id="weeks-select">
                  <option value="4">Last 4 weeks</option>
                  <option value="8">Last 8 weeks</option>
                  <option value="12">Last 12 weeks</option>
                </select>
                <button id="refresh-weekly" class="btn btn-sm btn-primary">Refresh</button>
              </div>
              <div id="weekly-summary" class="summary-content">
                <p>Loading weekly summary...</p>
              </div>
            </div>

            <div class="summary-section">
              <h3>Meeting Summary by Month</h3>
              <div class="time-period-controls">
                <label for="months-select">Period:</label>
                <select id="months-select">
                  <option value="3">Last 3 months</option>
                  <option value="6" selected>Last 6 months</option>
                  <option value="12">Last 12 months</option>
                </select>
                <button id="refresh-monthly" class="btn btn-sm btn-primary">Refresh</button>
              </div>
              <div id="monthly-summary" class="summary-content">
                <p>Loading monthly summary...</p>
              </div>
            </div>
          </div>

          <div class="room-usage">
            <h3>Most Used Rooms</h3>
            <div class="time-period-controls">
              <label for="room-days-select">Period:</label>
              <select id="room-days-select">
                <option value="7">Last 7 days</option>
                <option value="30" selected>Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="0">All time</option>
              </select>
              <label for="room-limit-select">Show:</label>
              <select id="room-limit-select">
                <option value="5">Top 5</option>
                <option value="10" selected>Top 10</option>
                <option value="15">Top 15</option>
              </select>
              <button id="refresh-rooms" class="btn btn-sm btn-primary">Refresh</button>
            </div>
            <div id="room-usage-content" class="room-usage-content">
              <p>Loading room usage data...</p>
            </div>
          </div>

          <div class="user-activity">
            <h3>Most Active Users</h3>
            <div id="user-activity-content" class="user-activity-content">
              <p>Loading user activity data...</p>
            </div>
          </div>
        </div>
      </div>
      
      <div id="rooms-section" class="management-section">
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
              <label for="room-location">Location</label>
              <input type="text" id="room-location" class="form-control" required>
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
                <th>Location</th>
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
            <select id="user-role" class="form-control" required>
              <option value="" disabled selected>Select a role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="guest">Guest</option>
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

    <!-- Confirmation Modal -->
<div id="confirmation-modal" class="modal hidden">
  <div class="modal-content">
    <span class="close" id="close-confirmation-modal">&times;</span>
    <h2 id="confirmation-title"></h2>
    <p id="confirmation-message"></p>
    <div class="modal-actions">
      <button id="cancel-confirmation" class="btn btn-secondary">Cancel</button>
      <button id="confirm-action" class="btn btn-danger">Delete</button>
    </div>
  </div>
</div>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/admin.js') }}"></script>
  <script src="{{ asset('js/header.js') }}"></script>
</body>
</html>