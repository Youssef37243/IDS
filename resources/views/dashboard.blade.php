<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Meeting Room - Dashboard</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body id="dashboard-page">
    <div id="header"></div>

  <main class="container">
    <div class="card">
      <div class="card-header">
        <h2>Quick Actions</h2>
      </div>
      <div class="quick-actions">
        <button id="schedule-meeting" class="btn btn-primary"><i class="fas fa-calendar-plus"></i> Schedule Meeting</button>
        <button id="view-minutes" class="btn btn-secondary"><i class="fas fa-file-alt"></i> View Minutes</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Upcoming Meetings</h2>
      </div>
      <div id="upcoming-meetings"></div>
    </div>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/dashboard.js') }}"></script>
  <script src="{{ asset('js/header.js') }}"></script>

</body>
</html>