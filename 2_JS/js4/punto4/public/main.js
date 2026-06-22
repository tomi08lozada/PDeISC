// ── Referencia a elementos del DOM ──────────────────────────────────────────
const tablaBody = document.getElementById("tablaAlumnosBody");   // <tbody> donde se renderizan las filas de alumnos
const formulario = document.getElementById("formularioAlumno");  // Formulario para agregar un nuevo alumno
const btnToggle = document.getElementById("btnToggleTheme");     // Botón para cambiar entre modo día/noche
const toastContainer = document.getElementById("toastContainer"); // Div donde se inyectan los toasts de notificación

// Elementos del panel de estadísticas (se actualizan después de cada carga o alta)
const statTotal = document.getElementById("statTotal");
const statPromedio = document.getElementById("statPromedio");
const statAprobados = document.getElementById("statAprobados");
const statReprobados = document.getElementById("statReprobados");

// ── Modo Día / Noche ─────────────────────────────────────────────────────────

/**
 * toggleTheme()
 * Alterna la clase .dark-mode en el <body> y actualiza el texto del botón.
 * La preferencia se guarda en localStorage para persistir entre recargas.
 */
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  btnToggle.textContent = isDark ? "Modo dia" : "Modo noche";
  localStorage.setItem("tema", isDark ? "dark" : "light");
}

// Al cargar el script, aplica el tema guardado en localStorage si existe
if (localStorage.getItem("tema") === "dark") {
  document.body.classList.add("dark-mode");
  btnToggle.textContent = "Modo dia";
}

btnToggle.addEventListener("click", toggleTheme);

// ── Toasts de notificación ───────────────────────────────────────────────────

/**
 * mostrarToast(mensaje, tipo)
 * Crea dinámicamente un elemento de notificación tipo toast y lo elimina
 * automáticamente después de 3.5 segundos.
 *
 * @param {string} mensaje - Texto a mostrar en la notificación
 * @param {string} tipo    - 'ok' (verde) | 'error' (rojo); controla la clase CSS aplicada
 */
function mostrarToast(mensaje, tipo = "ok") {
  const toast = document.createElement("div");
  toast.className = `toast-msg ${tipo}`; // La clase CSS define el color según el tipo
  toast.textContent = mensaje;
  toastContainer.appendChild(toast);

  // Remueve el toast del DOM tras 3.5 segundos para no acumular elementos
  setTimeout(() => toast.remove(), 3500);
}

// ── Helpers de renderizado ───────────────────────────────────────────────────

/**
 * generarBadgeNota(nota)
 * Devuelve el HTML de un badge coloreado según el rango de la nota:
 *   >= 8 → nota-alta  (verde)
 *   >= 6 → nota-media (amarillo)
 *   < 6  → nota-baja  (rojo)
 *
 * @param {number} nota - Valor numérico de la nota (0-10)
 * @returns {string} HTML del badge
 */
function generarBadgeNota(nota) {
  const clase = nota >= 8 ? "nota-alta" : nota >= 6 ? "nota-media" : "nota-baja";
  return `<span class="nota-badge ${clase}">${nota}</span>`;
}

/**
 * filaAlumno(alumno, extraClass)
 * Genera el HTML de una fila <tr> para la tabla de alumnos.
 * Acepta una clase CSS opcional para efectos visuales (ej: resaltar fila recién agregada).
 *
 * @param {Object} alumno     - Objeto con { id, name, username, email, materia, nota }
 * @param {string} extraClass - Clase CSS adicional para la fila (por defecto vacía)
 * @returns {string} HTML del <tr>
 */
function filaAlumno(alumno, extraClass = "") {
  return `
    <tr class="${extraClass}">
      <td><strong>#${alumno.id}</strong></td>
      <td>${alumno.name}</td>
      <td>@${alumno.username}</td>
      <td><small>${alumno.email}</small></td>
      <td>${alumno.materia}</td>
      <td>${generarBadgeNota(alumno.nota)}</td>  <!-- Badge con color según la nota -->
    </tr>
  `;
}

// ── Carga inicial de datos ───────────────────────────────────────────────────

/**
 * cargarAlumnos()
 * Hace POST a /api/alumnos con body vacío para obtener todos los alumnos
 * y los renderiza en la tabla. Luego llama a cargarEstadisticas() para
 * mantener el panel sincronizado.
 * Si el fetch falla (servidor apagado, error de red), muestra una fila de error.
 */
