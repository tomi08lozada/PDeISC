/**
 * main.js
 * Lógica del frontend para el sistema de gestión de alumnos.
 * Consume la API REST del servidor usando exclusivamente POST.
 *
 * Responsabilidades:
 *  - Inicializar la base de datos mediante el endpoint /api/setup
 *  - Cargar y renderizar la lista de alumnos desde /api/alumnos
 *  - Gestionar el formulario de alta y edición de alumnos
 *  - Manejar la eliminación con modal de confirmación
 *  - Controlar el modo claro/oscuro con persistencia en localStorage
 */

// ── URL base de la API ────────────────────────────────────────────────────────
/**
 * Dirección base del servidor Express.
 * Cambiar si el servidor corre en otro puerto.
 */
const API_BASE = "http://localhost:3000/api";

// ── Estado global de la aplicación ───────────────────────────────────────────
/**
 * alumnoParaEliminar: guarda el ID del alumno seleccionado para eliminar.
 * modoEdicion: indica si el formulario está en modo edición (true) o alta (false).
 * alumnosCargados: caché de la lista actual de alumnos, usada para detectar duplicados.
 */
let modoEdicion = false;
let alumnosCargados = [];

// ── Referencias al DOM ────────────────────────────────────────────────────────
const tablaBody        = document.getElementById("tablaBody");
const badgeTotal       = document.getElementById("badgeTotal");
const spinner          = document.getElementById("spinner");
const sinDatos         = document.getElementById("sinDatos");
const contenedorTabla  = document.getElementById("contenedorTabla");
const inputNombre      = document.getElementById("inputNombre");
const inputApellido    = document.getElementById("inputApellido");
const inputEdad        = document.getElementById("inputEdad");
const alumnoId         = document.getElementById("alumnoId");
const btnGuardar       = document.getElementById("btnGuardar");
const btnGuardarTexto  = document.getElementById("btnGuardarTexto");
const btnCancelar      = document.getElementById("btnCancelar");
const formTitulo       = document.getElementById("formTitulo");
const btnRefrescar     = document.getElementById("btnRefrescar");
const btnSetup         = document.getElementById("btnSetup");
const setupBanner      = document.getElementById("setupBanner");
const toggleTheme      = document.getElementById("toggleTheme");
const themeIcon        = document.getElementById("themeIcon");
const modeLabel        = document.getElementById("modeLabel");
const htmlEl           = document.documentElement;
const toastEl          = document.getElementById("toastMsg");
const toastText        = document.getElementById("toastText");

// ── Instancias de componentes Bootstrap ──────────────────────────────────────
const modalDuplicado = new bootstrap.Modal(document.getElementById("modalDuplicado"));
const toastBS        = new bootstrap.Toast(toastEl, { delay: 3000 });

// ═════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Muestra un mensaje Toast con color según el tipo.
 * @param {string} mensaje - Texto a mostrar
 * @param {"success"|"error"|"info"} tipo - Tipo de notificación
 */
function mostrarToast(mensaje, tipo = "success") {
  // Limpiar clases previas de color
  toastEl.classList.remove("toast-success", "toast-error", "toast-info");
  toastEl.classList.add(`toast-${tipo}`);
  toastText.textContent = mensaje;
  toastBS.show();
}

/**
 * Realiza una petición POST a la API con JSON.
 * @param {string} endpoint - Ruta relativa (ej: "/alumnos")
 * @param {Object} body - Datos a enviar en el cuerpo
 * @returns {Promise<Object>} Respuesta JSON del servidor
 */
async function apiPost(endpoint, body = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  // Si el servidor responde con error, lanzar excepción para manejarlo arriba
  if (!response.ok) {
    throw new Error(data.error || "Error desconocido del servidor");
  }

  return data;
}

/**
 * Muestra u oculta el spinner, mensaje de sin datos y la tabla.
 * @param {"cargando"|"vacio"|"datos"} estado - Estado visual a mostrar
 */
function establecerEstado(estado) {
  spinner.classList.add("d-none");
  sinDatos.classList.add("d-none");
  contenedorTabla.classList.add("d-none");

  if (estado === "cargando") spinner.classList.remove("d-none");
  else if (estado === "vacio") sinDatos.classList.remove("d-none");
  else if (estado === "datos") contenedorTabla.classList.remove("d-none");
}


// MODO CLARO / OSCURO
//

/**
 * Aplica el tema indicado al documento y actualiza el ícono y texto del botón.
 * Persiste la preferencia en localStorage.
 * @param {"light"|"dark"} tema - Tema a aplicar
 */
function aplicarTema(tema) {
  htmlEl.setAttribute("data-bs-theme", tema);
  localStorage.setItem("tema", tema);

  if (tema === "dark") {
    themeIcon.className = "bi bi-sun-fill";
    modeLabel.textContent = "Modo oscuro";
  } else {
    themeIcon.className = "bi bi-moon-fill";
    modeLabel.textContent = "Modo claro";
  }
}

