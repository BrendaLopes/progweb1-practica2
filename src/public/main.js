import { migrateGuestCartToUser } from "./cart.js";

const API = "http://localhost:4000/api";
const $ = (id) => document.getElementById(id);

// ---------- fetch helper ----------
async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

// ---------- status chip ----------
function updateStatusChip() {
  const chip = $("status-chip");
  if (!chip) return;
  const hasToken = !!localStorage.getItem("token");
  chip.textContent = hasToken ? "online" : "offline";
  chip.classList.toggle("ok", hasToken);
}

// ---------- AUTH page wiring ----------
function initAuthPage() {
  const btnRegister = $("btn-register");
  const btnLogin = $("btn-login");
  const out = $("auth-out");

  // Si no estamos en auth.html, salimos
  if (!btnRegister || !btnLogin) return;

  updateStatusChip();
  window.addEventListener("storage", updateStatusChip);

  btnRegister.onclick = async () => {
    try {
      const body = {
        name: $("name")?.value.trim(),
        email: $("email")?.value.trim(),
        password: $("pass")?.value,
        role: $("role")?.value,
      };

      const data = await api("/auth/register", { method: "POST", body });

      if (data.token) {
        localStorage.setItem("token", data.token);
        // migrateGuestCartToUser(); // si lo quieres
        updateStatusChip();
        location.href = "/"; // o "/home.html" si tu home real es ese
      }

      if (out) out.textContent = JSON.stringify(data, null, 2);
    } catch (e) {
      alert(e.message);
    }
  };

  btnLogin.onclick = async () => {
    try {
      const body = {
        email: $("email")?.value.trim(),
        password: $("pass")?.value,
      };

      const data = await api("/auth/login", { method: "POST", body });

      if (data.token) {
        localStorage.setItem("token", data.token);
        // migrateGuestCartToUser();
        updateStatusChip();
        location.href = "/"; // o "/home.html"
      }

      if (out) out.textContent = JSON.stringify(data, null, 2);
    } catch (e) {
      alert(e.message);
    }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  initAuthPage();
});
