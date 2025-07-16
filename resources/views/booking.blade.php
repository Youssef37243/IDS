<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Meeting Room - Book Meeting</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-datetimepicker/2.5.20/jquery.datetimepicker.min.css">
</head>
<body id="booking-page">
      <div id="header"></div>

  <main class="container">
    <div class="card">
      <div class="card-header">
        <h2>Book a Meeting Room</h2>
      </div>
      <form id="booking-form">
        <div class="form-group">
          <label for="meeting-title">Meeting Title</label>
          <input type="text" id="meeting-title" class="form-control" required>
        </div>
        
        <div class="form-group">
          <label for="meeting-date">Date & Time</label>
          <input type="datetime-local" id="meeting-date" class="form-control" required>
        </div>
        
        <div class="form-group">
          <label for="duration">Duration (minutes)</label>
          <input type="number" id="duration" class="form-control" min="15" max="240" value="30" required>
        </div>
        
        <div class="form-group">
          <label for="room">Room</label>
          <select id="room" class="form-control" required>
            <option value="">Select Room</option>
            <option value="1">Conference Room A (Capacity: 10)</option>
            <option value="2">Conference Room B (Capacity: 8)</option>
            <option value="3">Board Room (Capacity: 15)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="attendees">Attendees</label>
          <select id="attendees" class="form-control" multiple>
            <option value="1">john@example.com</option>
            <option value="2">jane@example.com</option>
            <option value="3">mike@example.com</option>
          </select>
          <small>Hold Ctrl/Cmd to select multiple</small>
        </div>
        
        <div class="form-group">
          <label for="agenda">Agenda</label>
          <textarea id="agenda" class="form-control" rows="3"></textarea>
        </div>
        
        <div class="form-group">
          <input type="checkbox" id="recurring">
          <label for="recurring">Recurring Meeting</label>
        </div>
        
        <div class="form-group">
          <input type="checkbox" id="video-conference">
          <label for="video-conference">Video Conference Required</label>
        </div>
        
        <div class="form-group">
          <p id="availability-status">Select a room and time to check availability</p>
        </div>
        
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Book Now</button>
          <button type="button" class="btn btn-secondary" onclick="window.location.href='dashboard.html'">Cancel</button>
        </div>
      </form>
    </div>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/booking.js') }}"></script>
  <script src="{{ asset('js/header.js') }}"></script>
</body>
</html>