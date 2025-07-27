// Active Meeting Controller
let meeting = null;
let timerInterval = null;
let isRecording = false;
let isTranscribing = false;
let currentModalResolve = null;

// Initialize the page
function initActiveMeeting() {
  initModalSystem();
  
  const urlParams = new URLSearchParams(window.location.search);
  const meetingId = urlParams.get('id');

  if (!meetingId) {
    showToast('No meeting ID provided!', 'error');
    setTimeout(() => window.location.href = '/dashboard', 1000);
    return;
  }

  fetch(`/api/meetings/${meetingId}`, { headers: getAuthHeaders() })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      meeting = data;
      return Promise.all([
        fetch('/api/users', { headers: getAuthHeaders() }).then(res => res.json()),
        fetch('/api/rooms', { headers: getAuthHeaders() }).then(res => res.json())
      ]);
    })
    .then(([users, rooms]) => {
      renderMeeting(meeting, users, rooms);
      setupMeetingControls();
    })
    .catch((error) => {
      console.error('Error loading meeting:', error);
      showToast('Failed to load meeting data', 'error');
      setTimeout(() => window.location.href = '/dashboard', 1000);
    });
}

// Modal System
function initModalSystem() {
  // Close modal when clicking X
  document.querySelector('.close-modal-btn').addEventListener('click', closeModal);
  
  // Close modal when clicking outside
  document.getElementById('confirmation-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  // Confirm button handler
  document.getElementById('modal-confirm-btn').addEventListener('click', handleConfirm);
  
  // Cancel button handler
  document.getElementById('modal-cancel-btn').addEventListener('click', handleCancel);
  
  // Handle Enter/Escape keys
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('confirmation-modal');
    if (modal.style.display !== 'block') return;
    
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  });
}

function handleConfirm() {
  if (currentModalResolve) {
    const inputValue = document.getElementById('modal-input').value;
    currentModalResolve(inputValue || true);
    closeModal();
  }
}

function handleCancel() {
  if (currentModalResolve) {
    currentModalResolve(false);
    closeModal();
  }
}

async function showModal(options) {
  return new Promise((resolve) => {
    currentModalResolve = resolve;
    
    // Set modal content
    document.getElementById('modal-title').textContent = options.title;
    document.getElementById('modal-body').innerHTML = options.message;
    
    // Configure buttons
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    
    confirmBtn.textContent = options.confirmText || 'Confirm';
    cancelBtn.textContent = options.cancelText || 'Cancel';
    
    // Show/hide cancel button
    cancelBtn.style.display = options.showCancel !== false ? 'block' : 'none';
    
    // Handle input field
    const inputContainer = document.getElementById('modal-input-container');
    const inputField = document.getElementById('modal-input');
    
    if (options.showInput) {
      inputContainer.style.display = 'block';
      inputField.placeholder = options.inputPlaceholder || '';
      inputField.value = '';
      inputField.focus();
    } else {
      inputContainer.style.display = 'none';
      confirmBtn.focus();
    }
    
    // Show modal
    document.getElementById('confirmation-modal').style.display = 'block';
  });
}

function closeModal() {
  document.getElementById('confirmation-modal').style.display = 'none';
  if (currentModalResolve) {
    currentModalResolve(false);
    currentModalResolve = null;
  }
}

// Meeting Rendering
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
  startMeetingTimer();
}

function startMeetingTimer() {
  let seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    document.getElementById('meeting-timer').textContent = 
      formatDuration(seconds);
  }, 1000);
}

function formatDuration(seconds) {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
}

// Meeting Controls
function setupMeetingControls() {
  // Remove existing listeners first to prevent duplicates
  const buttons = [
    'view-meeting-details',
    'end-meeting',
    'take-notes',
    'start-recording',
    'share-screen',
    'invite-participant',
    'join-video',
    'toggle-transcription'
  ];

  buttons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.replaceWith(btn.cloneNode(true));
  });

  // Meeting Details Button - Fixed implementation
  document.getElementById('view-meeting-details').addEventListener('click', (e) => {
    e.preventDefault();
    showMeetingDetails();
  });

// Final version of the End Meeting button handler:
document.getElementById('end-meeting').addEventListener('click', async () => {
  if (!meeting) {
    showToast('Meeting data not loaded yet', 'error');
    return;
  }

  const shouldEnd = await showModal({
    title: 'End Meeting',
    message: 'Are you sure you want to end this meeting and create minutes?',
    showCancel: true,
    confirmText: 'End Meeting',
    cancelText: 'Continue Meeting'
  });
  
  if (shouldEnd) {
    // Clear the meeting timer
    clearInterval(timerInterval);
    
    // Pass meeting ID and attendees to minutes page
    const attendees = meeting.attendees?.map(a => a.user_id || a) || [];
    const queryParams = new URLSearchParams({
      meeting: meeting.id,
      attendees: attendees.join(','),
      ended: 'true' // Add flag to indicate this is an ended meeting
    });
    
    window.location.href = `/minutes?${queryParams.toString()}`;
  }
});

