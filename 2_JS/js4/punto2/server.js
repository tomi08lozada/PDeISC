const express = require("express");
const axios = require("axios");   // Usado para consultar la API pública y simular la creación de usuarios
const cors = require("cors");     // Permite peticiones cross-origin desde el frontend
const path = require("path");     // Utilidad de Node para construir rutas de sistema de archivos

const app = express();
const PORT = 3002;

// URL de la API pública usada para obtener usuarios existentes y simular el POST de creación
const API_PUBLICA = "https://jsonplaceholder.typicode.com/users";

// Datos de respaldo para cuando la API pública no está disponible
// A diferencia del Proyecto 1, estos no incluyen 'id' porque se asigna al registrar
const USUARIOS_RESPALDO = [
  { name: "Leanne Graham", username: "Bret", email: "Sincere@april.biz" },
  { name: "Ervin Howell", username: "Antonette", email: "Shanna@melissa.tv" },
  { name: "Clementine Bauch", username: "Samantha", email: "Nathan@yesenia.net" },
  { name: "Patricia Lebsack", username: "Karianne", email: "Julianne.OConner@kory.org" },
  { name: "Chelsey Dietrich", username: "Kamren", email: "Lucio_Hettinger@annie.ca" },
  { name: "Mrs. Dennis Schulist", username: "Leopoldo_Corkery", email: "Karley_Dach@jasper.info" },
  { name: "Kurtis Weissnat", username: "Elwyn.Skiles", email: "Telly.Hoeger@billy.biz" },
  { name: "Nicholas Runolfsdottir V", username: "Maxime_Nienow", email: "Sherwood@rosamond.me" },
  { name: "Glenna Reichert", username: "Delphine", email: "Chaim_McDermott@dana.io" },
  { name: "Clementina DuBuque", username: "Moriah.Stanton", email: "Rey.Padberg@karina.biz" },
];

// Array en memoria que almacena los usuarios creados durante la sesión del servidor
// Se resetea al reiniciar el proceso (no hay persistencia en base de datos)
const usuariosRegistrados = [];

// Cache en memoria de los usuarios obtenidos desde la API pública
// Evita llamadas repetidas a JSONPlaceholder en cada petición
let usuariosApiCache = null;

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());                                              // Habilita CORS para todas las rutas
app.use(express.json());                                      // Parsea el body JSON de las peticiones entrantes
app.use(express.static(path.join(__dirname, "public")));      // Sirve el frontend desde /public

// Normaliza un string: elimina espacios al inicio/fin y convierte a minúsculas
// Usado para comparaciones case-insensitive en la detección de duplicados
const normalizar = (valor = "") => valor.trim().toLowerCase();

/**
 * obtenerUsuariosApi()
 * Obtiene los usuarios de JSONPlaceholder y los guarda en caché.
 * Si ya fueron cargados antes, devuelve el caché sin hacer una nueva petición.
 * En caso de error de red, usa USUARIOS_RESPALDO.
 *
 * @returns {Promise<Array>} Array de { name, username, email }
 */
async function obtenerUsuariosApi() {
  // Si ya tenemos datos en caché, los devolvemos directamente (evita peticiones redundantes)
  if (usuariosApiCache) return usuariosApiCache;

  try {
    const respuesta = await axios.get(API_PUBLICA);
    // Normaliza los datos de la API extrayendo solo los campos relevantes
    usuariosApiCache = respuesta.data.map((usuario) => ({
      name: usuario.name,
      username: usuario.username,
      email: usuario.email,
    }));
  } catch (error) {
    // Si la API pública no responde, se usan los datos de respaldo hardcodeados
    usuariosApiCache = USUARIOS_RESPALDO;
  }

  return usuariosApiCache;
}

/**
 * buscarDuplicado(usuarios, { nombre, apodo, email })
 * Verifica si alguno de los tres campos ya existe en la lista combinada
 * de usuarios de la API + usuarios registrados en la sesión.
 *
 * @param {Array}  usuarios - Lista completa de usuarios a comparar
 * @param {Object} campos   - { nombre, apodo, email } del nuevo usuario a registrar
 * @returns {string|null}   - Mensaje de error si hay duplicado, null si no hay
 */
