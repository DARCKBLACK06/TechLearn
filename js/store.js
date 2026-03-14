/* ══════════════════════════════════════
   TechLearn — store.js
   ══════════════════════════════════════ */

// ── Data ──
const courses = [
  { id:1,  name:'Python desde Cero',      tag:'BACKEND',     icon:'🐍', price:499, desc:'Variables, funciones, POO y proyectos reales con Python 3.' },
  { id:2,  name:'JavaScript Moderno',     tag:'FRONTEND',    icon:'⚡', price:549, desc:'ES6+, promesas, async/await y el DOM al máximo.' },
  { id:3,  name:'React + Hooks',          tag:'FRONTEND',    icon:'⚛️', price:649, desc:'Componentes, estado, Context API y proyectos completos.' },
  { id:4,  name:'Node.js & Express',      tag:'BACKEND',     icon:'🟢', price:599, desc:'APIs REST, middleware, autenticación y bases de datos.' },
  { id:5,  name:'Docker & Containers',    tag:'DEVOPS',      icon:'🐳', price:579, desc:'Imágenes, volúmenes, redes y Docker Compose.' },
  { id:6,  name:'Git & GitHub Pro',       tag:'HERRAMIENTAS',icon:'🔀', price:299, desc:'Ramas, merges, pull requests y workflows profesionales.' },
  { id:7,  name:'SQL & Bases de Datos',   tag:'DATABASE',    icon:'🗄️', price:499, desc:'Consultas, joins, índices y optimización de queries.' },
  { id:8,  name:'Ciberseguridad Básica',  tag:'SECURITY',    icon:'🔐', price:699, desc:'Ethical hacking, vulnerabilidades y protocolos seguros.' },
  { id:9,  name:'Linux para Devs',        tag:'SISTEMAS',    icon:'🐧', price:399, desc:'Terminal, permisos, scripting y administración de servidores.' },
  { id:10, name:'TypeScript Avanzado',    tag:'FRONTEND',    icon:'🔷', price:549, desc:'Tipos, generics, decorators y proyectos escalables.' },
  { id:11, name:'Flutter & Dart',         tag:'MOBILE',      icon:'📱', price:649, desc:'Apps nativas iOS y Android desde un solo código base.' },
  { id:12, name:'Machine Learning',       tag:'IA',          icon:'🤖', price:799, desc:'Regresión, clasificación, redes neuronales y scikit-learn.' },
];

const bannerColors = {
  BACKEND:     'linear-gradient(135deg,#0a2340,#0d3b6e)',
  FRONTEND:    'linear-gradient(135deg,#0d2b1a,#0d4a2a)',
  DEVOPS:      'linear-gradient(135deg,#1a1a0d,#3a3a00)',
  HERRAMIENTAS:'linear-gradient(135deg,#1a0a2e,#2e0d5c)',
  DATABASE:    'linear-gradient(135deg,#0d1a2e,#0d2e4a)',
  SECURITY:    'linear-gradient(135deg,#2e0a0a,#5c1a1a)',
  SISTEMAS:    'linear-gradient(135deg,#0a1a0a,#1a3a1a)',
  MOBILE:      'linear-gradient(135deg,#1a0d2e,#2e1a5c)',
  IA:          'linear-gradient(135deg,#0d1a2e,#1a3a5c)',
};

// ── State ──
let cart    = JSON.parse(localStorage.getItem('tl_cart')    || '[]');
let session = JSON.parse(localStorage.getItem('tl_session') || 'null');

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  renderCourses();
  updateCartUI();
  bindEvents();
});

// ── Navbar según sesión ──
function initNav() {
  if (session) {
    document.getElementById('nav-guest').style.display  = 'none';
    document.getElementById('nav-user').style.display   = 'flex';
    document.getElementById('user-name').textContent    = session.nombre;
  } else {
    document.getElementById('nav-guest').style.display  = 'flex';
    document.getElementById('nav-user').style.display   = 'none';
  }
}

// ── Bind events ──
function bindEvents() {
  document.getElementById('cart-open-btn').addEventListener('click', openCart);
  document.getElementById('cart-close-btn').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.getElementById('checkout-btn').addEventListener('click', checkout);
  document.getElementById('clear-btn').addEventListener('click', clearCart);
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
}