// In active-meeting.js, update the take notes button handler:
document.getElementById('take-notes').addEventListener('click', () => {
  if (!meeting) {
    showToast('Meeting data not loaded yet', 'error');
    return;
  }
  
  // Pass meeting ID and attendees to minutes page
  const attendees = meeting.attendees?.map(a => a.user_id || a) || [];
  const queryParams = new URLSearchParams({
    meeting: meeting.id,
    attendees: attendees.join(',')
  });
  
  window.location.href = `/minutes?${queryParams.toString()}`;
});

  // Recording Button
  document.getElementById('start-recording').addEventListener('click', toggleRecording);

  // Screen Share Button
  document.getElementById('share-screen').addEventListener('click', async () => {
    await showModal({
      title: 'Screen Sharing',
      message: 'Screen sharing would start here in a real application.',
      showCancel: false,
      confirmText: 'OK'
    });
  });

  // Invite Participant Button
  document.getElementById('invite-participant').addEventListener('click', async () => {
    const email = await showModal({
      title: 'Invite Participant',
      message: 'Enter email address to invite:',
      showInput: true,
      inputPlaceholder: 'email@example.com',
      confirmText: 'Send Invite',
      cancelText: 'Cancel',
      showCancel: true
    });
    
    if (email && email.includes('@')) {
      showToast(`Invitation sent to ${email}`, 'success');
    } else if (email !== false) {
      showToast('Please enter a valid email', 'error');
    }
  });

  // Video Call Button
  document.getElementById('join-video').addEventListener('click', async () => {
    await showModal({
      title: 'Video Call',
      message: 'You would join a video call here in a real application.',
      showCancel: false,
      confirmText: 'OK'
    });
  });

  // Transcription Controls
  document.getElementById('toggle-transcription').addEventListener('click', toggleTranscription);
}

// Enhanced Meeting Details Modal
async function showMeetingDetails() {
  try {
    if (!meeting) {
      showToast('Meeting data not loaded yet', 'error');
      return;
    }

    const startDate = new Date(meeting.start_time);
    const endDate = new Date(meeting.end_time);
    const duration = Math.round((endDate - startDate) / 60000);

    await showModal({
      title: 'Meeting Details',
      message: `
        <div class="meeting-details-content">
          <p><strong>Title:</strong> ${escapeHtml(meeting.title)}</p>
          <p><strong>Date:</strong> ${formatMeetingDateTime(startDate)}</p>
          <p><strong>Duration:</strong> ${duration} minutes</p>
          <p><strong>Room:</strong> ${escapeHtml(document.getElementById('meeting-room').textContent)}</p>
          <p><strong>Attendees:</strong> ${escapeHtml(document.getElementById('meeting-attendees').textContent)}</p>
          ${meeting.agenda ? `<div class="agenda-section"><strong>Agenda:</strong><div>${escapeHtml(meeting.agenda).replace(/\n/g, '<br>')}</div></div>` : ''}
        </div>
      `,
      showCancel: false,
      confirmText: 'Close'
    });
  } catch (error) {
    console.error('Error showing meeting details:', error);
    showToast('Failed to show meeting details', 'error');
  }
}

// Recording Functionality
function toggleRecording() {
  isRecording = !isRecording;
  const recordingBtn = document.getElementById('start-recording');
  recordingBtn.innerHTML = `<i class="fas fa-record-vinyl"></i> ${isRecording ? 'Stop' : 'Start'} Recording`;
  recordingBtn.classList.toggle('btn-danger', isRecording);
  showToast(isRecording ? 'Recording started!' : 'Recording stopped!', 'info');
}

// Transcription Functionality
function toggleTranscription() {
  isTranscribing = !isTranscribing;
  const transcriptionBtn = document.getElementById('toggle-transcription');
  const transcriptionOutput = document.querySelector('.transcription-output');
  
  transcriptionBtn.innerHTML = `<i class="fas fa-microphone"></i> ${isTranscribing ? 'Stop' : 'Start'} Transcription`;
  transcriptionBtn.classList.toggle('btn-danger', isTranscribing);
  showToast(isTranscribing ? 'Transcription started!' : 'Transcription stopped!', 'info');

  if (isTranscribing) {
    transcriptionOutput.innerHTML = '';
    // Simulate transcription
    setTimeout(() => {
      transcriptionOutput.innerHTML += `<p>[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] System: Transcription started</p>`;
    }, 500);
    setTimeout(() => {
      transcriptionOutput.innerHTML += `<p>[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] User: Let's begin the meeting</p>`;
    }, 2000);
  } else {
    transcriptionOutput.innerHTML = '<p>Transcription will appear here when active...</p>';
  }
}

// Helper Functions
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

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function showToast(message, type) {
  // Implement your toast notification system here
  console.log(`${type}: ${message}`);
  // Example simple toast implementation:
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', initActiveMeeting);