// Toggle password visibility
document
  .querySelector('.toggle-password')
  .addEventListener('click', (event) => {
    const input = document.getElementById('password');
    const icon = event.target;
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });

// Handle form submission and display error popup
document
  .getElementById('register-form')
  .addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showErrorPopup(errorData.message);
        return;
      }

      alert('User successfully registered!');
      window.location.href = '/login';
    } catch (error) {
      showErrorPopup('An unexpected error occurred. Please try again.');
    }
  });

function showErrorPopup(message) {
  const popup = document.getElementById('error-popup');
  const messageElement = document.getElementById('error-message');
  messageElement.textContent = message;
  popup.classList.remove('d-none');
  setTimeout(() => {
    popup.classList.add('d-none');
  }, 5000);
}
