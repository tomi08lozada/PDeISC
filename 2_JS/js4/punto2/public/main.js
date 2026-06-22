// ── Referencia a elementos del DOM ──────────────────────────────────────────
const formulario = document.getElementById("formularioUsuario");  // Formulario de creación de usuario
const inputNombre = document.getElementById("inputNombre");       // Campo de texto para el nombre
const inputApodo = document.getElementById("inputApodo");         // Campo de texto para el apodo/username
const inputEmail = document.getElementById("inputEmail");         // Campo de texto para el email
const btnEnviar = document.getElementById("btnEnviar");           // Botón de submit del formulario
const resultado = document.getElementById("resultado");           // Div donde se muestra el resultado tras crear un usuario
const btnToggle = document.getElementById("btnToggleTheme");      // Botón para cambiar entre modo día/noche
const listaUsuarios = document.getElementById("listaUsuarios");   // Contenedor donde se renderizan las tarjetas de usuarios existentes
const contadorUsuarios = document.getElementById("contadorUsuarios"); // Elemento que muestra el total de usuarios

// Array local con todos los usuarios existentes (API + registrados en la sesión)
// Se usa para la validación de duplicados en tiempo real en el frontend
let usuariosExistentes = [];

// Normaliza un string: elimina espacios al inicio/fin y convierte a minúsculas
// Usada para comparaciones case-insensitive al detectar duplicados
const normalizar = (valor) => valor.trim().toLowerCase();

// ── Modo Día / Noche ─────────────────────────────────────────────────────────

/**
 * toggleTheme()
 * Alterna la clase .dark-mode en el <body> y actualiza el texto del botón.
 * El estado se persiste en localStorage para sobrevivir recargas de página.
 */
function toggleTheme() {
  // classList.toggle devuelve true si la clase quedó agregada (modo oscuro activado)
  const isDark = document.body.classList.toggle("dark-mode");
  btnToggle.textContent = isDark ? "Modo dia" : "Modo noche";
  localStorage.setItem("tema", isDark ? "dark" : "light");
}

// Al cargar el script, aplica inmediatamente el tema guardado en localStorage
if (localStorage.getItem("tema") === "dark") {
  document.body.classList.add("dark-mode");
  btnToggle.textContent = "Modo dia";
}

// Registra el evento de clic para alternar el tema
btnToggle.addEventListener("click", toggleTheme);

// ── Validación visual de inputs ──────────────────────────────────────────────

/**
 * setFeedback(input, mensaje)
 * Aplica estilos de validación de Bootstrap al input y muestra u oculta el mensaje de error.
 *
 * @param {HTMLElement} input   - El campo de formulario a marcar
 * @param {string}      mensaje - Mensaje de error. Si está vacío, se marca como válido
 */
function setFeedback(input, mensaje = "") {
  // Limpia cualquier estado previo (válido o inválido) antes de aplicar el nuevo
  input.classList.remove("is-valid", "is-invalid");

  if (!mensaje) {
    // Sin mensaje → el campo es válido (borde verde de Bootstrap)
    input.classList.add("is-valid");
    return;
  }

  // Con mensaje → el campo es inválido (borde rojo de Bootstrap)
  input.classList.add("is-invalid");

  // Busca el elemento hermano .invalid-feedback dentro del mismo contenedor y actualiza su texto
  input.parentElement.querySelector(".invalid-feedback").textContent = mensaje;
}

/**
 * validarDuplicado(campo, valor)
 * Verifica en el array local si el valor ya existe para el campo dado.
 * La comparación es case-insensitive gracias a normalizar().
 *
 * @param {string} campo - Nombre de la propiedad a comparar ('name', 'username', 'email')
 * @param {string} valor - Valor ingresado por el usuario
 * @returns {boolean}    - true si ya existe un usuario con ese valor en ese campo
 */
function validarDuplicado(campo, valor) {
  const actual = normalizar(valor);
  return usuariosExistentes.some((usuario) => normalizar(usuario[campo] || "") === actual);
}

