from flask import Flask, jsonify, request, send_from_directory, abort
import os
import uuid

app = Flask(__name__, static_folder=".", static_url_path="")
app.secret_key = os.urandom(32)

# ===== Données Produits =====
products = [
    {
        "id": 1,
        "name": "Casque Bluetooth Pro",
        "category": "electronics",
        "price": 79.99,
        "oldPrice": 129.99,
        "desc": "Son Hi-Fi, réduction de bruit active, autonomie 30h.",
        "img": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    },
    {
        "id": 2,
        "name": "Montre Connectée Sport",
        "category": "electronics",
        "price": 149.99,
        "oldPrice": 199.99,
        "desc": "GPS intégré, capteur cardiaque, étanche 50m.",
        "img": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
    },
    {
        "id": 3,
        "name": "Veste en Cuir Noir",
        "category": "clothing",
        "price": 189.00,
        "oldPrice": None,
        "desc": "Cuir véritable, coupe ajustée, doublure intérieure.",
        "img": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop"
    },
    {
        "id": 4,
        "name": "Sneakers Urban",
        "category": "clothing",
        "price": 89.99,
        "oldPrice": 119.99,
        "desc": "Semelle légère, design moderne, confort optimal.",
        "img": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"
    },
    {
        "id": 5,
        "name": "Sac à Dos Voyage",
        "category": "accessories",
        "price": 59.99,
        "oldPrice": 79.99,
        "desc": 'Compartiment laptop 15", imperméable, bretelles ergonomiques.',
        "img": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop"
    },
    {
        "id": 6,
        "name": "Lunettes de Soleil Aviator",
        "category": "accessories",
        "price": 45.00,
        "oldPrice": None,
        "desc": "Protection UV400, monture légère en métal.",
        "img": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop"
    },
    {
        "id": 7,
        "name": "Enceinte Portable",
        "category": "electronics",
        "price": 39.99,
        "oldPrice": 59.99,
        "desc": "Bluetooth 5.0, waterproof IPX7, 12h d'autonomie.",
        "img": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop"
    },
    {
        "id": 8,
        "name": "T-Shirt Premium Coton",
        "category": "clothing",
        "price": 29.99,
        "oldPrice": None,
        "desc": "100% coton bio, coupe regular, couleurs durables.",
        "img": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop"
    },
    {
        "id": 9,
        "name": "Portefeuille Cuir",
        "category": "accessories",
        "price": 35.00,
        "oldPrice": 49.99,
        "desc": "Cuir pleine fleur, protection RFID, compact.",
        "img": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop"
    },
    {
        "id": 10,
        "name": "Clavier Mécanique RGB",
        "category": "electronics",
        "price": 99.99,
        "oldPrice": 139.99,
        "desc": "Switches Cherry MX, rétro-éclairage RGB, compact TKL.",
        "img": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop"
    },
    {
        "id": 11,
        "name": "Hoodie Oversize",
        "category": "clothing",
        "price": 49.99,
        "oldPrice": 69.99,
        "desc": "Molleton épais, coupe oversized, capuche doublée.",
        "img": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop"
    },
    {
        "id": 12,
        "name": "Bracelet Acier Inox",
        "category": "accessories",
        "price": 25.00,
        "oldPrice": None,
        "desc": "Acier inoxydable 316L, fermoir magnétique, unisexe.",
        "img": "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=300&fit=crop"
    }
]

# Stockage des paniers en mémoire (par session via un ID)
carts = {}


# ===== Routes Pages =====
@app.route("/")
def index():
    return send_from_directory(".", "index.html")


# ===== API Produits =====
@app.route("/api/products")
def get_products():
    category = chaimae.request.args.get("category", "all")
    search = request.args.get("search", "").lower().strip()

    result = products
    if category != "all":
        result = [p for p in result if p["category"] == category]
    if search:
        result = [p for p in result if search in p["name"].lower() or search in p["desc"].lower()]

    return jsonify(result)


@app.route("/api/products/<int:product_id>")
def get_product(product_id):
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        abort(404)
    return jsonify(product)


# ===== API Panier =====
def get_cart_id():
    """Récupère ou crée un identifiant de panier via un header."""
    cart_id = request.headers.get("X-Cart-Id")
    if not cart_id or cart_id not in carts:
        cart_id = str(uuid.uuid4())
        carts[cart_id] = []
    return cart_id


@app.route("/api/cart", methods=["GET"])
def get_cart():
    cart_id = get_cart_id()
    cart = carts.get(cart_id, [])
    total = sum(item["price"] * item["qty"] for item in cart)
    return jsonify({"cartId": cart_id, "items": cart, "total": round(total, 2)})


@app.route("/api/cart/add", methods=["POST"])
def add_to_cart():
    data = request.get_json()
    if not data or "productId" not in data:
        return jsonify({"error": "productId requis"}), 400

    product_id = data["productId"]
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        return jsonify({"error": "Produit non trouvé"}), 404

    cart_id = get_cart_id()
    cart = carts.setdefault(cart_id, [])

    existing = next((item for item in cart if item["id"] == product_id), None)
    if existing:
        existing["qty"] += 1
    else:
        cart.append({**product, "qty": 1})

    total = sum(item["price"] * item["qty"] for item in cart)
    return jsonify({"cartId": cart_id, "items": cart, "total": round(total, 2)})


@app.route("/api/cart/update", methods=["PUT"])
def update_cart_item():
    data = request.get_json()
    if not data or "productId" not in data or "qty" not in data:
        return jsonify({"error": "productId et qty requis"}), 400

    product_id = data["productId"]
    qty = data["qty"]

    cart_id = get_cart_id()
    cart = carts.get(cart_id, [])

    if qty <= 0:
        cart[:] = [item for item in cart if item["id"] != product_id]
    else:
        item = next((i for i in cart if i["id"] == product_id), None)
        if item:
            item["qty"] = qty

    total = sum(item["price"] * item["qty"] for item in cart)
    return jsonify({"cartId": cart_id, "items": cart, "total": round(total, 2)})


@app.route("/api/cart/remove", methods=["DELETE"])
def remove_from_cart():
    data = request.get_json()
    if not data or "productId" not in data:
        return jsonify({"error": "productId requis"}), 400

    product_id = data["productId"]
    cart_id = get_cart_id()
    cart = carts.get(cart_id, [])
    cart[:] = [item for item in cart if item["id"] != product_id]

    total = sum(item["price"] * item["qty"] for item in cart)
    return jsonify({"cartId": cart_id, "items": cart, "total": round(total, 2)})


@app.route("/api/cart/checkout", methods=["POST"])
def checkout():
    cart_id = get_cart_id()
    cart = carts.get(cart_id, [])

    if not cart:
        return jsonify({"error": "Le panier est vide"}), 400

    total = sum(item["price"] * item["qty"] for item in cart)
    order_id = str(uuid.uuid4())[:8].upper()

    # Vider le panier après la commande
    carts[cart_id] = []

    return jsonify({
        "message": f"Commande #{order_id} confirmée !",
        "orderId": order_id,
        "total": round(total, 2)
    })


# ===== Lancement =====
if __name__ == "__main__":
    print("=" * 50)
    print("  ShopZone - Serveur démarré")
    print("  http://127.0.0.1:5000")
    print("=" * 50)
    app.run(debug=True, port=5000)
