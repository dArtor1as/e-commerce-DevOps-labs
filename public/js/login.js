async function login(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      localStorage.setItem('token', result.access_token);
      alert('Ви успішно авторизувалися!');
      window.location.href = '/';
    } else {
      const error = await response.json();
      alert(`Помилка: ${error.message}`);
    }
  } catch (error) {
    console.error('Сталася помилка:', error);
    alert('Сталася помилка. Спробуйте ще раз.');
  }
}

document.querySelectorAll('.toggle-password').forEach((item) => {
  item.addEventListener('click', (event) => {
    const input = event.target
      .closest('.password-toggle')
      .querySelector('input');
    if (input.type === 'password') {
      input.type = 'text';
      event.target.classList.remove('fa-eye');
      event.target.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      event.target.classList.remove('fa-eye-slash');
      event.target.classList.add('fa-eye');
    }
  });
});
