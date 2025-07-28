<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Meeting Room - Dashboard</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body id="dashboard-page">
    <div id="header"></div>

  <main class="container">
    <div class="card action-card">
      <div class="card-header">
        <h2>Quick Actions</h2>
      </div>
      <div class="quick-actions">
        <button id="schedule-meeting" class="btn btn-primary"><i class="fas fa-calendar-plus"></i> Schedule Meetinteg</button>
        <button id="view-minutes" class="btn btn-secondary"><i class="fas fa-file-alt"></i> View Minus</button>
      </div>
    </div>

    <div class="card no-guest">
      <div class="card-header">
        <h2>Room Availability</h2>
        <div class="availability-controls">
          <select id="availability-period" class="form-control">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button id="refresh-availability" class="btn btn-secondary">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>
      <div id="room-availability-grid"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Upcoming Meetings</h2>
      </div>
      <div id="upcoming-meetings"></div>
    </div>

<div id="confirmation-modal" class="modal hidden">
  <div class="modal-content">
    <h2 id="confirmation-title">Confirm Action</h2>
    <p id="confirmation-message">Are you sure you want to perform this action?</p>
    <div class="modal-actions">
      <button id="cancel-confirmation" class="btn btn-secondary">Cancel</button>
      <button id="confirm-action" class="btn btn-danger">Confirm</button>
    </div>
  </div>
</div>

<div id="room-availability-modal" class="modal hidden">
  <div class="modal-content room-availability-modal">
    <div class="modal-header">
      <h2 id="room-availability-title">Room Availability Details</h2>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <div id="room-availability-details">
        <div class="loading">
          <i class="fas fa-spinner fa-spin"></i> Loading availability...
        </div>
      </div>
    </div>
  </div>
</div>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/dash.js') }}"></script>
  <script src="{{ asset('js/header.js') }}"></script>

</body>
</html>