// Al cargar la página: restaurar el tema guardado (o usar claro por defecto)
const temaGuardado = localStorage.getItem("tema") || "light";
aplicarTema(temaGuardado);

// Evento: cambiar tema al hacer clic en el botón toggle
toggleTheme.addEventListener("click", () => {
  const temaActual = htmlEl.getAttribute("data-bs-theme");
  aplicarTema(temaActual === "light" ? "dark" : "light");
});


// SETUP DE LA BASE DE DATOS


/**
 * Llama al endpoint /api/setup para crear la DB, tabla y datos de ejemplo.
 * Oculta el banner si el setup fue exitoso.
 */
async function ejecutarSetup() {
  btnSetup.disabled = true;
  btnSetup.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Inicializando...';

  try {
    const data = await apiPost("/setup");

    if (data.yaExistia) {
      mostrarToast("La base de datos ya estaba configurada.", "info");
    } else {
      mostrarToast(`Setup completado. ${data.alumnosInsertados} alumnos de ejemplo cargados.`, "success");
    }

    // Ocultar el banner de setup y cargar los alumnos
    setupBanner.classList.add("d-none");
    cargarAlumnos();

  } catch (err) {
    mostrarToast(`Error en el setup: ${err.message}`, "error");
    btnSetup.disabled = false;
    btnSetup.innerHTML = '<i class="bi bi-play-fill"></i> Inicializar DB';
  }
}

btnSetup.addEventListener("click", ejecutarSetup);


// CARGAR Y RENDERIZAR ALUMNOS


/**
 * Obtiene la lista de alumnos del servidor y renderiza la tabla.
 * Usa el endpoint POST /api/alumnos.
 */
