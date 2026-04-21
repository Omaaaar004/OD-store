/* 
  Olympic Dcheira - Global Script
  Handles Cart Logic, LocalStorage, and UI interactions.
*/

// --- CONFIGURATION ---
const PRODUCTS = [
  { id: 1, name: 'Maillot Domicile 2024/25', category: 'jersey', price: 350, image: 'assets/images/jersey.png', badge: 'Officiel' },
  { id: 2, name: 'Maillot Extérieur 2024/25', category: 'jersey', price: 350, image: 'assets/images/jersey.png', badge: 'Away' },
  { id: 3, name: 'Maillot Third (Noir)', category: 'jersey', price: 350, image: 'assets/images/jersey.png', badge: 'Third' },
  { id: 4, name: 'Maillot Spécial (Jaune)', category: 'jersey', price: 350, image: 'assets/images/jersey.png', badge: '4ème' },
  { id: 5, name: 'Écharpe Supporter OD', category: 'scarf', price: 150, image: 'assets/images/scarf.png' },
  { id: 6, name: 'Écharpe Jacquard Ultra', category: 'scarf', price: 120, image: 'assets/images/scarf.png' },
  { id: 7, name: 'Casquette Officielle Verte', category: 'cap', price: 80, image: 'assets/images/cap.png' },
  { id: 8, name: 'Casquette Snapback Noir', category: 'cap', price: 90, image: 'assets/images/cap.png' },
];

// --- STATE ---
let cart = JSON.parse(localStorage.getItem('od_cart')) || [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  setupNavigation();
  
  // If we are on the store page, init products
  if (document.getElementById('productsGrid')) {
    renderProducts(PRODUCTS);
  }
});

// --- NAVIGATION ---
function setupNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });
}

// --- STORE LOGIC ---
function renderProducts(productsToShow) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  grid.innerHTML = '';

  productsToShow.forEach(product => {
    const card = document.createElement('div');
    card.className = 'premium-card product-card';
    card.onclick = () => openProductModal(product.id);
    
    const media = product.image 
      ? `<img src="${product.image}" alt="${product.name}" class="product-img">`
      : `<span>${product.emoji}</span>`;
      
    card.innerHTML = `
      <div class="product-image">
        ${media}
        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-footer">
          <div class="product-price">${product.price}<span class="vert"> DH</span></div>
          <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">+</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.filterProducts = function(category) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  if (category === 'all') {
    renderProducts(PRODUCTS);
  } else {
    const filtered = PRODUCTS.filter(p => p.category === category);
    renderProducts(filtered);
  }
};

// --- MODAL LOGIC ---
window.openProductModal = function(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  const modal = document.getElementById('productModal');
  const img = document.getElementById('modalImg');
  const name = document.getElementById('modalName');
  const price = document.getElementById('modalPrice');
  const category = document.getElementById('modalCategory');
  const desc = document.getElementById('modalDesc');
  const addBtn = document.getElementById('modalAddToCart');

  img.src = product.image || '';
  img.style.display = product.image ? 'block' : 'none';
  name.innerText = product.name;
  price.innerHTML = `${product.price}<span class="vert"> DH</span>`;
  category.innerText = product.category;
  
  // Set description based on category
  let description = "Article officiel certifié par Olympic Dcheira. Qualité premium et design moderne pour nos supporters.";
  if (product.category === 'jersey') description = "Le maillot officiel de la saison 2024/25. Tissu respirant, coupe athlétique et finitions soignées. Portez fièrement les couleurs du club.";
  if (product.category === 'scarf') description = "Écharpe haute qualité en acrylique doux. Parfaite pour les jours de match ou pour afficher votre passion au quotidien.";
  
  desc.innerText = description;
  
  addBtn.onclick = () => {
    addToCart(product.id);
    closeModal();
  };

  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('show'), 10);
  document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
  const modal = document.getElementById('productModal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }, 300);
};

// Close modal on click outside
window.onclick = function(event) {
  const modal = document.getElementById('productModal');
  if (event.target == modal) {
    closeModal();
  }
};

// --- CART LOGIC ---
window.addToCart = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartUI();
  showNotification('Article ajouté au panier ✓');
};

window.updateQuantity = function(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      updateCartUI();
    }
  }
};

window.removeFromCart = function(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
};

function saveCart() {
  localStorage.setItem('od_cart', JSON.stringify(cart));
}

function updateCartUI() {
  updateCartCount();
  renderCartItems();
  updateCartTotal();
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countElement = document.getElementById('cartCount');
  if (!countElement) return;

  countElement.textContent = count;
  if (count > 0) {
    countElement.classList.add('show');
  } else {
    countElement.classList.remove('show');
  }
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Votre panier est vide</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">${item.emoji}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price} DH</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
          <div class="qty-display">${item.quantity}</div>
          <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
        <button class="remove-item" onclick="removeFromCart(${item.id})">Supprimer</button>
      </div>
    </div>
  `).join('');
}

function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalElement = document.getElementById('cartTotal');
  if (totalElement) {
    totalElement.textContent = `${total} DH`;
  }
}

window.toggleCart = function() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar && overlay) {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  }
};

// --- UI UTILS ---
window.scrollToStore = function() {
  const store = document.getElementById('store');
  if (store) {
    store.scrollIntoView({ behavior: 'smooth' });
  }
};

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    background: linear-gradient(90deg, var(--vert), #00ff6b);
    color: var(--blanc);
    padding: 1rem 1.5rem;
    border-radius: 6px;
    font-weight: 700;
    z-index: 300;
    animation: slideInUp 0.3s ease-out;
    box-shadow: 0 8px 25px var(--vert-clair);
    letter-spacing: 1px;
    font-family: 'Barlow Condensed', sans-serif;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutDown 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 2500);
}

// Add animation keyframes dynamically if not in CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slideOutDown {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

window.subscribeNewsletter = function() {
  const email = document.getElementById('newsletterEmail').value.trim();
  if (!email || !email.includes('@')) {
    alert('⚠️ Veuillez entrer une adresse email valide.');
    return;
  }
  showNotification('Merci ! Vous êtes inscrit à la newsletter 💚');
  document.getElementById('newsletterEmail').value = '';
};

window.visitInstagram = function() {
  window.open('https://www.instagram.com/olympic_dcheira_store/', '_blank');
};