// ── Render courses ──
function renderCourses() {
  const grid = document.getElementById('courses-grid');
  grid.innerHTML = courses.map(c => {
    const inCart = cart.find(i => i.id === c.id);
    return `
      <div class="course-card">
        <div class="course-banner" style="background:${bannerColors[c.tag] || 'var(--card2)'}">
          ${c.icon}
        </div>
        <div class="course-body">
          <div class="course-tag">${c.tag}</div>
          <div class="course-name">${c.name}</div>
          <div class="course-desc">${c.desc}</div>
          <div class="course-footer">
            <div class="course-price">$${c.price} <small>MXN</small></div>
            <button
              class="add-btn ${inCart ? 'added' : ''}"
              id="add-btn-${c.id}"
              onclick="handleAddToCart(${c.id})"
            >${inCart ? '✓ Agregado' : '+ Agregar'}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Add to cart — verifica sesión ──
function handleAddToCart(id) {
  if (!session) {
    openModal();
    return;
  }
  addToCart(id);
}

function addToCart(id) {
  const course   = courses.find(c => c.id === id);
  const existing = cart.find(i => i.id === id);

  if (existing) {
    existing.qty++;
    showToast(`+1 "${course.name}" en el carrito`, 'warn');
  } else {
    cart.push({ ...course, qty: 1 });
    showToast(`"${course.name}" agregado 🎉`, 'success');
    const btn = document.getElementById(`add-btn-${id}`);
    if (btn) { btn.classList.add('added'); btn.textContent = '✓ Agregado'; }
  }

  saveCart();
  updateCartUI();
  bumpCount();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
  renderCartPanel();
  // reset botón
  const btn = document.getElementById(`add-btn-${id}`);
  if (btn) { btn.classList.remove('added'); btn.textContent = '+ Agregar'; }
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  saveCart();
  updateCartUI();
  renderCartPanel();
}

function clearCart() {
  if (cart.length === 0) { showToast('El carrito ya está vacío', 'warn'); return; }
  cart = [];
  saveCart();
  updateCartUI();
  renderCartPanel();
  renderCourses();
  showToast('Carrito vaciado', 'warn');
}

function checkout() {
  if (cart.length === 0) return;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  showToast(`¡Compra de $${total.toLocaleString()} MXN procesada! 🎉`, 'success');
  cart = [];
  saveCart();
  updateCartUI();
  renderCartPanel();
  renderCourses();
  closeCart();
}

function saveCart() { localStorage.setItem('tl_cart', JSON.stringify(cart)); }

// ── UI updates ──
function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const qty   = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = qty;
  document.getElementById('cart-qty').textContent   = qty;
  document.getElementById('cart-total').textContent = `$${total.toLocaleString()} MXN`;
  document.getElementById('cart-footer').style.display = cart.length ? 'block' : 'none';
}

function renderCartPanel() {
  const container = document.getElementById('cart-items');
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>Tu carrito está vacío.<br/>¡Agrega algunos cursos!</p>
      </div>`;
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-icon">${item.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toLocaleString()} MXN</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

function bumpCount() {
  const el = document.getElementById('cart-count');
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

// ── Cart panel ──
function openCart() {
  renderCartPanel();
  document.getElementById('cart-panel').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-panel').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Modal ──
function openModal() {
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Logout ──
function logout() {
  localStorage.removeItem('tl_session');
  showToast('Sesión cerrada. ¡Hasta pronto! 👋', 'warn');
  setTimeout(() => { window.location.reload(); }, 1500);
}

// ── Toast ──
function showToast(msg, type = 'success') {
  const icons = { success:'✅', error:'❌', warn:'⚠️' };
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-msg">${msg}</span>
    <button class="toast-close" onclick="removeToast(this.parentElement)">✕</button>
  `;
  container.appendChild(t);
  setTimeout(() => removeToast(t), 3500);
}
function removeToast(el) {
  if (!el || !el.parentElement) return;
  el.style.animation = 'slideOut .3s ease forwards';
  setTimeout(() => el.remove(), 300);
}
