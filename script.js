// ===== Product Data =====
const products = [
    {
        id: 1,
        name: "Casque Bluetooth Pro",
        category: "electronics",
        price: 79.99,
        oldPrice: 129.99,
        desc: "Son Hi-Fi, réduction de bruit active, autonomie 30h.",
        img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    },
    {
        id: 2,
        name: "Montre Connectée Sport",
        category: "electronics",
        price: 149.99,
        oldPrice: 199.99,
        desc: "GPS intégré, capteur cardiaque, étanche 50m.",
        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
    },
    {
        id: 3,
        name: "Veste en Cuir Noir",
        category: "clothing",
        price: 189.00,
        oldPrice: null,
        desc: "Cuir véritable, coupe ajustée, doublure intérieure.",
        img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop"
    },
    {
        id: 4,
        name: "Sneakers Urban",
        category: "clothing",
        price: 89.99,
        oldPrice: 119.99,
        desc: "Semelle légère, design moderne, confort optimal.",
        img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"
    },
    {
        id: 5,
        name: "Sac à Dos Voyage",
        category: "accessories",
        price: 59.99,
        oldPrice: 79.99,
        desc: "Compartiment laptop 15\", imperméable, bretelles ergonomiques.",
        img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop"
    },
    {
        id: 6,
        name: "Lunettes de Soleil Aviator",
        category: "accessories",
        price: 45.00,
        oldPrice: null,
        desc: "Protection UV400, monture légère en métal.",
        img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop"
    },
    {
        id: 7,
        name: "Enceinte Portable",
        category: "electronics",
        price: 39.99,
        oldPrice: 59.99,
        desc: "Bluetooth 5.0, waterproof IPX7, 12h d'autonomie.",
        img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop"
    },
    {
        id: 8,
        name: "T-Shirt Premium Coton",
        category: "clothing",
        price: 29.99,
        oldPrice: null,
        desc: "100% coton bio, coupe regular, couleurs durables.",
        img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop"
    },
    {
        id: 9,
        name: "Portefeuille Cuir",
        category: "accessories",
        price: 35.00,
        oldPrice: 49.99,
        desc: "Cuir pleine fleur, protection RFID, compact.",
        img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop"
    },
    {
        id: 10,
        name: "Clavier Mécanique RGB",
        category: "electronics",
        price: 99.99,
        oldPrice: 139.99,
        desc: "Switches Cherry MX, rétro-éclairage RGB, compact TKL.",
        img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop"
    },
    {
        id: 11,
        name: "Hoodie Oversize",
        category: "clothing",
        price: 49.99,
        oldPrice: 69.99,
        desc: "Molleton épais, coupe oversized, capuche doublée.",
        img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop"
    },
    {
        id: 12,
        name: "Bracelet Acier Inox",
        category: "accessories",
        price: 25.00,
        oldPrice: null,
        desc: "Acier inoxydable 316L, fermoir magnétique, unisexe.",
        img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=300&fit=crop"
    }
];

// ===== State =====
let cart = [];
let currentFilter = "all";

// ===== DOM Elements =====
const productsGrid = document.getElementById("products-grid");
const noResults = document.getElementById("no-results");
const cartBtn = document.getElementById("cart-btn");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const closeCart = document.getElementById("close-cart");
const cartItemsEl = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotalPrice = document.getElementById("cart-total-price");
const checkoutBtn = document.getElementById("checkout-btn");
const searchInput = document.getElementById("search-input");
const navLinks = document.querySelectorAll(".nav-link");
const toast = document.getElementById("toast");

// ===== Render Products =====
function renderProducts() {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = products.filter(p => {
        const matchCategory = currentFilter === "all" || p.category === currentFilter;
        const matchSearch = p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query);
        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        productsGrid.innerHTML = "";
        noResults.hidden = false;
        return;
    }

    noResults.hidden = true;
    productsGrid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <img class="product-img" src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy">
            <div class="product-body">
                <span class="product-category">${getCategoryLabel(p.category)}</span>
                <h3 class="product-name">${escapeHtml(p.name)}</h3>
                <p class="product-desc">${escapeHtml(p.desc)}</p>
                <div class="product-footer">
                    <span class="product-price">
                        ${formatPrice(p.price)}
                        ${p.oldPrice ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>` : ""}
                    </span>
                    <button class="add-to-cart" data-id="${p.id}">Ajouter</button>
                </div>
            </div>
        </div>
    `).join("");

    // Attach event listeners
    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
    });
}

// ===== Cart Functions =====
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCart();
    showToast(`${product.name} ajouté au panier`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId);
        return;
    }
    updateCart();
}

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    cartCount.textContent = totalItems;
    cartTotalPrice.textContent = formatPrice(totalPrice);

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="cart-empty">Votre panier est vide</p>';
        return;
    }

    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img class="cart-item-img" src="${item.img}" alt="${escapeHtml(item.name)}">
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" data-id="${item.id}" data-action="minus">−</button>
                <span class="cart-item-qty">${item.qty}</span>
                <button class="qty-btn" data-id="${item.id}" data-action="plus">+</button>
                <button class="cart-item-remove" data-id="${item.id}" data-action="remove">✕</button>
            </div>
        </div>
    `).join("");

    // Attach cart item event listeners
    cartItemsEl.querySelectorAll("[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const action = btn.dataset.action;
            if (action === "plus") changeQty(id, 1);
            else if (action === "minus") changeQty(id, -1);
            else if (action === "remove") removeFromCart(id);
        });
    });
}

// ===== Cart Sidebar Toggle =====
function openCart() {
    cartSidebar.classList.add("open");
    cartOverlay.classList.add("open");
}

function closeCartSidebar() {
    cartSidebar.classList.remove("open");
    cartOverlay.classList.remove("open");
}

cartBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartSidebar);
cartOverlay.addEventListener("click", closeCartSidebar);

// ===== Checkout =====
checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("Votre panier est vide !");
        return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    showToast(`Commande de ${formatPrice(total)} confirmée ! Merci 🎉`);
    cart = [];
    updateCart();
    closeCartSidebar();
});

// ===== Filter Navigation =====
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        currentFilter = link.dataset.filter;
        renderProducts();
    });
});

// ===== Search =====
searchInput.addEventListener("input", renderProducts);

// ===== Toast Notification =====
let toastTimeout;
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===== Helpers =====
function formatPrice(price) {
    return price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function getCategoryLabel(cat) {
    const labels = {
        electronics: "Électronique",
        clothing: "Vêtements",
        accessories: "Accessoires"
    };
    return labels[cat] || cat;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ===== Init =====
renderProducts();
updateCart();
