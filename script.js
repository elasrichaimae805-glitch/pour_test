// ===== API Helper =====
const API = "/api";
let cartId = localStorage.getItem("cartId") || "";

function apiHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (cartId) headers["X-Cart-Id"] = cartId;
    return headers;
}

function saveCartId(id) {
    cartId = id;
    localStorage.setItem("cartId", id);
}

// ===== State =====
let products = [];
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

// ===== Fetch & Render Products from API =====
async function fetchAndRenderProducts() {
    const query = searchInput.value.trim();
    const params = new URLSearchParams();
    if (currentFilter !== "all") params.set("category", currentFilter);
    if (query) params.set("search", query);

    try {
        const res = await fetch(`${API}/products?${params}`);
        products = await res.json();
    } catch {
        products = [];
    }

    renderProducts(products);
}

function renderProducts(list) {
    if (list.length === 0) {
        productsGrid.innerHTML = "";
        noResults.hidden = false;
        return;
    }

    noResults.hidden = true;
    productsGrid.innerHTML = list.map(p => `
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

    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
    });
}

// ===== Cart Functions (via API) =====
async function addToCart(productId) {
    try {
        const res = await fetch(`${API}/cart/add`, {
            method: "POST",
            headers: apiHeaders(),
            body: JSON.stringify({ productId })
        });
        const data = await res.json();
        saveCartId(data.cartId);
        cart = data.items;
        renderCart(data);
        const product = products.find(p => p.id === productId);
        showToast(`${product ? product.name : "Produit"} ajouté au panier`);
    } catch {
        showToast("Erreur lors de l'ajout au panier");
    }
}

async function removeFromCart(productId) {
    try {
        const res = await fetch(`${API}/cart/remove`, {
            method: "DELETE",
            headers: apiHeaders(),
            body: JSON.stringify({ productId })
        });
        const data = await res.json();
        cart = data.items;
        renderCart(data);
    } catch {
        showToast("Erreur lors de la suppression");
    }
}

async function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    const newQty = item.qty + delta;

    try {
        const res = await fetch(`${API}/cart/update`, {
            method: "PUT",
            headers: apiHeaders(),
            body: JSON.stringify({ productId, qty: newQty })
        });
        const data = await res.json();
        cart = data.items;
        renderCart(data);
    } catch {
        showToast("Erreur lors de la mise à jour");
    }
}

async function fetchCart() {
    try {
        const res = await fetch(`${API}/cart`, { headers: apiHeaders() });
        const data = await res.json();
        saveCartId(data.cartId);
        cart = data.items;
        renderCart(data);
    } catch {
        cart = [];
        renderCart({ items: [], total: 0 });
    }
}

function renderCart(data) {
    const items = data.items;
    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

    cartCount.textContent = totalItems;
    cartTotalPrice.textContent = formatPrice(data.total);

    if (items.length === 0) {
        cartItemsEl.innerHTML = '<p class="cart-empty">Votre panier est vide</p>';
        return;
    }

    cartItemsEl.innerHTML = items.map(item => `
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

// ===== Checkout (via API) =====
checkoutBtn.addEventListener("click", async () => {
    if (cart.length === 0) {
        showToast("Votre panier est vide !");
        return;
    }
    try {
        const res = await fetch(`${API}/cart/checkout`, {
            method: "POST",
            headers: apiHeaders()
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`${data.message} Total : ${formatPrice(data.total)} 🎉`);
            cart = [];
            renderCart({ items: [], total: 0 });
            closeCartSidebar();
        } else {
            showToast(data.error || "Erreur lors de la commande");
        }
    } catch {
        showToast("Erreur réseau lors de la commande");
    }
});

// ===== Filter Navigation =====
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        currentFilter = link.dataset.filter;
        fetchAndRenderProducts();
    });
});

// ===== Search (debounced) =====
let searchTimeout;
searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchAndRenderProducts, 300);
});

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
fetchAndRenderProducts();
fetchCart();
