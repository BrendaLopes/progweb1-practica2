(function () {
  const mount = document.getElementById("navbar");
  if (!mount) return;

  const getToken = () => localStorage.getItem("token") || "";

  function parseJWT(token) {
    try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
  }

  function isLoggedIn() {
    const t = getToken();
    if (!t) return false;
    const p = parseJWT(t);
    if (p?.exp && Date.now() >= p.exp * 1000) {
      localStorage.removeItem("token");
      return false;
    }
    return !!p;
  }

  function role() {
    const p = parseJWT(getToken());
    return p?.role || null;
  }

  function username() {
    const p = parseJWT(getToken());
    return p?.email ? p.email.split("@")[0] : "";
  }

  function render() {
    const logged = isLoggedIn();
    const isAdmin = role() === "admin";

    mount.innerHTML = `
<header class="topbar">
  <div class="nav-left">
    <a class="brand-link" href="/">
      <span class="logo">⚡</span>
      <span class="brand-name">Energy Market</span>
    </a>
  </div>

  <nav class="nav-center">
    <a class="nav-link" href="/shop.html">Tienda</a>
    <a class="nav-link" href="/cart.html">Carrito</a>
    <a class="nav-link" href="/chat.html">Chat</a>
    ${logged ? `<a class="nav-link" href="/account.html">Mi cuenta</a>` : ``}
    ${logged && isAdmin ? `<a class="nav-link admin" href="/admin.html">Admin</a>` : ``}
  </nav>

  <div class="nav-right">
    ${logged
      ? `<button class="btn subtle" id="btn-logout">Salir <span class="user">(${escapeHtml(username())})</span></button>`
      : `<a class="btn primary" href="/auth.html">Login / Registro</a>`
    }
  </div>
</header>
`;


    const btn = document.getElementById("btn-logout");
    if (btn) {
      btn.addEventListener("click", () => {
        localStorage.removeItem("token");
        // opcional: limpiar UI local si quieres
        window.location.href = "/"; // vuelve a home
      });
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  render();
  window.addEventListener("storage", render);
})();