async function cargarAlumnos() {
  establecerEstado("cargando");

  try {
    const data = await apiPost("/alumnos");
    const alumnos = data.alumnos;

    // Guardar en caché para usar en la detección de duplicados
    alumnosCargados = alumnos;

    badgeTotal.textContent = alumnos.length;

    if (alumnos.length === 0) {
      establecerEstado("vacio");
      return;
    }

    // Renderizar filas de la tabla
    tablaBody.innerHTML = alumnos
      .map(
        (a) => `
      <tr>
        <td class="ps-3 text-muted">${a.id}</td>
        <td>${escaparHTML(a.nombre)}</td>
        <td>${escaparHTML(a.apellido)}</td>
        <td>${a.edad}</td>
        <td class="text-end pe-3">
          <button
            class="btn btn-outline-primary btn-accion me-1"
            onclick="prepararEdicion(${a.id}, '${escaparHTML(a.nombre)}', '${escaparHTML(a.apellido)}', ${a.edad})"
            title="Editar alumno"
          >
            <i class="bi bi-pencil-fill"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    establecerEstado("datos");

  } catch (err) {
    mostrarToast(`Error al cargar alumnos: ${err.message}`, "error");
    establecerEstado("vacio");
  }
}

/**
 * Escapa caracteres HTML especiales para prevenir XSS al insertar en innerHTML.
 * @param {string} texto - Texto a escapar
 * @returns {string} Texto seguro para HTML
 */
function escaparHTML(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Botón refrescar: recarga la lista
btnRefrescar.addEventListener("click", cargarAlumnos);


// FORMULARIO: ALTA Y EDICIÓN


/**
 * Limpia el formulario y vuelve al modo alta (crear nuevo alumno).
 */
function resetearFormulario() {
  modoEdicion = false;
  alumnoId.value = "";
  inputNombre.value = "";
  inputApellido.value = "";
  inputEdad.value = "";

  formTitulo.textContent = "Agregar Alumno";
  formTitulo.closest(".card-header").querySelector("i").className = "bi bi-person-plus-fill";
  btnGuardarTexto.textContent = "Guardar";
  btnCancelar.classList.add("d-none");

  inputNombre.focus();
}

/**
 * Precarga el formulario con los datos del alumno para editarlo.
 * Llamado desde los botones de edición en la tabla.
 * @param {number} id - ID del alumno
 * @param {string} nombre - Nombre actual
 * @param {string} apellido - Apellido actual
 * @param {number} edad - Edad actual
 */
function prepararEdicion(id, nombre, apellido, edad) {
  modoEdicion = true;
  alumnoId.value = id;
  inputNombre.value = nombre;
  inputApellido.value = apellido;
  inputEdad.value = edad;

  formTitulo.textContent = `Editar Alumno #${id}`;
  formTitulo.closest(".card-header").querySelector("i").className = "bi bi-pencil-fill";
  btnGuardarTexto.textContent = "Actualizar";
  btnCancelar.classList.remove("d-none");

  // Hacer scroll al formulario en móvil
  document.getElementById("cardFormulario").scrollIntoView({ behavior: "smooth", block: "start" });
  inputNombre.focus();
}

// Botón cancelar edición
btnCancelar.addEventListener("click", resetearFormulario);

/**
 * Valida los campos del formulario antes de enviar.
 * @returns {boolean} true si los datos son válidos
 */
function validarFormulario() {
  const nombre   = inputNombre.value.trim();
  const apellido = inputApellido.value.trim();
  const edad     = parseInt(inputEdad.value);

  if (!nombre) {
    mostrarToast("El nombre es requerido.", "error");
    inputNombre.focus();
    return false;
  }
  if (!apellido) {
    mostrarToast("El apellido es requerido.", "error");
    inputApellido.focus();
    return false;
  }
  if (isNaN(edad) || edad < 1 || edad > 120) {
    mostrarToast("La edad debe ser un número entre 1 y 120.", "error");
    inputEdad.focus();
    return false;
  }

  return true;
}

/**
 * Busca en la caché si ya existe un alumno con el mismo nombre y apellido (sin distinguir mayúsculas).
 * En modo edición, excluye al alumno que se está editando (mismo ID) para permitir guardar sin cambios.
 * @param {string} nombre - Nombre ingresado
 * @param {string} apellido - Apellido ingresado
 * @returns {Object|null} El alumno duplicado encontrado, o null si no hay duplicado
 */
function buscarDuplicado(nombre, apellido) {
  const nombreNorm   = nombre.toLowerCase();
  const apellidoNorm = apellido.toLowerCase();
  const idActual     = modoEdicion ? parseInt(alumnoId.value) : null;

  return alumnosCargados.find((a) =>
    a.nombre.toLowerCase() === nombreNorm &&
    a.apellido.toLowerCase() === apellidoNorm &&
    a.id !== idActual
  ) || null;
}

/**
 * Muestra el modal de duplicado con el nombre del alumno ya existente.
 * Devuelve una Promise que se resuelve con true si el usuario confirma,
 * o con false si cancela (tanto con el botón Cancelar como cerrando el modal).
 * @param {Object} duplicado - Alumno duplicado encontrado (con .nombre, .apellido, .id)
 * @returns {Promise<boolean>}
 */
function abrirModalDuplicado(duplicado) {
  return new Promise((resolve) => {
    // Mostrar nombre completo e ID en el cuerpo del modal
    document.getElementById("nombreDuplicado").textContent =
      `${duplicado.nombre} ${duplicado.apellido} (ID: ${duplicado.id})`;

    // Resolver con true si el usuario hace clic en "Guardar igual"
    const btnConfirmar = document.getElementById("btnConfirmarDuplicado");
    const onConfirmar = () => {
      cleanup();
      resolve(true);
    };

    // Resolver con false si el usuario cancela o cierra el modal
    const onOcultar = () => {
      cleanup();
      resolve(false);
    };

    // Limpiar listeners para evitar acumulación entre llamadas sucesivas
    const cleanup = () => {
      btnConfirmar.removeEventListener("click", onConfirmar);
      document.getElementById("modalDuplicado").removeEventListener("hidden.bs.modal", onOcultar);
      modalDuplicado.hide();
    };

    btnConfirmar.addEventListener("click", onConfirmar, { once: true });
    document.getElementById("modalDuplicado").addEventListener("hidden.bs.modal", onOcultar, { once: true });

    modalDuplicado.show();
  });
}

/**
 * Maneja el click del botón Guardar/Actualizar.
 * Decide si llamar a crear o editar según el modo actual.
 * Antes de enviar, verifica si ya existe un alumno con el mismo nombre y apellido
 * y solicita confirmación al usuario en caso de duplicado.
 */
btnGuardar.addEventListener("click", async () => {
  if (!validarFormulario()) return;

  const nombre   = inputNombre.value.trim();
  const apellido = inputApellido.value.trim();
  const edad     = parseInt(inputEdad.value);

  btnGuardar.disabled = true;

  //Verificar duplicado de nombre y apellido
  // Si ya existe un alumno con el mismo nombre y apellido, se abre el modal
  // de confirmación. Si el usuario cancela, se aborta la operación.
  const duplicado = buscarDuplicado(nombre, apellido);
  if (duplicado) {
    const continuar = await abrirModalDuplicado(duplicado);
    if (!continuar) {
      btnGuardar.disabled = false;
      return;
    }
  }

  try {
    if (modoEdicion) {
      //Editar alumno existente
      await apiPost("/alumnos/editar", {
        id: parseInt(alumnoId.value),
        nombre,
        apellido,
        edad,
      });
      mostrarToast("Alumno actualizado correctamente.", "success");

    } else {
      //Crear nuevo alumno
      await apiPost("/alumnos/crear", { nombre, apellido, edad });
      mostrarToast("Alumno agregado correctamente.", "success");
    }

    resetearFormulario();
    cargarAlumnos();

  } catch (err) {
    mostrarToast(`Error: ${err.message}`, "error");
  } finally {
    btnGuardar.disabled = false;
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Al cargar la página se intenta traer los alumnos directamente.
 * Si la DB aún no existe, el servidor devolverá error y el banner de setup
 * permanecerá visible para que el usuario lo ejecute manualmente.
 */
cargarAlumnos();