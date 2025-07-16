function initActiveMeeting() {
  const urlParams = new URLSearchParams(window.location.search);
  const meetingId = urlParams.get('id');

  if (!meetingId) {
    showToast('No meeting ID provided!', 'error');
    setTimeout(() => window.location.href = '/dashboard', 1000);
    return;
  }

  fetch(`/api/meetings/${meetingId}`, { headers: getAuthHeaders() })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(meeting => {
      Promise.all([
        fetch('/api/users', { headers: getAuthHeaders() }).then(res => res.json()),
        fetch('/api/rooms', { headers: getAuthHeaders() }).then(res => res.json())
      ])
      .then(([users, rooms]) => {
        const userList = users.data || users;
        renderMeeting(meeting, userList, rooms);
      })
      .catch(() => {
        showToast('Failed to load users or rooms', 'error');
      });
    })
    .catch(() => {
      showToast('Meeting not found!', 'error');
      setTimeout(() => window.location.href = '/dashboard', 1000);
    });
}

function renderMeeting(meeting, users, rooms) {
  document.getElementById('meeting-title').textContent = meeting.title;

  const startDate = new Date(meeting.start_time);
  const endDate = new Date(meeting.end_time);

  document.getElementById('meeting-time').textContent =
    `${formatMeetingDateTime(startDate)} - ${formatTime(endDate)}`;

  const room = rooms.find(r => r.id == meeting.room_id);
  document.getElementById('meeting-room').textContent = room ? room.name : 'Unknown Room';

  const attendeeNames = (meeting.attendees || []).map(att => {
    const user = users.find(u => u.id == (att.user_id || att));
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  });

  document.getElementById('meeting-attendees').textContent = attendeeNames.join(', ');

  // Timer
  let seconds = 0;
  const timer = setInterval(() => {
    seconds++;
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    document.getElementById('meeting-timer').textContent = `${hours}:${minutes}:${secs}`;
  }, 1000);

  // End Meeting
  document.getElementById('end-meeting').addEventListener('click', () => {
    showModal({
      title: 'End Meeting',
      message: 'Are you sure you want to end this meeting?',
      onConfirm: () => {
        clearInterval(timer);
        window.location.href = `/minutes?meeting=${meeting.id}`;
      },
      showCancel: true,
      confirmText: 'End Meeting',
      cancelText: 'Continue Meeting'
    });
  });

  // Take Notes
  document.getElementById('take-notes').addEventListener('click', () => {
    window.location.href = `/minutes?meeting=${meeting.id}`;
  });

  // Recording
  let isRecording = false;
  const recordingBtn = document.getElementById('start-recording');
  recordingBtn.addEventListener('click', () => {
    isRecording = !isRecording;
    recordingBtn.innerHTML = `<i class="fas fa-record-vinyl"></i> ${isRecording ? 'Stop' : 'Start'} Recording`;
    recordingBtn.classList.toggle('btn-primary', !isRecording);
    recordingBtn.classList.toggle('btn-danger', isRecording);
    showToast(isRecording ? 'Recording started!' : 'Recording stopped!', 'info');
  });

  // Screen Sharing
  document.getElementById('share-screen').addEventListener('click', () => {
    showToast('Screen sharing started! (Demo only)', 'info');
  });

  // Invite Participant
  document.getElementById('invite-participant').addEventListener('click', () => {
    showModal({
      title: 'Invite Participant',
      message: 'Enter participant email to invite:',
      onConfirm: (email) => {
        if (email) showToast(`Invitation sent to ${email}!`, 'success');
      },
      showInput: true,
      inputPlaceholder: 'participant@example.com',
      confirmText: 'Send Invite',
      cancelText: 'Cancel'
    });
  });

  // Transcription
  let isTranscribing = false;
  const transcriptionBtn = document.getElementById('toggle-transcription');
  const transcriptionOutput = document.querySelector('.transcription-output');

  transcriptionBtn.addEventListener('click', () => {
    isTranscribing = !isTranscribing;
    transcriptionBtn.innerHTML = `<i class="fas fa-microphone"></i> ${isTranscribing ? 'Stop' : 'Start'} Transcription`;
    transcriptionBtn.classList.toggle('btn-primary', !isTranscribing);
    transcriptionBtn.classList.toggle('btn-danger', isTranscribing);
    showToast(isTranscribing ? 'Transcription started!' : 'Transcription stopped!', 'info');

    if (isTranscribing) {
      setTimeout(() => {
        transcriptionOutput.innerHTML += `<p>[10:02] John: Let's start with the project overview</p>`;
      }, 1000);
      setTimeout(() => {
        transcriptionOutput.innerHTML += `<p>[10:05] Jane: I'll present the requirements document</p>`;
      }, 3000);
    } else {
      transcriptionOutput.innerHTML = '';
    }
  });

  // View Meeting Details
  const header = document.querySelector('.card-header');
  const viewBtn = document.createElement('button');
  viewBtn.id = 'view-meeting-details';
  viewBtn.className = 'btn btn-secondary';
  viewBtn.innerHTML = `<i class="fas fa-info-circle"></i> Meeting Details`;
  header.appendChild(viewBtn);

  viewBtn.addEventListener('click', () => {
    showModal({
      title: 'Meeting Details',
      message: `
        <p><strong>Title:</strong> ${meeting.title}</p>
        <p><strong>Date:</strong> ${formatMeetingDateTime(startDate)}</p>
        <p><strong>Duration:</strong> ${(meeting.duration || ((endDate - startDate)/60000))} minutes</p>
        <p><strong>Room:</strong> ${room ? room.name : 'Unknown Room'}</p>
        <p><strong>Organizer:</strong> ${meeting.user_id}</p>
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

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Call when DOM is ready
document.addEventListener('DOMContentLoaded', initActiveMeeting);
