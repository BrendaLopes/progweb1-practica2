import { parseJWT } from "./graphql.js";

function getUserIdFromToken() {
  const t = localStorage.getItem("token") || "";
  const p = parseJWT(t);
  return p?.id || null;
}

function cartKey() {
  const uid = getUserIdFromToken();
  return uid ? `cart:${uid}` : "cart:guest";
}

export function getCart() {
  return JSON.parse(localStorage.getItem(cartKey()) || "[]"); 
  // [{productId, name, price, quantity}]
}

export function setCart(items) {
  localStorage.setItem(cartKey(), JSON.stringify(items));
}

export function clearCart() {
  setCart([]);
}

export function updateQty(productId, quantity) {
  const cart = getCart()
    .map((i) => (i.productId === productId ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  setCart(cart);
}

export function cartTotal() {
  return getCart().reduce((acc, i) => acc + i.price * i.quantity, 0);
}

export function cartCount() {
  return getCart().reduce((acc, i) => acc + i.quantity, 0);
}

/**
 * Añadir al carrito:
 * - si requireAuth=true y no hay token -> redirige a auth
 * - si requireAuth=false -> NO añade (devuelve false) (para home pública)
 */
export function addToCart(product, { requireAuth = true } = {}) {
  const token = localStorage.getItem("token");

  if (requireAuth && !token) {
    alert("Debes iniciar sesión para añadir productos al carrito.");
    location.href = "auth.html";
    return false;
  }

  if (!token && !requireAuth) {
    // En home pública: no añadimos
    return false;
  }

  const cart = getCart();
  const idx = cart.findIndex((i) => i.productId === product.id);

  if (idx >= 0) cart[idx].quantity += 1;
  else cart.push({ productId: product.id, name: product.name, price: product.price, quantity: 1 });

  setCart(cart);
  return true;
}

/**
 * Si quieres mantener carrito invitado y al loguear mezclarlo:
 */
export function migrateGuestCartToUser() {
  const uid = getUserIdFromToken();
  if (!uid) return;

  const guestKey = "cart:guest";
  const userKey = `cart:${uid}`;

  const guest = JSON.parse(localStorage.getItem(guestKey) || "[]");
  if (!guest.length) return;

  const user = JSON.parse(localStorage.getItem(userKey) || "[]");

  const map = new Map();
  for (const it of user) map.set(it.productId, { ...it });
  for (const it of guest) {
    if (map.has(it.productId)) map.get(it.productId).quantity += it.quantity;
    else map.set(it.productId, { ...it });
  }

  localStorage.setItem(userKey, JSON.stringify([...map.values()]));
  localStorage.removeItem(guestKey);
}