async function cargarAlumnos() {
  try {
    const respuesta = await fetch("/api/alumnos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Body vacío: el servidor devuelve todos los alumnos sin filtro
    });

    const datos = await respuesta.json();

    // Genera todas las filas y las inyecta de una sola vez para evitar múltiples reflows del DOM
    tablaBody.innerHTML = datos.alumnos.map((alumno) => filaAlumno(alumno)).join("");

    // Actualiza las estadísticas del panel superior después de cargar la tabla
    await cargarEstadisticas();
  } catch (error) {
    // Muestra una fila de error que ocupa todas las columnas si la carga falla
    tablaBody.innerHTML = `
      <tr><td colspan="6" class="text-center text-danger py-4">Error al cargar alumnos</td></tr>
    `;
  }
}

/**
 * cargarEstadisticas()
 * Hace POST a /api/alumnos/estadisticas y actualiza los cuatro contadores
 * del panel de estadísticas: total, promedio, aprobados y reprobados.
 * Se llama después de cargarAlumnos() y después de agregar un alumno nuevo
 * para mantener los números siempre al día.
 */
async function cargarEstadisticas() {
  const respuesta = await fetch("/api/alumnos/estadisticas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}), // El servidor no requiere body para calcular estadísticas
  });
  const datos = await respuesta.json();
  const e = datos.estadisticas;

  // Actualiza cada elemento del panel con el valor recibido del servidor
  statTotal.textContent = e.totalAlumnos;
  statPromedio.textContent = e.promedioGeneral;
  statAprobados.textContent = e.alumnosAprobados;
  statReprobados.textContent = e.alumnosReprobados;
}

// ── Submit del formulario ─────────────────────────────────────────────────────

/**
 * Maneja el envío del formulario para agregar un nuevo alumno:
 *  1. Previene la recarga de página
 *  2. Extrae y limpia los valores de cada campo
 *  3. Deshabilita el botón y muestra un spinner mientras se procesa
 *  4. Hace POST a /api/alumnos/agregar con los datos
 *  5. Si tiene éxito: agrega la fila a la tabla, actualiza estadísticas y muestra toast
 *  6. Si hay error: muestra el mensaje de error en un toast
 *  7. En ambos casos: restaura el botón al estado original
 */
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // Evita que el formulario recargue la página

  // Extrae y limpia los valores de los inputs del formulario
  const nombre = document.getElementById("inputNombre").value.trim();
  const apodo = document.getElementById("inputApodo").value.trim();
  const email = document.getElementById("inputEmail").value.trim();
  const materia = document.getElementById("selectMateria").value;
  const nota = document.getElementById("inputNota").value;

  // Obtiene el botón de submit dentro del formulario para deshabilitarlo
  const btnSubmit = formulario.querySelector("button[type='submit']");

  // Deshabilita el botón y muestra spinner para evitar envíos duplicados
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Agregando...`;

  try {
    const respuesta = await fetch("/api/alumnos/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nombre, username: apodo, email, materia, nota }),
    });

    const datos = await respuesta.json();

    // fetch() no lanza error automático para respuestas 4xx/5xx, hay que verificarlo manualmente
    if (!respuesta.ok) throw new Error(datos.mensaje);

    // Agrega la nueva fila al final de la tabla con la clase 'fila-nueva' para resaltarla visualmente
    tablaBody.insertAdjacentHTML("beforeend", filaAlumno(datos.alumno, "fila-nueva"));

    // Recalcula y actualiza el panel de estadísticas con el nuevo alumno incluido
    await cargarEstadisticas();

    // Muestra notificación de éxito con el nombre e ID del alumno creado
    mostrarToast(`${datos.alumno.name} agregado con ID #${datos.alumno.id}`);

    // Limpia todos los campos del formulario para el próximo ingreso
    formulario.reset();
  } catch (error) {
    // Muestra el mensaje de error del servidor (duplicado, validación, etc.) como toast rojo
    mostrarToast(error.message, "error");
  } finally {
    // Siempre restaura el botón, independientemente de si hubo éxito o error
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Agregar alumno";
  }
});

// ── Carga inicial ─────────────────────────────────────────────────────────────

// Ejecuta la carga de alumnos al iniciar la página
cargarAlumnos();