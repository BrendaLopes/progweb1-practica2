import { gql } from "./graphql.js";

const grid = document.getElementById("public-products");
const count = document.getElementById("count-chip");

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Mapa rápido de imágenes (sin tocar BD)
function productImage(p, i) {
  return `assets/energy${(i % 3) + 1}.png`;
}

async function load() {
  const data = await gql(`
    query {
      products { id name price desc }
    }
  `);

  const items = (data.products || []).slice(0, 6);
  if (count) {
  count.textContent = items.length;
}

  grid.innerHTML = items.map((p, i) => `
    <article class="p-card">
      <img class="p-img" src="${productImage(p, i)}" alt="${escapeHtml(p.name)}">

      <div class="p-body">
        <div class="p-title">${escapeHtml(p.name)}</div>
        <div class="p-meta">${escapeHtml(p.desc || "Bebida energética premium")}</div>
        <div class="p-price">${Number(p.price).toFixed(2)}€</div>

        <div class="p-actions">
          <button class="btn" disabled title="Inicia sesión para comprar">
            Inicia sesión para añadir
          </button>
          <a class="btn primary" href="auth.html">Comprar</a>
        </div>
      </div>
    </article>
  `).join("");
}

load().catch(e => alert(e.message));
