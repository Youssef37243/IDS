    /**
     * ADMIN PAGE - COMPLETE SOLUTION
     */
    function initAdmin() {
    // Verify admin access
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'dashboard.html';
        return;
    }

    // Initialize UI
    setupTabs();
    loadRooms();
    loadUsers();
    setupForms();
    }

    function setupTabs() {
    $('#show-rooms').click(function() {
        $(this).addClass('active btn-primary').removeClass('btn-secondary');
        $('#show-users').removeClass('active btn-primary').addClass('btn-secondary');
        $('#users-section').removeClass('active');
        $('#rooms-section').addClass('active');
    });

    $('#show-users').click(function() {
        $(this).addClass('active btn-primary').removeClass('btn-secondary');
        $('#show-rooms').removeClass('active btn-primary').addClass('btn-secondary');
        $('#rooms-section').removeClass('active');
        $('#users-section').addClass('active');
    });
    }

    function setupForms() {
    // Room form
    $('#add-room-form').submit(function(e) {
        e.preventDefault();
        const equipment = Array.from($('input[name="equipment"]:checked')).map(el => el.value);
        const room = {
        id: Date.now(),
        name: $('#room-name').val().trim(),
        capacity: parseInt($('#room-capacity').val()),
        equipment: equipment.join(', '),
        status: 'Available'
        };

        if (!room.name || isNaN(room.capacity)) {
        showToast('Please fill all required fields', 'error');
        return;
        }

        let rooms = JSON.parse(localStorage.getItem('rooms')) || [];
        rooms.push(room);
        localStorage.setItem('rooms', JSON.stringify(rooms));
        showToast('Room added!', 'success');
        $(this).trigger('reset');
        loadRooms();
    });

    // User form
    $('#add-user-form').submit(function(e) {
        e.preventDefault();
        const user = {
        id: Date.now(),
        firstName: $('#user-first-name').val().trim(),
        lastName: $('#user-last-name').val().trim(),
        email: $('#user-email').val().trim(),
        password: $('#user-password').val(),
        role: $('#user-role').val(),
        source: 'admin-added'
        };

        if (!user.firstName || !user.lastName || !user.email || !user.password) {
        showToast('Please fill all required fields', 'error');
        return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        let adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
        
        if ([...users, ...adminUsers].some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        showToast('Email already exists!', 'error');
        return;
        }

        adminUsers.push(user);
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        showToast('User added!', 'success');
        $(this).trigger('reset');
        loadUsers();
    });
    }

    function loadRooms() {
    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    const $table = $('#rooms-table').empty();

    if (rooms.length === 0) {
        $table.append('<tr><td colspan="4" class="text-center">No rooms yet</td></tr>');
        return;
    }

    rooms.forEach(room => {
        $table.append(`
        <tr data-id="${room.id}">
            <td>${room.name}</td>
            <td>${room.capacity}</td>
            <td>${room.equipment}</td>
            <td>
            <button class="btn btn-danger btn-sm delete-room">Delete</button>
            </td>
        </tr>
        `);
    });

    $('.delete-room').click(function() {
        const roomId = $(this).closest('tr').data('id');
        deleteRoom(roomId);
    });
    }

    function loadUsers() {
    const registeredUsers = JSON.parse(localStorage.getItem('users')) || [];
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
    const allUsers = registeredUsers.map(u => ({ ...u, source: 'registered' })).concat(adminUsers);
    const $table = $('#users-table').empty();

    if (allUsers.length === 0) {
        $table.append('<tr><td colspan="4" class="text-center">No users yet</td></tr>');
        return;
    }

    allUsers.forEach(user => {
        $table.append(`
        <tr data-id="${user.id}" data-source="${user.source}">
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.role || 'user'}</td>
            <td>
            <button class="btn btn-danger btn-sm delete-user">Delete</button>
            </td>
        </tr>
        `);
    });

    $('.delete-user').click(function() {
        const $row = $(this).closest('tr');
        deleteUser($row.data('id'), $row.data('source'));
    });
    }

    function deleteRoom(roomId) {
    showModal({
        title: 'Delete Room',
        message: 'Are you sure? This will cancel all meetings in this room.',
        onConfirm: () => {
        let rooms = JSON.parse(localStorage.getItem('rooms')) || [];
        rooms = rooms.filter(r => r.id !== roomId);
        localStorage.setItem('rooms', JSON.stringify(rooms));

        let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        meetings = meetings.filter(m => m.room != roomId);
        localStorage.setItem('meetings', JSON.stringify(meetings));

        showToast('Room deleted!', 'success');
        loadRooms();
        },
        showCancel: true
    });
    }

    function deleteUser(userId, source) {
    if (currentUser.id === userId) {
        showToast("Can't delete your own account!", 'error');
        return;
    }

    showModal({
        title: 'Delete User',
        message: 'Are you sure? This will cancel all their meetings.',
        onConfirm: () => {
        if (source === 'registered') {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users = users.filter(u => u.id !== userId);
            localStorage.setItem('users', JSON.stringify(users));
        } else {
            let adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
            adminUsers = adminUsers.filter(u => u.id !== userId);
            localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        }

        showToast('User deleted!', 'success');
        loadUsers();
        },
        showCancel: true
    });
    }