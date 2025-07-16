document.addEventListener('DOMContentLoaded', initReview);

function initReview() {
  Promise.all([
    fetch('/api/meetings', { headers: getAuthHeaders() }).then(r => r.json()),
    fetch('/api/minutes', { headers: getAuthHeaders() }).then(r => r.json()),
    fetch('/api/users', { headers: getAuthHeaders() }).then(r => r.json())
  ])
  .then(([meetings, minutesData, usersData]) => {
    const users = usersData.data || usersData;
    renderMeetingsTable(meetings, minutesData, users);
  });

  document.getElementById('search-minutes')?.addEventListener('input', e => {
    filterMeetings(e.target.value.toLowerCase(), document.getElementById('filter-date')?.value);
  });

  document.getElementById('filter-date')?.addEventListener('change', e => {
    filterMeetings(document.getElementById('search-minutes')?.value.toLowerCase(), e.target.value);
  });

  document.getElementById('export-pdf')?.addEventListener('click', () => exportMinutes('pdf'));

  document.addEventListener('click', e => {
    const dl = e.target.closest('.download-attachment');
    if (dl) {
      e.preventDefault();
      const fileName = dl.dataset.file;
      showToast(`Downloading ${fileName}…`, 'info');
    }
  });
}

function renderMeetingsTable(meetings, minutes, users) {
  const tbl = document.getElementById('past-meetings');
  tbl.innerHTML = '';
  if (!meetings.length) {
    tbl.insertAdjacentHTML('beforeend', '<tr><td colspan="5" class="text-center">No past meetings found</td></tr>');
    return;
  }

  meetings.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  meetings.forEach(m => {
    const mMin = minutes.find(x => x.meeting_id == m.id);
    const actionCount = mMin?.actionItems?.length || 0;
    const attendees = (m.attendees || []).map(a => a.user_id || a).join(', ');
    tbl.insertAdjacentHTML('beforeend', `
      <tr data-id="${m.id}"
          data-attendees="${attendees}"
          data-agenda="${mMin?.agenda || ''}"
          data-notes="${mMin?.notes || ''}">
        <td>${m.title}</td>
        <td>${formatMeetingDate(m.start_time)}</td>
        <td>${actionCount} action item${actionCount !== 1 ? 's' : ''}</td>
        <td>
          <div class="action-buttons">
            ${mMin ? `<button class="btn btn-primary view-minutes" data-id="${m.id}"><i class="fas fa-eye"></i> View</button>` : ''}
            <button class="btn btn-warning edit-minutes" data-id="${m.id}">
              <i class="fas fa-edit"></i> ${mMin ? 'Edit' : 'Create'}
            </button>
            <button class="btn btn-danger delete-minutes" data-id="${m.id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    `);
  });

  document.querySelectorAll('.view-minutes').forEach(btn =>
    btn.addEventListener('click', () => {
      showMinutesDetails(btn.dataset.id, meetings, minutes, users);
    })
  );

  document.querySelectorAll('.edit-minutes').forEach(btn =>
    btn.addEventListener('click', () => window.location.href = `/minutes?meeting=${btn.dataset.id}`)
  );

  document.querySelectorAll('.delete-minutes').forEach(btn =>
    btn.addEventListener('click', () => deleteMinutes(btn.dataset.id))
  );
}

