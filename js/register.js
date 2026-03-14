/* ══════════════════════════════════════
   TechLearn — register.js
   ══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('register-btn').addEventListener('click', registrar);
  document.getElementById('password').addEventListener('input', updateStrength);
  document.addEventListener('keydown', e => { if (e.key === 'Enter') registrar(); });
});

// ── Password strength ──
const strengthColors = ['#ff4d6d', '#ff9f1c', '#00b4d8', '#00e5a0'];
const strengthLabels = ['Muy débil', 'Regular', 'Buena', 'Fuerte 🔥'];

function updateStrength() {
  const v = document.getElementById('password').value;
  let score = 0;
  if (v.length >= 6)  score++;
  if (v.length >= 10) score++;
  if (/[A-Z]/.test(v) && /[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;

  for (let i = 1; i <= 4; i++) {
    document.getElementById(`s${i}`).style.background =
      i <= score ? strengthColors[score - 1] : 'var(--border)';
  }
  const label = document.getElementById('strength-label');
  label.textContent  = v.length ? strengthLabels[score - 1] || '' : '';
  label.style.color  = v.length ? strengthColors[score - 1] : '';
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

// ── Register ──
function registrar() {
  clearErrors();
  const nombre   = document.getElementById('nombre').value.trim();
  const edad     = parseInt(document.getElementById('edad').value);
  const correo   = document.getElementById('correo').value.trim();
  const password = document.getElementById('password').value;
  let valid = true;

  if (!nombre)                                             { showError('nombre',   'err-nombre');   valid = false; }
  if (!edad || edad < 1 || edad > 120)                    { showError('edad',     'err-edad');     valid = false; }
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { showError('correo', 'err-correo'); valid = false; }
  if (password.length < 6)                                { showError('password', 'err-password'); valid = false; }
  if (!valid) return;

  const users = JSON.parse(localStorage.getItem('tl_users') || '[]');
  if (users.find(u => u.correo === correo)) {
    showToast('Este correo ya está registrado', 'error');
    return;
  }

  users.push({ nombre, edad, correo, password });
  localStorage.setItem('tl_users', JSON.stringify(users));

  showToast(`¡Bienvenido, ${nombre}! Registro exitoso 🚀`, 'success');
  setTimeout(() => { window.location.href = 'login.html'; }, 2000);
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