/**
 * validarFormulario()
 * Valida los tres campos del formulario: longitud mínima, solo letras, formato de email y duplicados.
 * Aplica feedback visual en cada campo usando setFeedback().
 *
 * @returns {boolean} - true si el formulario es válido, false si tiene algún error
 */
function validarFormulario() {
  let valido = true;

  // Extrae y limpia los valores de cada input
  const nombre = inputNombre.value.trim();
  const apodo = inputApodo.value.trim();
  const email = inputEmail.value.trim();

  // Solo permite letras (incluyendo tildes y ñ) y espacios — sin números ni símbolos
  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

  // Expresión regular para validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validación del nombre: mínimo 2 caracteres, solo letras y sin duplicados
  if (nombre.length < 2) {
    setFeedback(inputNombre, "El nombre debe tener al menos 2 caracteres.");
    valido = false;
  } else if (!soloLetras.test(nombre)) {
    setFeedback(inputNombre, "El nombre solo puede contener letras.");
    valido = false;
  } else if (validarDuplicado("name", nombre)) {
    setFeedback(inputNombre, "El nombre ya fue utilizado.");
    valido = false;
  } else {
    setFeedback(inputNombre); // Marca como válido
  }

  // Validación del apodo: mínimo 2 caracteres, solo letras y sin duplicados
  if (apodo.length < 2) {
    setFeedback(inputApodo, "El apodo debe tener al menos 2 caracteres.");
    valido = false;
  } else if (!soloLetras.test(apodo)) {
    setFeedback(inputApodo, "El apodo solo puede contener letras.");
    valido = false;
  } else if (validarDuplicado("username", apodo)) {
    setFeedback(inputApodo, "El apodo ya fue utilizado.");
    valido = false;
  } else {
    setFeedback(inputApodo); // Marca como válido
  }

  // Validación del email: formato correcto y sin duplicados
  if (!emailRegex.test(email)) {
    setFeedback(inputEmail, "Ingresa un email valido.");
    valido = false;
  } else if (validarDuplicado("email", email)) {
    setFeedback(inputEmail, "El email ya fue utilizado.");
    valido = false;
  } else {
    setFeedback(inputEmail); // Marca como válido
  }

  return valido;
}

// ── Render de usuarios ───────────────────────────────────────────────────────

/**
 * renderUsuarios()
 * Recorre usuariosExistentes y construye las tarjetas en el DOM.
 * También actualiza el contador con la cantidad total de usuarios.
 */
function renderUsuarios() {
  // Actualiza el texto del contador con el total actual
  contadorUsuarios.textContent = `${usuariosExistentes.length} usuarios`;

  // Genera el HTML de todas las tarjetas y lo inserta en el contenedor
  listaUsuarios.innerHTML = usuariosExistentes
    .map(
      (usuario) => `
        <div class="col-12 col-md-6">
          <article class="user-card">
            <!-- Avatar circular con la inicial del nombre del usuario -->
            <div class="avatar">${usuario.name.charAt(0).toUpperCase()}</div>
            <div class="min-w-0">
              <strong>${usuario.name}</strong>
              <span>@${usuario.username}</span>
              <small>${usuario.email}</small>
            </div>
          </article>
        </div>
      `
    )
    .join(""); // Une todos los strings HTML sin separadores
}

/**
 * cargarUsuariosExistentes()
 * Hace GET al servidor para obtener la lista combinada de usuarios
 * (API pública + registrados en la sesión) y la almacena en usuariosExistentes.
 * Luego llama a renderUsuarios() para mostrarlos en pantalla.
 */
async function cargarUsuariosExistentes() {
  const respuesta = await axios.get("/api/usuarios-existentes");
  usuariosExistentes = respuesta.data.usuarios;
  renderUsuarios();
}

// ── Mostrar resultado de la operación ────────────────────────────────────────

/**
 * mostrarResultado(tipo, datos)
 * Actualiza el div #resultado con el resultado de intentar crear un usuario.
 *
 * @param {string} tipo  - 'exito' o 'error'
 * @param {Object} datos - En éxito: { idGenerado, datos: { name, username, email } }
 *                         En error: { mensaje }
 */
