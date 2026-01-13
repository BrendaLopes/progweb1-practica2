import { parseJWT } from "./graphql.js";

function cartKey() {
  const t = localStorage.getItem("token") || "";
  const p = parseJWT(t);
  return p?.id ? `cart:${p.id}` : "cart:guest";
}

export function getCart() {
  return JSON.parse(localStorage.getItem(cartKey()) || "[]"); // [{productId, name, price, quantity}]
}

export function setCart(items) {
  localStorage.setItem(cartKey(), JSON.stringify(items));
}

// Verificar si el usuario está autenticado antes de permitir agregar al carrito
async function addToCart(product) {
  const token = localStorage.getItem("token");

  // Si no hay token (usuario no está autenticado), redirigir a la página de login
  if (!token) {
    alert("Debes iniciar sesión para añadir productos al carrito.");
    window.location.href = "/auth.html"; // Redirigir a la página de login
    return;
  }
  
  const cart = getCart();
  const idx = cart.findIndex((i) => i.productId === product.id);
  if (idx >= 0) cart[idx].quantity += 1;
  else cart.push({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
  setCart(cart);
  updateCartChip(); // Actualizar la visualización del carrito
  alert("Producto añadido al carrito");
}

export function updateQty(productId, quantity) {
  const cart = getCart().map((i) =>
    i.productId === productId ? { ...i, quantity } : i
  ).filter((i) => i.quantity > 0);
  setCart(cart);
}

export function clearCart() {
  setCart([]);
}

export function cartTotal() {
  return getCart().reduce((acc, i) => acc + i.price * i.quantity, 0);
}

export function migrateGuestCartToUser() {
  const token = localStorage.getItem("token") || "";
  const p = parseJWT(token);
  if (!p?.id) return;

  const guestKey = "cart:guest";
  const userKey = `cart:${p.id}`;

  const guest = JSON.parse(localStorage.getItem(guestKey) || "[]");
  if (!guest.length) return;

  const user = JSON.parse(localStorage.getItem(userKey) || "[]");

  // merge por productId
  const map = new Map();
  for (const it of user) map.set(it.productId, { ...it });
  for (const it of guest) {
    if (map.has(it.productId)) map.get(it.productId).quantity += it.quantity;
    else map.set(it.productId, { ...it });
  }

  localStorage.setItem(userKey, JSON.stringify([...map.values()]));
  localStorage.removeItem(guestKey);
}

