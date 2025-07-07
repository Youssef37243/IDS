/**
 * ACTIVE MEETING PAGE - COMPLETE WORKING VERSION
 */
function initActiveMeeting() {
  // Load meeting data
  const urlParams = new URLSearchParams(window.location.search);
  const meetingId = urlParams.get('id');
  const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
  const allUsers = [...users, ...adminUsers];
  
  const meeting = meetings.find(m => m.id == meetingId);
  
  if (!meeting) {
    showToast('Meeting not found!', 'error');
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
    return;
  }

  // Populate meeting info
  $('#meeting-title').text(meeting.title);
  
  const startDate = new Date(meeting.date);
  const endDate = new Date(startDate.getTime() + meeting.duration * 60000);
  $('#meeting-time').text(`${formatMeetingDateTime(startDate)} - ${formatTime(endDate)}`);
  
  // Get room name
  const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
  const room = rooms.find(r => r.id == meeting.room);
  $('#meeting-room').text(room ? room.name : 'Unknown Room');

  // Format attendees
  const attendeeNames = meeting.attendees.map(attendeeId => {
    const user = allUsers.find(u => u.id == attendeeId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  });
  $('#meeting-attendees').text(attendeeNames.join(', '));

  // Meeting timer
  let seconds = 0;
  const timer = setInterval(function() {
    seconds++;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    $('#meeting-timer').text(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
  }, 1000);

  // End meeting button
  $('#end-meeting').click(function() {
    showModal({
      title: 'End Meeting',
      message: 'Are you sure you want to end this meeting?',
      onConfirm: () => {
        clearInterval(timer);
        window.location.href = `minutes.html?meeting=${meetingId}`;
      },
      showCancel: true,
      confirmText: 'End Meeting',
      cancelText: 'Continue Meeting'
    });
  });

  // Take notes button
  $('#take-notes').click(() => {
    window.location.href = `minutes.html?meeting=${meetingId}`;
  });

  // Additional meeting controls
  let isRecording = false;
  $('#start-recording').click(function() {
    isRecording = !isRecording;
    $(this).html(`<i class="fas fa-record-vinyl"></i> ${isRecording ? 'Stop' : 'Start'} Recording`);
    $(this).toggleClass('btn-primary btn-danger', isRecording);
    showToast(isRecording ? 'Recording started!' : 'Recording stopped!', 'info');
  });

  $('#share-screen').click(() => {
    showToast('Screen sharing started! (Demo only)', 'info');
  });

  $('#invite-participant').click(() => {
    showModal({
      title: 'Invite Participant',
      message: 'Enter participant email to invite:',
      onConfirm: (email) => {
        if (email) {
          showToast(`Invitation sent to ${email}!`, 'success');
        }
      },
      showInput: true,
      inputPlaceholder: 'participant@example.com',
      confirmText: 'Send Invite',
      cancelText: 'Cancel'
    });
  });

  let isTranscribing = false;
  $('#toggle-transcription').click(function() {
    isTranscribing = !isTranscribing;
    $(this).html(`<i class="fas fa-microphone"></i> ${isTranscribing ? 'Stop' : 'Start'} Transcription`);
    $(this).toggleClass('btn-primary btn-danger', isTranscribing);
    showToast(isTranscribing ? 'Transcription started!' : 'Transcription stopped!', 'info');
    
    if (isTranscribing) {
      // Demo transcription output
      setTimeout(() => {
        $('.transcription-output').append('<p>[10:02] John: Let\'s start with the project overview</p>');
      }, 1000);
      setTimeout(() => {
        $('.transcription-output').append('<p>[10:05] Jane: I\'ll present the requirements document</p>');
      }, 3000);
    } else {
      $('.transcription-output').empty();
    }
  });

  // Add button to view meeting details
  $('.card-header').append(`
    <button id="view-meeting-details" class="btn btn-secondary">
      <i class="fas fa-info-circle"></i> Meeting Details
    </button>
  `);

  $('#view-meeting-details').click(() => {
    showModal({
      title: 'Meeting Details',
      message: `
        <p><strong>Title:</strong> ${meeting.title}</p>
        <p><strong>Date:</strong> ${formatMeetingDateTime(startDate)}</p>
        <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
        <p><strong>Room:</strong> ${room ? room.name : 'Unknown Room'}</p>
        <p><strong>Organizer:</strong> ${meeting.organizer}</p>
        <p><strong>Attendees:</strong> ${attendeeNames.join(', ')}</p>
        ${meeting.agenda ? `<p><strong>Agenda:</strong><br>${meeting.agenda.replace(/\n/g, '<br>')}</p>` : ''}
      `,
      showCancel: false,
      confirmText: 'Close'
    });
  });
}

function formatMeetingDateTime(date) {
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}