function mostrarResultado(tipo, datos) {
  // Aplica la clase CSS correcta según el tipo de resultado
  resultado.className = tipo === "exito" ? "result-box result-ok" : "result-box result-error";

  // Renderiza el contenido del resultado según el tipo
  resultado.innerHTML =
    tipo === "exito"
      ? `
        <span>ID generado por la API</span>
        <strong>#${datos.idGenerado}</strong>
        <p class="mb-0">${datos.datos.name} (@${datos.datos.username}) - ${datos.datos.email}</p>
      `
      : `<strong>${datos.mensaje}</strong>`; // Solo muestra el mensaje de error
}

// ── Listeners de limpieza de validación ──────────────────────────────────────

// Al escribir en cualquiera de los inputs, se quita el estado de validación visual
// para no mostrar errores mientras el usuario todavía está corrigiendo
[inputNombre, inputApodo, inputEmail].forEach((input) => {
  input.addEventListener("input", () => input.classList.remove("is-valid", "is-invalid"));
});

// ── Submit del formulario ─────────────────────────────────────────────────────

/**
 * Maneja el envío del formulario:
 *  1. Previene el comportamiento nativo del navegador (recarga de página)
 *  2. Valida los campos con validarFormulario()
 *  3. Si es válido, hace POST al servidor y actualiza la lista en pantalla
 *  4. Si hay error del servidor, resalta el campo afectado y muestra el mensaje
 */
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // Evita que el formulario recargue la página

  // Limpia el resultado anterior
  resultado.className = "";
  resultado.innerHTML = "";

  // Si la validación falla, detiene el proceso (el feedback ya fue aplicado por validarFormulario)
  if (!validarFormulario()) return;

  // Deshabilita el botón y muestra spinner mientras se procesa la petición
  btnEnviar.disabled = true;
  btnEnviar.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Enviando...`;

  try {
    // Envía los datos al servidor para crear el usuario
    const respuesta = await axios.post("/api/crear-usuario", {
      nombre: inputNombre.value.trim(),
      apodo: inputApodo.value.trim(),
      email: inputEmail.value.trim(),
    });

    // Agrega el nuevo usuario al array local para que aparezca en la lista y futuras validaciones
    usuariosExistentes.push(respuesta.data.datos);

    // Vuelve a renderizar la lista con el nuevo usuario incluido
    renderUsuarios();

    // Muestra el resultado exitoso con el ID generado
    mostrarResultado("exito", respuesta.data);

    // Limpia el formulario y quita los estilos de validación
    formulario.reset();
    [inputNombre, inputApodo, inputEmail].forEach((input) =>
      input.classList.remove("is-valid", "is-invalid")
    );
  } catch (error) {
    // El servidor devuelve { ok, campo, mensaje } en errores 4xx
    const data = error.response?.data || { mensaje: "Ocurrio un error al crear el usuario" };

    // Si el servidor indica qué campo está en conflicto, resalta ese input
    if (data.campo === "nombre") setFeedback(inputNombre, data.mensaje);
    if (data.campo === "apodo") setFeedback(inputApodo, data.mensaje);
    if (data.campo === "email") setFeedback(inputEmail, data.mensaje);

    // Muestra el mensaje de error en el bloque de resultado
    mostrarResultado("error", data);
  } finally {
    // Siempre restaura el botón, haya éxito o error
    btnEnviar.disabled = false;
    btnEnviar.textContent = "Crear usuario";
  }
});

// ── Carga inicial ─────────────────────────────────────────────────────────────

// Carga los usuarios al iniciar la página
// Si falla, muestra un error en el contador y en el contenedor de la lista
cargarUsuariosExistentes().catch(() => {
  contadorUsuarios.textContent = "Error";
  listaUsuarios.innerHTML = `<div class="alert alert-danger">No se pudieron cargar los usuarios existentes.</div>`;
});