<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Meeting Room - Meeting Minutes</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body id="minutes-page">
    <div id="header"></div>

  <main class="container">
    <div class="card">
      <div class="card-header">
        <h2>Meeting Minutes: <span id="minutes-title">New Minutes</span></h2>
      </div>
      
      <form id="minutes-form">
        <div class="form-group">
          <label for="minutes-date">Meeting Date</label>
          <input type="datetime-local" id="minutes-date" class="form-control" required>
        </div>
        
        <div class="form-group">
          <label for="minutes-attendees">Attendees</label>
          <select id="minutes-attendees" class="form-control" multiple required>
            <option value="" disabled>Loading attendees...</option>
          </select>
          <small>Hold Ctrl/Cmd to select multiple</small>
        </div>
        
        <div class="form-group">
          <label for="minutes-agenda">Agenda</label>
          <textarea id="minutes-agenda" class="form-control" rows="3" required></textarea>
        </div>
        
        <div class="form-group">
          <label>Discussion Points</label>
          <div id="discussion-points">
            <!-- Points will be added here -->
          </div>
          <button type="button" class="btn btn-secondary" id="add-point">
            <i class="fas fa-plus"></i> Add Discussion Point
          </button>
        </div>
        
        <div class="form-group">
          <label>Action Items</label>
          <table class="table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="action-items">
              <!-- Action items will be added here -->
            </tbody>
          </table>
          <button type="button" class="btn btn-secondary" id="add-action">
            <i class="fas fa-plus"></i> Add Action Item
          </button>
        </div>
        
        <div class="form-group">
          <label for="minutes-notes">Additional Notes</label>
          <textarea id="minutes-notes" class="form-control" rows="4"></textarea>
        </div>
        
        <div class="form-group">
          <label for="minutes-attachments">Attachments</label>
          <input type="file" id="minutes-attachments" class="form-control" multiple>
          <div id="attachments-list" class="mt-2"></div>
        </div>
        
        <div class="form-group">
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Save Minutes
          </button>
          <button type="button" class="btn btn-danger" id="cancel-minutes">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
    </div>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/minutes.js') }}"></script>
  <script src="{{ asset('js/header.js') }}"></script>
</body>
</html>