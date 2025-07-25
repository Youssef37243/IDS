<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Meeting Room - Active Meeting</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body id="active-meeting-page">
  <header>
    <div class="container header-container">
      <div class="logo">
        <img src="{{ asset('images/logo.png') }}" alt="Smart Meeting Room Logo">
        <h1>Smart Meeting Room</h1>
      </div>
      <nav>
        <ul>
          <li class="auth-only"><a href="/dashboard"><i class="fas fa-home"></i> Dashboard</a></li>
          <li class="auth-only"><a href="/booking"><i class="fas fa-calendar-plus"></i> Book Meeting</a></li>
          <li class="auth-only"><a href="/review"><i class="fas fa-file-alt"></i> Minutes</a></li>
          <li class="admin-only"><a href="/admin"><i class="fas fa-cog"></i> Admin</a></li>
          <li class="auth-only"><a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
          <li class="auth-only"><span id="user-name"></span> (<span id="user-role"></span>)</li>
        </ul>
      </nav>
    </div>
  </header>

  <main class="container">
    <div class="card">
      <div class="card-header">
        <h2>Active Meeting: <span id="meeting-title">Loading...</span></h2>
        <button id="view-meeting-details" class="btn btn-secondary">
          <i class="fas fa-info-circle"></i> Meeting Details
        </button>
      </div>
      
      <div class="meeting-info">
        <div class="meeting-details">
          <p><strong>Time:</strong> <span id="meeting-time">Loading...</span></p>
          <p><strong>Room:</strong> <span id="meeting-room">Loading...</span></p>
          <p><strong>Attendees:</strong> <span id="meeting-attendees">Loading...</span></p>
        </div>
        
        <div class="meeting-timer">
          <h3>Meeting Duration</h3>
          <div id="meeting-timer">00:00:00</div>
        </div>
      </div>
      
      <div class="meeting-controls">
        <button id="start-recording" class="btn btn-primary"><i class="fas fa-record-vinyl"></i> Start Recording</button>
        <button id="end-meeting" class="btn btn-danger"><i class="fas fa-stop"></i> End Meeting</button>
      </div>
      
      <div class="meeting-actions">
        <button id="take-notes" class="btn btn-secondary"><i class="fas fa-edit"></i> Take Notes</button>
        <button id="share-screen" class="btn btn-secondary"><i class="fas fa-desktop"></i> Share Screen</button>
        <button id="invite-participant" class="btn btn-secondary"><i class="fas fa-user-plus"></i> Invite Participant</button>
        <button id="join-video" class="btn btn-success"><i class="fas fa-video"></i> Join Video Call</button>
      </div>
      
      <div class="transcription-section">
        <h3>Live Transcription</h3>
        <div class="transcription-controls">
          <button id="toggle-transcription" class="btn btn-primary"><i class="fas fa-microphone"></i> Start Transcription</button>
          <select id="transcription-language" class="form-control">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
        <div class="transcription-output">
          <p>Transcription will appear here when active...</p>
        </div>
      </div>
    </div>

    <!-- Add this before the closing </body> tag -->
<div id="modal-container">
  <!-- Confirmation Modal -->
  <div id="confirmation-modal" class="modal hidden">
    <div class="modal-content">
      <span class="close-modal-btn">&times;</span>
      <h2 id="modal-title"></h2>
      <div id="modal-body"></div>
      <div class="modal-footer">
        <div id="modal-input-container" style="display: none; margin-bottom: 15px;">
          <input type="text" id="modal-input" class="form-control" placeholder="">
        </div>
        <div class="modal-buttons">
          <button id="modal-cancel-btn" class="btn btn-secondary">Cancel</button>
          <button id="modal-confirm-btn" class="btn btn-primary">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</div>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/active-meeting.js') }}"></script>
</body>
</html>