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

export function addToCart(product) {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.productId === product.id);
  if (idx >= 0) cart[idx].quantity += 1;
  else cart.push({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
  setCart(cart);
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
