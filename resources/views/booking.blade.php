<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Meeting Room - Book Meeting</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
  <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body id="booking-page">
  <div id="header"></div>

  <main class="container">
    <div class="card">
      <div class="card-header">
        <h2>Book a Meeting Room</h2>
      </div>
      <form id="booking-form">
        @csrf
        <div class="form-group">
          <label for="meeting-title">Meeting Title</label>
          <input type="text" id="meeting-title" name="title" class="form-control" required>
        </div>
        
        <div class="form-group">
          <label for="meeting-date">Date & Time</label>
          <input type="datetime-local" id="meeting-date" name="start_time" class="form-control" required>
        </div>
        
        <div class="form-group">
          <label for="duration">Duration (minutes)</label>
          <input type="number" id="duration" name="duration" class="form-control" min="15" max="240" value="30" required>
        </div>
        
        <div class="form-group">
          <label for="room">Room</label>
          <select id="room" name="room_id" class="form-control" required>
            <option value="">Select Room</option>
            <!-- Options will be loaded dynamically -->
          </select>
        </div>
        
        <div class="form-group">
          <label for="attendees">Attendees</label>
          <select id="attendees" name="attendees[]" class="form-control" multiple>
            <!-- Options will be loaded dynamically -->
          </select>
          <small>Hold Ctrl/Cmd to select multiple</small>
        </div>
        
        <div class="form-group">
          <label for="agenda">Agenda</label>
          <textarea id="agenda" name="agenda" class="form-control" rows="3"></textarea>
        </div>
        
        <div class="form-group">
          <input type="checkbox" id="recurring" name="recurring">
          <label for="recurring">Recurring Meeting</label>
        </div>
        
        <div class="form-group">
          <input type="checkbox" id="video-conference" name="video_conference">
          <label for="video-conference">Video Conference Required</label>
        </div>
        
        <div class="form-group">
          <p id="availability-status">Select a room and time to check availability</p>
        </div>
        
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Book Now</button>
          <button type="button" class="btn btn-secondary" id="cancel-booking">Cancel</button>
        </div>
      </form>
    </div>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/booking.js') }}"></script>
  <script src="{{ asset('js/header.js') }}"></script>
</body>
</html>