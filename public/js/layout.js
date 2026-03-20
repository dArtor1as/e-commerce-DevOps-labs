document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const authNavItem = document.getElementById('auth-nav-item');

  if (token && authNavItem) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      const username = decodedPayload.username || 'U';
      const firstLetter = username.charAt(0).toUpperCase();

      authNavItem.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="user-avatar" title="${username}">${firstLetter}</div>
          <button class="btn btn-outline-light ms-3" id="logout-btn">Вийти</button>
        </div>
      `;

      document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.reload();
      });
    } catch (e) {
      console.error('Invalid token', e);
      localStorage.removeItem('token');
    }
  }
});
