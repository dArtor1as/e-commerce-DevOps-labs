document
  .getElementById('create-review-form')
  .addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const content = document.getElementById('content').value;
    const movieId = Number(
      document.querySelector('input[name="movieId"]').value,
    );
    try {
      const response = await fetch('/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, movieId }),
      });
      if (response.ok) {
        alert('Рецензія успішно створена');
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  });

document
  .getElementById('rate-film-form')
  .addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const value = Number(
      document.querySelector('input[name="value"]:checked').value,
    );
    const movieId = Number(
      document.querySelector('input[name="movieId"]').value,
    );
    try {
      const response = await fetch('/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value, movieId }),
      });
      if (response.ok) {
        alert('Рейтинг успішно збережено');
        location.reload();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  });

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const movieIdInput = document.querySelector('input[name="movieId"]');

  if (token && movieIdInput) {
    const movieId = movieIdInput.value;
    try {
      const response = await fetch(`/ratings/movie/${movieId}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.value) {
          const starRadio = document.getElementById(`rateStar${data.value}`);
          if (starRadio) {
            starRadio.checked = true;
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user rating:', error);
    }
  }
});
