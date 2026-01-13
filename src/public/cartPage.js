import { gql } from "./graphql.js";
import { getCart, updateQty, clearCart, cartTotal } from "./cart.js";

const ul = document.getElementById("items");
const totalEl = document.getElementById("total");
const out = document.getElementById("out");

function render() {
  const cart = getCart();
  totalEl.textContent = `Total: ${cartTotal().toFixed(2)}€`;

  if (!cart.length) {
    ul.innerHTML = `<li><div><strong>Carrito vacío</strong><div class="muted">Añade productos desde la tienda.</div></div></li>`;
    return;
  }

  ul.innerHTML = cart.map((i) => `
    <li>
      <div>
        <strong>${escapeHtml(i.name)}</strong> — ${Number(i.price).toFixed(2)}€
        <div class="muted">Cantidad: ${i.quantity} | Subtotal: ${(i.price * i.quantity).toFixed(2)}€</div>
      </div>
      <div class="actions">
        <button class="btn" data-dec="${i.productId}">-</button>
        <button class="btn" data-inc="${i.productId}">+</button>
        <button class="btn" data-del="${i.productId}">Quitar</button>
      </div>
    </li>
  `).join("");
}

ul.addEventListener("click", (e) => {
  const dec = e.target.getAttribute("data-dec");
  const inc = e.target.getAttribute("data-inc");
  const del = e.target.getAttribute("data-del");
  const cart = getCart();

  if (dec) {
    const item = cart.find((x) => x.productId === dec);
    updateQty(dec, (item?.quantity || 1) - 1);
    render();
  }
  if (inc) {
    const item = cart.find((x) => x.productId === inc);
    updateQty(inc, (item?.quantity || 0) + 1);
    render();
  }
  if (del) {
    updateQty(del, 0);
    render();
  }
});

document.getElementById("btn-clear").onclick = () => {
  clearCart();
  out.textContent = "";
  render();
};

document.getElementById("btn-buy").onclick = async () => {
  const cart = getCart();
  if (!cart.length) return alert("Carrito vacío");

  try {
    const items = cart.map((i) => ({ productId: i.productId, quantity: i.quantity }));

    const data = await gql(`
      mutation($input: CreateOrderInput!) {
        createOrder(input: $input) {
          id status total createdAt
          items { quantity price lineTotal product { id name } }
          user { id email role }
        }
      }
    `, { input: { items } }, { auth: true });

    clearCart();
    render();
    out.textContent = JSON.stringify(data.createOrder, null, 2);
    alert("Compra realizada (pedido creado)");
  } catch (e) {
    alert(e.message);
  }
};

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

render();
