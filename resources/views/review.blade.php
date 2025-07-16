<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Meeting Room - Minutes Review</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body id="review-page">
    <div id="header"></div>

  <main class="container">
    <div class="card">
      <div class="card-header">
        <h2>Meeting Minutes Review</h2>
      </div>
      
      <div class="search-filter">
        <div class="form-group">
          <input type="text" id="search-minutes" class="form-control" placeholder="Search by keyword, attendee...">
        </div>
        
        <div class="form-group">
          <label for="filter-date">Filter by Date</label>
          <input type="month" id="filter-date" class="form-control">
        </div>
      </div>
      
      <div class="past-meetings">
        <table class="table">
          <thead>
            <tr>
              <th>Meeting Title</th>
              <th>Date</th>
              <th>Action Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="past-meetings">
            <!-- Will be populated by JavaScript -->
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="card" id="minutes-detail" style="display: none;">
      <div class="card-header">
        <h2>Minutes Detail: <span id="detail-title"></span></h2>
      </div>
      
      <div class="minutes-content">
        <div class="minutes-meta">
          <p><strong>Date:</strong> <span id="detail-date"></span></p>
          <p><strong>Attendees:</strong> <span id="detail-attendees"></span></p>
        </div>
        
        <div class="minutes-agenda">
          <h3>Agenda</h3>
          <div id="detail-agenda"></div>
        </div>
        
        <div class="minutes-discussion">
          <h3>Discussion Points</h3>
          <div id="detail-discussion"></div>
        </div>
        
        <div class="minutes-actions">
          <h3>Action Items</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="detail-actions">
            </tbody>
          </table>
        </div>
        
        <div class="minutes-notes">
          <h3>Additional Notes</h3>
          <div id="detail-notes"></div>
        </div>
        
        <div class="minutes-attachments">
          <h3>Attachments</h3>
          <div id="detail-attachments"></div>
        </div>
        
        <div class="minutes-actions">
          <button class="btn btn-primary" id="export-pdf"><i class="fas fa-file-pdf"></i> Export as PDF</button>
        </div>
      </div>
    </div>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/review.js') }}"></script>
  <script src="{{ asset('js/header.js') }}"></script>
</body>
</html>