/**
 * PROYECTO 1 — main.js
 * Propósito: Obtener usuarios de la API usando PRIMERO fetch y LUEGO axios,
 *            ambos con método POST hacia nuestro propio servidor.
 *
 * Flujo:
 *  1. Al cargar la página, se muestra el botón "Cargar con fetch".
 *  2. Al hacer clic, se hace POST /api/usuarios con fetch.
 *  3. El botón "Cargar con axios" repite la operación usando axios.
 *  4. Los datos se renderizan en tarjetas Bootstrap.
 */

// ── Referencia a elementos del DOM ──────────────────────────────────────────
const btnFetch = document.getElementById("btnFetch");
const btnAxios = document.getElementById("btnAxios");
const btnToggle = document.getElementById("btnToggleTheme");
const contenedor = document.getElementById("contenedorUsuarios");
const estadoMsg = document.getElementById("estadoMensaje");
const metodoBadge = document.getElementById("metodoBadge");

// ── URL base del servidor ───────────────────────────────────────────────────
const API_URL = "/api/usuarios";

// ═══════════════════════════════════════════════════════════════════════════
// MODO DÍA / NOCHE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * toggleTheme()
 * Agrega/quita la clase .dark-mode del <body> y actualiza el texto del botón.
 * El estado se guarda en localStorage para persistir entre recargas.
 */
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  btnToggle.textContent = isDark ? "☀️ Modo Día" : "🌙 Modo Noche";
  localStorage.setItem("tema", isDark ? "dark" : "light");
}

// Al cargar la página, aplicar el tema guardado
(function aplicarTemaGuardado() {
  const tema = localStorage.getItem("tema");
  if (tema === "dark") {
    document.body.classList.add("dark-mode");
    btnToggle.textContent = "☀️ Modo Día";
  }
})();

btnToggle.addEventListener("click", toggleTheme);

// ═══════════════════════════════════════════════════════════════════════════
// RENDER DE USUARIOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * renderUsuarios(usuarios, metodo)
 * Recibe el array de usuarios y el nombre del método (fetch/axios)
 * y construye dinámicamente las tarjetas Bootstrap en el contenedor.
 *
 * @param {Array}  usuarios - Array de { id, name, username, email }
 * @param {string} metodo   - Nombre del método HTTP client utilizado
 */
function renderUsuarios(usuarios, metodo) {
  // Limpiamos el contenedor antes de renderizar
  contenedor.innerHTML = "";
  metodoBadge.textContent = `Cargado con: ${metodo}`;
  metodoBadge.className = `badge ${
    metodo === "fetch" ? "bg-success" : "bg-warning text-dark"
  } mb-3`;
  metodoBadge.style.display = "inline-block";

  // Iteramos cada usuario y creamos su card
  usuarios.forEach((usuario) => {
    // Obtenemos la inicial del nombre para el avatar
    const inicial = usuario.name.charAt(0).toUpperCase();

    // Creamos el elemento columna
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-4";

    // HTML de la card
    col.innerHTML = `
      <div class="card h-100 p-3">
        <div class="d-flex align-items-center gap-3 mb-2">
          <div class="avatar-circle">${inicial}</div>
          <div>
            <div class="card-title mb-0">${usuario.name}</div>
            <small class="text-muted">ID #${usuario.id} - @${usuario.username}</small>
          </div>
        </div>
        <div class="card-text">
          <span class="email-badge">${usuario.email}</span>
        </div>
      </div>
    `;

    contenedor.appendChild(col);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MOSTRAR / OCULTAR ESTADO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * mostrarEstado(tipo, mensaje)
 * Muestra un mensaje de estado (cargando, error, éxito) debajo del hero.
 *
 * @param {string} tipo    - 'cargando' | 'error' | 'ok' | 'oculto'
 * @param {string} mensaje - Texto a mostrar
 */
function mostrarEstado(tipo, mensaje = "") {
  if (tipo === "oculto") {
    estadoMsg.style.display = "none";
    return;
  }

  estadoMsg.style.display = "block";

  const clases = {
    cargando: "text-primary",
    error: "text-danger",
    ok: "text-success",
  };

  estadoMsg.className = clases[tipo] || "";
  estadoMsg.innerHTML =
    tipo === "cargando"
      ? `<span class="spinner-border spinner-border-sm me-2" role="status"></span>${mensaje}`
      : mensaje;
}

// ═══════════════════════════════════════════════════════════════════════════
// MÉTODO 1: FETCH con POST
// ═══════════════════════════════════════════════════════════════════════════

/**
 * cargarConFetch()
 * Realiza una petición POST al servidor usando la API nativa fetch().
 * El método POST es obligatorio según el requisito del proyecto.
 */
async function cargarConFetch() {
  mostrarEstado("cargando", "Cargando usuarios con fetch...");
  contenedor.innerHTML = "";
  metodoBadge.style.display = "none";

  try {
    // POST al endpoint de nuestro servidor
    const respuesta = await fetch(API_URL, {
      method: "POST", // Método POST obligatorio
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // Body vacío (el servidor no lo requiere pero POST lo necesita)
    });

    // Verificar que la respuesta fue exitosa (status 200-299)
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    // Parsear el JSON de respuesta
    const datos = await respuesta.json();

    mostrarEstado("ok", `✅ ${datos.total} usuarios cargados correctamente`);
    renderUsuarios(datos.usuarios, "fetch");
  } catch (error) {
    // Mostrar error en pantalla si algo falla
    mostrarEstado("error", `❌ Error con fetch: ${error.message}`);
    console.error("Error fetch:", error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MÉTODO 2: AXIOS con POST
// ═══════════════════════════════════════════════════════════════════════════

/**
 * cargarConAxios()
 * Realiza una petición POST al servidor usando la librería axios.
 * Axios simplifica el manejo de errores y el parseo JSON automático.
 */
async function cargarConAxios() {
  mostrarEstado("cargando", "Cargando usuarios con axios...");
  contenedor.innerHTML = "";
  metodoBadge.style.display = "none";

  try {
    // axios.post() envía automáticamente Content-Type: application/json
    const respuesta = await axios.post(API_URL, {}); // {} = body vacío

    const datos = respuesta.data; // axios ya parsea el JSON automáticamente

    mostrarEstado("ok", `✅ ${datos.total} usuarios cargados correctamente`);
    renderUsuarios(datos.usuarios, "axios");
  } catch (error) {
    // axios adjunta el error HTTP en error.response
    const msg = error.response
      ? `Error ${error.response.status}`
      : error.message;
    mostrarEstado("error", `❌ Error con axios: ${msg}`);
    console.error("Error axios:", error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════
btnFetch.addEventListener("click", cargarConFetch);
btnAxios.addEventListener("click", cargarConAxios);
