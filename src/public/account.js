import { gql, parseJWT } from "./graphql.js";

const ordersUl = document.getElementById("orders");
const detail = document.getElementById("detail");
const userInfo = document.getElementById("user-info");

const token = localStorage.getItem("token");
if (!token) {
  alert("Debes iniciar sesión");
  location.href = "auth.html";
}

const user = parseJWT(token);
userInfo.textContent = `${user.email} — rol: ${user.role}`;

async function loadOrders() {
  try {
    const data = await gql(`
      query {
        orders {
          id status total createdAt
          items {
            quantity price lineTotal
            product { name }
          }
        }
      }
    `);

    if (!data.orders.length) {
      ordersUl.innerHTML = `<li><div>No tienes pedidos todavía.</div></li>`;
      return;
    }

    ordersUl.innerHTML = data.orders.map((o) => `
      <li>
        <div>
          <strong>Pedido ${o.id}</strong>
          <div class="muted">
            ${o.status} — ${o.total.toFixed(2)}€ — ${new Date(o.createdAt).toLocaleString()}
          </div>
        </div>
        <div class="actions">
          <button class="btn" data-view="${o.id}">Ver detalle</button>
        </div>
      </li>
    `).join("");

    ordersUl.onclick = (e) => {
      const id = e.target.getAttribute("data-view");
      if (!id) return;
      const order = data.orders.find((x) => x.id === id);
      detail.textContent = JSON.stringify(order, null, 2);
    };

  } catch (e) {
    alert(e.message);
  }
}

loadOrders();
