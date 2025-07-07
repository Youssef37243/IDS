    $(document).ready(function () {
    $('#login-form').submit(function (e) {
        e.preventDefault(); // Prevent default form submission

        const email = $('#email').val();
        const password = $('#password').val();

        $.ajax({
        url: '/api/login', // or /api/jwt-login if using JWT
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            email: email,
            password: password
        }),
        success: function (response) {
            console.log('Login success:', response);

            // Store the token if JWT (adjust this if using Sanctum)
            if (response.token) {
            localStorage.setItem('token', response.token);
            }

            // Redirect to dashboard or home
            window.location.href = 'dashboard.html';
        },
        error: function (xhr) {
  let errorMsg = 'Login failed.';
  if (xhr.responseJSON && xhr.responseJSON.message) {
    errorMsg = xhr.responseJSON.message;
  }

  $('#login-error')
    .text(errorMsg)
    .removeClass('hidden');
}

        });
    });
    });
