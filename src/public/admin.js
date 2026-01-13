import { gql, parseJWT } from "./graphql.js";

const API = "/api";
const usersUl = document.getElementById("users");
const ordersUl = document.getElementById("orders");
const detail = document.getElementById("detail");
const filter = document.getElementById("filter");

function requireAdmin() {
  const t = localStorage.getItem("token") || "";
  const p = parseJWT(t);
  if (!p) throw new Error("Login primero");
  if (p.role !== "admin") throw new Error("Solo admin");
  return t;
}

async function api(path, { method = "GET", body } = {}) {
  const token = requireAdmin();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  const r = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (r.status === 204) return null;
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || `Error ${r.status}`);
  return data;
}

// ---------- Usuarios (REST) ----------
document.getElementById("btn-users").onclick = async () => {
  try {
    const users = await api("/admin/users");
    usersUl.innerHTML = users.map((u) => `
      <li>
        <div>
          <strong>${escapeHtml(u.email)}</strong>
          <div class="muted">Rol: <b>${u.role}</b> | ${new Date(u.createdAt).toLocaleString()}</div>
        </div>
        <div class="actions">
          <button class="btn" data-role="${u._id}" data-next="${u.role === "admin" ? "user" : "admin"}">
            Cambiar a ${u.role === "admin" ? "user" : "admin"}
          </button>
          <button class="btn" data-del="${u._id}">Eliminar</button>
        </div>
      </li>
    `).join("");

    usersUl.onclick = async (e) => {
      const idRole = e.target.getAttribute("data-role");
      const nextRole = e.target.getAttribute("data-next");
      const idDel = e.target.getAttribute("data-del");

      if (idRole) {
        await api(`/admin/users/${idRole}/role`, { method: "PUT", body: { role: nextRole } });
        alert("Rol actualizado");
        document.getElementById("btn-users").click();
      }

      if (idDel) {
        const ok = confirm("¿Eliminar usuario?");
        if (!ok) return;
        await api(`/admin/users/${idDel}`, { method: "DELETE" });
        alert("Usuario eliminado");
        document.getElementById("btn-users").click();
      }
    };
  } catch (e) {
    alert(e.message);
  }
};

// ---------- Pedidos (GraphQL) ----------
document.getElementById("btn-orders").onclick = async () => {
  try {
    requireAdmin();
    detail.textContent = "";
    const status = filter.value || null;

    const data = await gql(`
      query($status: OrderStatus) {
        orders(status: $status) {
          id status total createdAt
          user { id email }
          items { quantity price lineTotal product { id name } }
        }
      }
    `, { status }, { auth: true });

    ordersUl.innerHTML = data.orders.map((o) => `
      <li>
        <div>
          <strong>Pedido ${o.id}</strong>
          <div class="muted">
            ${o.user.email} — ${o.status} — ${Number(o.total).toFixed(2)}€ — ${new Date(o.createdAt).toLocaleString()}
          </div>
        </div>
        <div class="actions">
          <button class="btn" data-view="${o.id}">Ver</button>
          <button class="btn" data-status="${o.id}" data-next="${o.status === "PENDING" ? "COMPLETED" : "PENDING"}">
            Marcar ${o.status === "PENDING" ? "COMPLETED" : "PENDING"}
          </button>
        </div>
      </li>
    `).join("");

    ordersUl.onclick = async (e) => {
      const viewId = e.target.getAttribute("data-view");
      const statusId = e.target.getAttribute("data-status");
      const next = e.target.getAttribute("data-next");

      if (viewId) {
        const order = data.orders.find((x) => x.id === viewId);
        detail.textContent = JSON.stringify(order, null, 2);
      }
      if (statusId) {
        await gql(`
          mutation($id: ID!, $status: OrderStatus!) {
            updateOrderStatus(id: $id, status: $status) { id status }
          }
        `, { id: statusId, status: next }, { auth: true });

        alert("Estado actualizado");
        document.getElementById("btn-orders").click();
      }
    };
  } catch (e) {
    alert(e.message);
  }
};

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