function showMinutesDetails(meetingId, meetings, minutes, users) {
  const meeting = meetings.find(m => m.id == meetingId);
  const minute = minutes.find(m => m.meeting_id == meetingId);
  if (!meeting) return showToast('Meeting not found!', 'error');
  if (!minute) return showToast('No minutes found!', 'error');

  const detail = document.getElementById('minutes-detail');
  detail.style.display = 'block';
  detail.dataset.meetingId = meetingId;
  detail.scrollIntoView({ behavior: 'smooth' });

  document.getElementById('detail-title').textContent = meeting.title;
  document.getElementById('detail-date').textContent = formatMeetingDateTime(meeting.start_time);

  const names = (meeting.attendees || []).map(a =>
    (users.find(u => u.id == (a.user_id||a)) || {}).first_name
  ).join(', ');
  document.getElementById('detail-attendees').textContent = names;

  document.getElementById('detail-agenda').innerHTML = minute.agenda?.replace(/\n/g,'<br>') || '<em>No agenda</em>';

  const attDiv = document.getElementById('detail-discussion');
  attDiv.innerHTML = '';
  if (minute.discussionPoints?.length) {
    minute.discussionPoints.forEach(pt => {
      attDiv.insertAdjacentHTML('beforeend', `<div><h4>${pt.topic}</h4><p>${pt.details}</p></div>`);
    });
  } else {
    attDiv.innerHTML = '<p><em>No discussion</em></p>';
  }

  const actionsTbl = document.getElementById('detail-actions');
  actionsTbl.innerHTML = '';
  if (minute.actionItems?.length) {
    minute.actionItems.forEach(act => {
      const ass = users.find(u => String(u.id) === String(act.assignee));
      actionsTbl.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${act.action}</td><td>${ass?ass.first_name+' '+ass.last_name:'Unassigned'}</td>
          <td>${act.dueDate}</td><td><span class="status-badge ${act.status}">${act.status}</span></td>
        </tr>
      `);
    });
  } else {
    actionsTbl.innerHTML = '<tr><td colspan="4"><em>No action items</em></td></tr>';
  }

  document.getElementById('detail-notes').innerHTML = minute.notes?.replace(/\n/g, '<br>') || '<em>No notes</em>';
  const attch = document.getElementById('detail-attachments');
  attch.innerHTML = '';
  if (minute.attachments?.length) {
    minute.attachments.forEach(file => {
      attch.insertAdjacentHTML('beforeend', `
        <div><i class="fas ${getFileIcon(file.name)}"></i> ${file.name}
         <a href="#" class="download-attachment" data-file="${file.name}">
           <i class="fas fa-download"></i>Download</a></div>
      `);
    });
  } else {
    attch.innerHTML = '<p><em>No attachments</em></p>';
  }
}

function deleteMinutes(meetingId) {
  showModal({
    title: 'Delete Minutes',
    message: 'Sure? This deletes minutes AND meeting!',
    onConfirm: () => {
      fetch(`/api/minutes/${meetingId}`, {
        method: 'DELETE', headers: getAuthHeaders()
      })
        .then(r => {
          if (!r.ok) throw new Error(); 
          showToast('Deleted!', 'success');
          initReview();
          document.getElementById('minutes-detail').style.display = 'none';
        })
        .catch(e => showToast('Failed to delete', 'error'));
    },
    showCancel: true,
    confirmText: 'Delete',
    cancelText: 'Cancel'
  });
}

function exportMinutes(format) {
  const path = document.getElementById('detail-title').textContent;
  if (!path) return showToast('No meeting selected', 'error');

  if (format === 'pdf') {
    const jsPD = window.jspdf.jsPDF;
    const doc = new jsPD();
    doc.text(`Meeting: ${path}`,10,10);
    doc.save(`Minutes_${path}.pdf`);
    showToast('PDF exported', 'info');
  } else {
    showToast('Only PDF export is supported', 'info');
  }
}

function filterMeetings(searchTerm='', fdate='') {
  document.querySelectorAll('#past-meetings tr').forEach(r => {
    const title = r.children[0]?.textContent.toLowerCase(), 
          dateVal = new Date(r.children[1]?.textContent),
          actionCol = r.children[2]?.textContent.toLowerCase(),
          attendees = r.dataset.attendees?.toLowerCase()||'',
          agenda = r.dataset.agenda?.toLowerCase()||'',
          notes = r.dataset.notes?.toLowerCase()||'';
    const matchSearch = !searchTerm || [title, actionCol, attendees, agenda, notes].some(txt => txt.includes(searchTerm));
    const matchDate = !fdate || (dateVal.getMonth() === new Date(fdate).getMonth() && dateVal.getFullYear() === new Date(fdate).getFullYear());
    r.style.display = (matchSearch && matchDate) ? '' : 'none';
  });
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  return {
    pdf:'fa-file-pdf', doc:'fa-file-word', docx:'fa-file-word',
    xls:'fa-file-excel', xlsx:'fa-file-excel',
    ppt:'fa-file-powerpoint', pptx:'fa-file-powerpoint',
    jpg:'fa-file-image', jpeg:'fa-file-image', png:'fa-file-image', gif:'fa-file-image'
  }[ext] || 'fa-file';
}

function formatMeetingDate(dt) {
  return new Date(dt).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
}
function formatMeetingDateTime(dt) {
  return new Date(dt).toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
}
function getAuthHeaders() {
  const t = localStorage.getItem('token');
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}
