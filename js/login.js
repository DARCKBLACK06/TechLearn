/* ══════════════════════════════════════
   TechLearn — login.js
   ══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initUserHint();
  document.getElementById('login-btn').addEventListener('click', login);
  document.getElementById('toggle-btn').addEventListener('click', togglePw);
  document.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
});

// ── Hint de usuarios registrados ──
function initUserHint() {
  const users = JSON.parse(localStorage.getItem('tl_users') || '[]');
  const msg   = document.getElementById('user-count-msg');
  if (users.length === 0) {
    msg.innerHTML = 'Aún no hay usuarios. <a href="register.html">¡Regístrate primero!</a>';
  } else {
    msg.innerHTML = `<strong>${users.length}</strong> usuario${users.length > 1 ? 's' : ''} registrado${users.length > 1 ? 's' : ''}. Inicia sesión.`;
  }
}

// ── Toggle password ──
function togglePw() {
  const inp = document.getElementById('password');
  const btn = document.getElementById('toggle-btn');
  if (inp.type === 'password') { inp.type = 'text';     btn.textContent = '🙈'; }
  else                         { inp.type = 'password'; btn.textContent = '👁️'; }
}

// ── Validation ──
function clearErrors() {
  document.querySelectorAll('.field-error').forEach(e => e.style.display = 'none');
  document.querySelectorAll('input').forEach(i => i.classList.remove('error-input'));
}
function showError(fieldId, errId) {
  document.getElementById(fieldId).classList.add('error-input');
  document.getElementById(errId).style.display = 'block';
}

// ── Login ──
function login() {
  clearErrors();
  const correo   = document.getElementById('correo').value.trim();
  const password = document.getElementById('password').value;
  let valid = true;

  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { showError('correo',   'err-correo');   valid = false; }
  if (!password)                                               { showError('password', 'err-password'); valid = false; }
  if (!valid) return;

  const users = JSON.parse(localStorage.getItem('tl_users') || '[]');
  const user  = users.find(u => u.correo === correo && u.password === password);

  if (!user) {
    const card = document.getElementById('auth-card');
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
    showToast('Correo o contraseña incorrectos', 'error');
    showError('correo',   'err-correo');
    showError('password', 'err-password');
    return;
  }

  localStorage.setItem('tl_session', JSON.stringify({ nombre: user.nombre, correo: user.correo }));
  showToast(`¡Hola, ${user.nombre}! Cargando tienda... 🛒`, 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 1800);
}

// ── Toast ──
function showToast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', warn: '⚠️' };
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-msg">${msg}</span>
    <button class="toast-close" onclick="removeToast(this.parentElement)">✕</button>
  `;
  container.appendChild(t);
  setTimeout(() => removeToast(t), 4000);
}
function removeToast(el) {
  if (!el || !el.parentElement) return;
  el.style.animation = 'slideOut .3s ease forwards';
  setTimeout(() => el.remove(), 300);
}
