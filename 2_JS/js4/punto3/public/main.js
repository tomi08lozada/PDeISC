/**
 * PROYECTO 3 — main.js
 * Propósito: Obtener todos los usuarios vía POST y filtrarlos
 *            en tiempo real al escribir en el campo de búsqueda.
 *
 * Flujo:
 *  1. Al hacer clic en "Cargar Usuarios", se hace POST /api/usuarios.
 *  2. Los usuarios se guardan en un array global 'todosLosUsuarios'.
 *  3. Cada vez que el usuario escribe, se filtra el array por nombre.
 *  4. Se re-renderizan solo los que coinciden, resaltando la búsqueda.
 */

// ── Elementos del DOM ────────────────────────────────────────────────────────
const btnCargar = document.getElementById("btnCargar");
const campoBusqueda = document.getElementById("campoBusqueda");
const contenedor = document.getElementById("contenedorUsuarios");
const contadorResultados = document.getElementById("contadorResultados");
const mensajeVacio = document.getElementById("mensajeVacio");
const estadoInicial = document.getElementById("estadoInicial");
const btnToggle = document.getElementById("btnToggleTheme");

// ── Estado global ────────────────────────────────────────────────────────────
// Aquí guardamos TODOS los usuarios obtenidos de la API.
// El filtrado se hace sobre este array sin volver a hacer peticiones.
let todosLosUsuarios = [];

// ═══════════════════════════════════════════════════════════════════════════
// MODO DÍA / NOCHE
// ═══════════════════════════════════════════════════════════════════════════

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  btnToggle.textContent = isDark ? "☀️ Modo Día" : "🌙 Modo Noche";
  localStorage.setItem("tema", isDark ? "dark" : "light");
}

(function aplicarTemaGuardado() {
  if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark-mode");
    btnToggle.textContent = "☀️ Modo Día";
  }
})();

btnToggle.addEventListener("click", toggleTheme);

// ═══════════════════════════════════════════════════════════════════════════
// RESALTAR TEXTO (HIGHLIGHT)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * resaltarTexto(texto, busqueda)
 * Envuelve la parte del texto que coincide con la búsqueda en una etiqueta <mark>.
 * La comparación es insensible a mayúsculas/minúsculas.
 *
 * @param {string} texto    - Texto original del nombre
 * @param {string} busqueda - Término de búsqueda actual
 * @returns {string}        - HTML con el término resaltado
 */
function resaltarTexto(texto, busqueda) {
  if (!busqueda.trim()) return texto; // Sin búsqueda, devolver sin cambios

  // Escapar caracteres especiales de regex para evitar errores
  const escapado = busqueda.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapado})`, "gi"); // 'gi' = global + insensible a mayús

  return texto.replace(regex, "<mark>$1</mark>");
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERIZAR USUARIOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * renderUsuarios(usuarios, terminoBusqueda)
 * Genera las tarjetas HTML para el array de usuarios dado.
 * Si hay un término de búsqueda, resalta las coincidencias en el nombre.
 *
 * @param {Array}  usuarios       - Array filtrado de usuarios a mostrar
 * @param {string} terminoBusqueda - Término actual del input de búsqueda
 */
function renderUsuarios(usuarios, terminoBusqueda = "") {
  contenedor.innerHTML = "";
  mensajeVacio.style.display = "none";

  // Si no hay resultados, mostrar mensaje
  if (usuarios.length === 0) {
    mensajeVacio.style.display = "block";
    contadorResultados.textContent = "Sin resultados";
    return;
  }

  // Actualizar contador
  const total = todosLosUsuarios.length;
  const mostrando = usuarios.length;
  contadorResultados.textContent =
    terminoBusqueda
      ? `Mostrando ${mostrando} de ${total} usuarios`
      : `${total} usuarios cargados`;

  // Generar las tarjetas con animación escalonada
  usuarios.forEach((usuario, indice) => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-4";

    // Nombre con highlight de la búsqueda
    const nombreResaltado = resaltarTexto(usuario.name, terminoBusqueda);
    const inicial = usuario.name.charAt(0).toUpperCase();

    col.innerHTML = `
      <div class="card h-100 p-3 card-animate" style="animation-delay: ${indice * 40}ms">
        <div class="d-flex align-items-center gap-3 mb-2">
          <div class="avatar-circle">${inicial}</div>
          <div class="nombre-usuario fw-bold">${nombreResaltado}</div>
        </div>
        <div class="info-chip mb-1">@${usuario.username}</div>
        <div class="info-chip mb-1">${usuario.email}</div>
        <div class="info-chip">${usuario.address.city} - ${usuario.website}</div>
      </div>
    `;

    contenedor.appendChild(col);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTRAR USUARIOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * filtrarUsuarios()
 * Lee el valor del input de búsqueda y filtra el array global.
 * La comparación es insensible a mayúsculas/minúsculas.
 * Se ejecuta en cada pulsación de tecla (evento 'input').
 */
function filtrarUsuarios() {
  const termino = campoBusqueda.value.trim().toLowerCase();

  if (!termino) {
    // Sin búsqueda: mostrar todos
    renderUsuarios(todosLosUsuarios, "");
    return;
  }

  // Filtrar: incluye solo los que contienen el término en el nombre
  const filtrados = todosLosUsuarios.filter((usuario) =>
    usuario.name.toLowerCase().includes(termino)
  );

  renderUsuarios(filtrados, termino);
}

// ═══════════════════════════════════════════════════════════════════════════
// CARGAR USUARIOS (POST)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * cargarUsuarios()
 * Hace POST /api/usuarios para obtener todos los usuarios.
 * Guarda el resultado en el array global y renderiza las tarjetas.
 */
async function cargarUsuarios() {
  btnCargar.disabled = true;
  btnCargar.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
    Cargando...
  `;
  estadoInicial.style.display = "none";

  try {
    // POST con fetch al servidor
    const respuesta = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    const datos = await respuesta.json();

    // Guardar en estado global
    todosLosUsuarios = datos.usuarios;

    // Habilitar el campo de búsqueda
    campoBusqueda.disabled = false;
    campoBusqueda.focus();

    // Renderizar todos los usuarios
    renderUsuarios(todosLosUsuarios, "");

    // Actualizar botón
    btnCargar.textContent = "🔄 Recargar";
    btnCargar.disabled = false;
  } catch (error) {
    estadoInicial.style.display = "block";
    estadoInicial.innerHTML = `<span class="text-danger">❌ Error: ${error.message}</span>`;
    btnCargar.disabled = false;
    btnCargar.textContent = "🔄 Reintentar";
    console.error("Error al cargar:", error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════

// Botón para cargar los usuarios
btnCargar.addEventListener("click", cargarUsuarios);

// Input de búsqueda: filtrar en cada tecla presionada
campoBusqueda.addEventListener("input", filtrarUsuarios);

// Limpiar con Escape
campoBusqueda.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    campoBusqueda.value = "";
    filtrarUsuarios();
  }
});
