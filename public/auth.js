const message = document.querySelector('#message');
const form = document.querySelector('#login') || document.querySelector('#register');
form?.addEventListener('submit', async e => {
  e.preventDefault(); message.textContent = 'Please wait...';
  const data = Object.fromEntries(new FormData(form));
  const endpoint = form.id === 'login' ? '/api/auth/login' : '/api/auth/register';
  try {
    const r = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    const body = await r.json();
    if (!r.ok) throw new Error(body.error || 'Request failed');
    message.textContent = body.message;
    setTimeout(() => location='/profile', 300);
  } catch (err) { message.textContent = err.message; }
});