function buscarDuplicado(usuarios, { nombre, apodo, email }) {
  const nombreNormalizado = normalizar(nombre);
  const apodoNormalizado = normalizar(apodo);
  const emailNormalizado = normalizar(email);

  // Verifica duplicado de nombre (soporta tanto 'name' como 'nombre' por compatibilidad)
  if (usuarios.some((u) => normalizar(u.name || u.nombre) === nombreNormalizado)) {
    return "El nombre ya fue utilizado";
  }

  // Verifica duplicado de apodo (soporta tanto 'username' como 'apodo')
  if (usuarios.some((u) => normalizar(u.username || u.apodo) === apodoNormalizado)) {
    return "El apodo ya fue utilizado";
  }

  // Verifica duplicado de email
  if (usuarios.some((u) => normalizar(u.email) === emailNormalizado)) {
    return "El email ya fue utilizado";
  }

  // No se encontraron duplicados
  return null;
}

/**
 * GET /api/usuarios-existentes
 * Devuelve la lista combinada de usuarios de la API pública + los registrados en la sesión.
 * El frontend la usa para mostrar el listado y validar duplicados en tiempo real.
 *
 * Respuesta: { ok: true, usuarios: [...] }
 */
app.get("/api/usuarios-existentes", async (req, res) => {
  try {
    const usuariosApi = await obtenerUsuariosApi();

    // Combina los usuarios de la API con los registrados localmente en esta sesión
    res.json({
      ok: true,
      usuarios: [...usuariosApi, ...usuariosRegistrados],
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "No se pudieron cargar los usuarios" });
  }
});

/**
 * POST /api/crear-usuario
 * Valida y registra un nuevo usuario en memoria.
 * Verifica duplicados contra la API pública y los ya registrados en la sesión.
 * Simula la creación en JSONPlaceholder para obtener un ID generado.
 *
 * Body esperado: { nombre: string, apodo: string, email: string }
 * Respuesta exitosa (201): { ok, idGenerado, datos, mensaje }
 * Respuesta de error (400/409/500): { ok, campo, mensaje }
 */
app.post("/api/crear-usuario", async (req, res) => {
  const { nombre, apodo, email } = req.body;

  // Validación básica: los tres campos son obligatorios
  if (!nombre || !apodo || !email) {
    return res.status(400).json({
      ok: false,
      campo: "general",
      mensaje: "Nombre, apodo y email son obligatorios",
    });
  }

  // Validación de formato de email con expresión regular
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      ok: false,
      campo: "email",
      mensaje: "El formato del email no es valido",
    });
  }

  try {
    // Obtiene la lista completa de usuarios para verificar duplicados
    const usuariosApi = await obtenerUsuariosApi();

    // Busca si alguno de los tres campos ya existe en la base combinada
    const duplicado = buscarDuplicado([...usuariosApi, ...usuariosRegistrados], {
      nombre,
      apodo,
      email,
    });

    if (duplicado) {
      // Determina qué campo está duplicado para que el frontend pueda resaltar el input correcto
      const campo = duplicado.includes("nombre")
        ? "nombre"
        : duplicado.includes("apodo")
        ? "apodo"
        : "email";

      // 409 Conflict: el recurso ya existe
      return res.status(409).json({ ok: false, campo, mensaje: duplicado });
    }

    // Simula la creación en JSONPlaceholder para obtener el ID que devuelve la API
    // JSONPlaceholder siempre responde con id: 11 en este endpoint
    const respuesta = await axios.post(API_PUBLICA, {
      name: nombre.trim(),
      username: apodo.trim(),
      email: email.trim(),
    });

    // Construye el objeto del usuario recién creado con el ID de la API simulada
    const usuarioCreado = {
      id: respuesta.data.id,
      name: nombre.trim(),
      username: apodo.trim(),
      email: email.trim(),
    };

    // Guarda el nuevo usuario en memoria para incluirlo en futuras validaciones de duplicados
    usuariosRegistrados.push(usuarioCreado);

    // Responde con 201 Created y los datos del usuario generado
    res.status(201).json({
      ok: true,
      idGenerado: usuarioCreado.id,
      datos: usuarioCreado,
      mensaje: `Usuario creado con ID: ${usuarioCreado.id}`,
    });
  } catch (error) {
    // Error inesperado (fallo de red al llamar a JSONPlaceholder, etc.)
    res.status(500).json({ ok: false, mensaje: "Error al crear el usuario" });
  }
});

// ── Inicio del servidor ──────────────────────────────────────────────────────
// Pone a escuchar el servidor en el puerto 3002 y confirma en consola
app.listen(PORT, () => {
  console.log(`Proyecto 2 corriendo en http://localhost:${PORT}`);
});