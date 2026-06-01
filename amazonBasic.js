/* =============================================
   AMAZON CLONE - app.js
   Handles: Auth, Cart, Search, UI interactions
   ============================================= */

// ─── STORAGE HELPERS ───────────────────────────
function getCart() {
    try { return JSON.parse(localStorage.getItem('amzCart')) || []; }
    catch { return []; }
}
function saveCart(cart) {
    localStorage.setItem('amzCart', JSON.stringify(cart));
}
function getUser() {
    try { return JSON.parse(localStorage.getItem('amzUser')) || null; }
    catch { return null; }
}
function saveUser(user) {
    localStorage.setItem('amzUser', JSON.stringify(user));
}
function getUsers() {
    try { return JSON.parse(localStorage.getItem('amzUsers')) || []; }
    catch { return []; }
}
function saveUsers(users) {
    localStorage.setItem('amzUsers', JSON.stringify(users));
}

// ─── INIT (runs on every page) ─────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
    updateCartBadge();

    const page = window.location.pathname.split('/').pop();

    if (page === 'cart.html') {
        renderCart();
    }
    if (page === 'login.html') {
        // If already logged in, bounce home
        if (getUser()) window.location.href = 'index.html';
    }
    if (page === 'index.html' || page === '' || page === '/') {
        setupSearch();
    }
});

// ─── GREETING ──────────────────────────────────
function updateGreeting() {
    const el = document.getElementById('userGreeting');
    if (!el) return;
    const user = getUser();
    if (user) {
        el.textContent = `Hello, ${user.name.split(' ')[0]}`;
        el.parentElement.parentElement.onclick = showAccountMenu;
    }
}

// ─── NAVIGATION ────────────────────────────────
function goToLogin() {
    const user = getUser();
    if (user) {
        if (confirm(`Signed in as ${user.name}.\nClick OK to sign out.`)) {
            localStorage.removeItem('amzUser');
            window.location.reload();
        }
    } else {
        window.location.href = 'login.html';
    }
}
function goToCart() {
    window.location.href = 'cart.html';
}

// ─── CART BADGE ────────────────────────────────
function updateCartBadge() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
}

// ─── ADD TO CART (index.html) ──────────────────
function addToCart(name, price) {
    const cart = getCart();
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        const icons = { 
            'Clothes': '👗', 'Health & Personal Care': '💊',
            'Furniture': '🛋️', 'Android Phone': '📱',
            'Beauty Products': '💄', 'Pet Care': '🐾',
            'Toy': '🧸', 'Fashion Item': '👠'
        };
        cart.push({ name, price, qty: 1, icon: icons[name] || '📦' });
    }
    saveCart(cart);
    updateCartBadge();
    showToast(`✓ ${name} added to cart!`);

    // Animate the button
    event.target.classList.add('added');
    event.target.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
    setTimeout(() => {
        event.target.classList.remove('added');
        event.target.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
    }, 1500);
}

// ─── TOAST NOTIFICATION ────────────────────────
let toastTimer;
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── SEARCH ────────────────────────────────────
function setupSearch() {
    const input = document.getElementById('searchInput');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
}
function handleSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const query = input.value.trim().toLowerCase();
    if (!query) return;

    const boxes = document.querySelectorAll('.box');
    let found = 0;
    boxes.forEach(box => {
        const text = box.innerText.toLowerCase();
        const cat = (box.dataset.category || '').toLowerCase();
        if (text.includes(query) || cat.includes(query)) {
            box.style.display = 'block';
            box.style.outline = '2px solid #f3a847';
            found++;
        } else {
            box.style.display = 'none';
            box.style.outline = '';
        }
    });

    if (found === 0) {
        showToast(`No results for "${input.value}"`);
        boxes.forEach(b => { b.style.display = 'block'; b.style.outline = ''; });
    }
}

// ─── LOGIN PAGE ────────────────────────────────
function showRegister() {
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('registerBox').style.display = 'block';
    document.getElementById('regError').style.display = 'none';
}
function showLogin() {
    document.getElementById('registerBox').style.display = 'none';
    document.getElementById('loginBox').style.display = 'block';
    document.getElementById('authError').style.display = 'none';
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('authError');

    if (!email || !password) {
        showAuthError(errEl, 'Please enter your email and password.');
        return;
    }
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        showAuthError(errEl, 'Incorrect email or password. Please try again.');
        document.getElementById('loginPassword').value = '';
        return;
    }
    saveUser({ name: user.name, email: user.email });
    window.location.href = 'index.html';
}

function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pwd = document.getElementById('regPassword').value;
    const pwd2 = document.getElementById('regPassword2').value;
    const errEl = document.getElementById('regError');

    if (!name || !email || !pwd || !pwd2) {
        showAuthError(errEl, 'Please fill in all fields.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAuthError(errEl, 'Enter a valid email address.'); return;
    }
    if (pwd.length < 6) {
        showAuthError(errEl, 'Password must be at least 6 characters.'); return;
    }
    if (pwd !== pwd2) {
        showAuthError(errEl, 'Passwords do not match.'); return;
    }
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        showAuthError(errEl, 'An account with this email already exists.'); return;
    }
    users.push({ name, email, password: pwd });
    saveUsers(users);
    saveUser({ name, email });
    window.location.href = 'index.html';
}

function showAuthError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
    } else {
        input.type = 'password';
        btn.textContent = 'Show';
    }
}

// ─── CART PAGE ─────────────────────────────────
function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cartItems');
    const emptyMsg = document.getElementById('emptyCart');
    const subtotalRow = document.getElementById('cartSubtotalRow');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (subtotalRow) subtotalRow.style.display = 'none';
        updateSummary(0, 0);
        return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';
    if (subtotalRow) subtotalRow.style.display = 'block';

    container.innerHTML = cart.map((item, idx) => `
        <div class="cart-item" id="item-${idx}">
            <div class="cart-item-img">${item.icon || '📦'}</div>
            <div class="cart-item-info">
                <p class="cart-item-name">${item.name}</p>
                <p class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</p>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
                    <span class="qty-display">${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
                    <span class="remove-link" onclick="removeItem(${idx})">Delete</span>
                </div>
            </div>
        </div>
    `).join('');

    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
    updateSummary(totalItems, totalPrice);
}

function updateSummary(items, price) {
    const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;
    const label = `${items} item${items !== 1 ? 's' : ''}`;
    const els = {
        itemCountLabel: label,
        subtotalAmount: fmt(price),
        sidebarItemCount: label,
        sidebarSubtotal: fmt(price)
    };
    Object.entries(els).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    });
    updateCartBadge();
}

function changeQty(idx, delta) {
    const cart = getCart();
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
}

function removeItem(idx) {
    const cart = getCart();
    const removed = cart.splice(idx, 1)[0];
    saveCart(cart);
    renderCart();
}

function clearCart() {
    if (confirm('Remove all items from cart?')) {
        saveCart([]);
        renderCart();
    }
}

function handleCheckout() {
    const cart = getCart();
    if (cart.length === 0) { alert('Your cart is empty!'); return; }

    const user = getUser();
    if (!user) {
        if (confirm('Please sign in to checkout.\nGo to sign-in page?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    saveCart([]);
    document.getElementById('checkoutModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('checkoutModal').style.display = 'none';
    window.location.href = 'index.html';
}