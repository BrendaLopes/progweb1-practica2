import { gql } from "./graphql.js";
import { addToCart, cartCount } from "./cart.js";

const list = document.getElementById("list");
const chip = document.getElementById("cart-chip");

// 1) Esta página es “tienda completa”: requiere login
const token = localStorage.getItem("token");
if (!token) {
  alert("Debes iniciar sesión para acceder a la tienda.");
  location.href = "auth.html";
}

function updateCartChip() {
  chip.textContent = `Carrito: ${cartCount()}`;
}

async function loadProducts() {
  // products NO necesita auth en tus resolvers (no requiere ctx.user)
  const data = await gql(`
    query {
      products { id name price desc }
    }
  `);

  list.innerHTML = data.products.map((p) => `
    <li>
      <div>
        <strong>${escapeHtml(p.name)}</strong> — ${Number(p.price).toFixed(2)}€
        ${p.desc ? `<div class="muted">${escapeHtml(p.desc)}</div>` : ""}
      </div>
      <div class="actions">
        <button class="btn primary" data-add="${p.id}">Añadir al carrito</button>
      </div>
    </li>
  `).join("");

  list.onclick = (e) => {
    const id = e.target.getAttribute("data-add");
    if (!id) return;
    const p = data.products.find((x) => x.id === id);

    addToCart(p, { requireAuth: true });
    updateCartChip();
  };

  updateCartChip();
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

loadProducts().catch((e) => alert(e.message));
