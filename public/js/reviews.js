// Add event listeners to all comment forms
document.querySelectorAll('.comment-form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const content = form.querySelector('textarea[name="content"]').value;
    const reviewId = Number(form.querySelector('input[name="reviewId"]').value);
    try {
      const response = await fetch('/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, reviewId }),
      });
      if (response.ok) {
        alert('Comment successfully added!');
        location.reload(); // Reload to show the new comment
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const currentUser = decodedPayload.username;

      // Show delete buttons for user's own reviews
      document.querySelectorAll('.delete-review-btn').forEach((btn) => {
        const author = btn.parentElement
          .querySelector('.review-author')
          .getAttribute('data-author');
        if (author === currentUser) {
          btn.classList.remove('d-none');
        }

        btn.addEventListener('click', async () => {
          if (!confirm('Ви впевнені, що хочете видалити цю рецензію?')) return;
          const reviewId = btn.getAttribute('data-review-id');
          try {
            const response = await fetch('/reviews/' + reviewId, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.ok) {
              alert('Рецензію видалено');
              location.reload();
            } else {
              const error = await response.json();
              alert(error.message || 'Помилка при видаленні');
            }
          } catch (e) {
            console.error(e);
            alert('Сталася помилка');
          }
        });
      });

      // Show delete buttons for user's own comments
      document.querySelectorAll('.delete-comment-btn').forEach((btn) => {
        const author = btn.parentElement
          .querySelector('.comment-author')
          .getAttribute('data-author');
        if (author === currentUser) {
          btn.classList.remove('d-none');
        }

        btn.addEventListener('click', async () => {
          if (!confirm('Ви впевнені, що хочете видалити цей коментар?')) return;
          const commentId = btn.getAttribute('data-comment-id');
          try {
            const response = await fetch('/comments/' + commentId, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.ok) {
              alert('Коментар видалено');
              location.reload();
            } else {
              const error = await response.json();
              alert(error.message || 'Помилка при видаленні');
            }
          } catch (e) {
            console.error(e);
            alert('Сталася помилка');
          }
        });
      });
    } catch (e) {
      console.error('Invalid token', e);
    }
  }
});
