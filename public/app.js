document.addEventListener('DOMContentLoaded', () => {
  setupFeedbackForm();
  setupConnectForm();
});


// 2. Handle Connect / Inquiry Form Submission
function setupConnectForm() {
  const form = document.getElementById('connect-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const statusBox = document.getElementById('conn-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    statusBox.textContent = 'Sending message...';
    statusBox.style.color = 'var(--text-muted)';
    submitBtn.disabled = true;

    const payload = {
      sender_name: document.getElementById('conn-name').value.trim(),
      sender_email: document.getElementById('conn-email').value.trim(),
      subject: document.getElementById('conn-subject').value.trim(),
      message: document.getElementById('conn-message').value.trim()
    };

    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        statusBox.textContent = '✓ Message delivered successfully! Saved in database.';
        statusBox.style.color = '#4ade80';
        form.reset();
      } else {
        const data = await res.json();
        statusBox.textContent = `✗ ${data.error || 'Failed to send message.'}`;
        statusBox.style.color = '#f87171';
      }
    } catch (err) {
      console.error('Connect error:', err);
      statusBox.textContent = '✗ Network error. Please check server connection.';
      statusBox.style.color = '#f87171';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Inside setupFeedbackForm() in public/app.js
function setupFeedbackForm() {
  const form = document.getElementById('feedback-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Posting...';
    submitBtn.disabled = true;

    // Read selected radio star value (default to 5 if not selected)
    const selectedRating = form.querySelector('input[name="rating"]:checked');
    const ratingValue = selectedRating ? parseInt(selectedRating.value, 10) : 5;

    const payload = {
      client_name: document.getElementById('fb-name').value.trim(),
      designation: document.getElementById('fb-designation').value.trim(),
      source_url: document.getElementById('fb-source').value.trim() || null,
      message: document.getElementById('fb-message').value.trim(),
      rating: ratingValue
    };

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        form.reset();
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      console.error('Feedback error:', err);
      alert('Network error. Could not post feedback.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}