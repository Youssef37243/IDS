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
        <h2>Meeting Minutes: <span id="minutes-title">Project Kickoff</span></h2>
      </div>
      
      <form id="minutes-form">
        <div class="form-group">
          <label for="minutes-date">Meeting Date</label>
          <input type="date" id="minutes-date" class="form-control" required>
        </div>
        
        <div class="form-group">
          <label for="minutes-attendees">Attendees</label>
          <select id="minutes-attendees" class="form-control" multiple>
            <option value="1" selected>John Doe</option>
            <option value="2" selected>Jane Smith</option>
            <option value="3">Mike Johnson</option>
          </select>
          <small>Hold Ctrl/Cmd to select multiple</small>
        </div>
        
        <div class="form-group">
          <label for="minutes-agenda">Agenda</label>
          <textarea id="minutes-agenda" class="form-control" rows="3">1. Project overview
2. Team introductions
3. Next steps</textarea>
        </div>
        
        <div class="form-group">
          <label>Discussion Points</label>
          <div id="discussion-points">
            <div class="discussion-point">
              <input type="text" class="form-control" placeholder="Topic" value="Project scope">
              <textarea class="form-control" rows="2" placeholder="Details">The project will focus on developing the new customer portal with enhanced features.</textarea>
            </div>
            <button type="button" class="btn btn-secondary" id="add-point">Add Discussion Point</button>
          </div>
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
              <tr>
                <td><input type="text" class="form-control" value="Prepare requirements document"></td>
                <td>
                  <select class="form-control">
                    <option value="1">John Doe</option>
                    <option value="2" selected>Jane Smith</option>
                    <option value="3">Mike Johnson</option>
                  </select>
                </td>
                <td><input type="date" class="form-control" value="2023-06-20"></td>
                <td>
                  <select class="form-control">
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td><button type="button" class="btn btn-danger remove-action">Remove</button></td>
              </tr>
            </tbody>
          </table>
          <button type="button" class="btn btn-secondary" id="add-action">Add Action Item</button>
        </div>
        
        <div class="form-group">
          <label for="minutes-notes">Additional Notes</label>
          <textarea id="minutes-notes" class="form-control" rows="4"></textarea>
        </div>
        
        <div class="form-group">
          <label for="minutes-attachments">Attachments</label>
          <input type="file" id="minutes-attachments" multiple>
          <div id="attachments-list"></div>
        </div>
        
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Save</button>
          <button type="button" class="btn btn-danger" onclick="window.location.href='dashboard.html'">Cancel</button>
        </div>
      </form>
    </div>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/minutes.js') }}"></script>
  <script src="{{ asset('js/header.js') }}"></script>
</body>
</html>