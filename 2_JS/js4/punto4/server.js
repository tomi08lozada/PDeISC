const express = require("express");
const cors = require("cors");     // Permite peticiones cross-origin desde el frontend
const path = require("path");     // Utilidad de Node para construir rutas del sistema de archivos

const app = express();
const PORT = 3004;

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());                                             // Habilita CORS para todas las rutas
app.use(express.json());                                     // Parsea el body JSON de las peticiones entrantes
app.use(express.static(path.join(__dirname, "public")));     // Sirve el frontend (HTML, CSS, JS) desde /public

// Array en memoria que actúa como base de datos de alumnos
// Cada alumno tiene: id, nombre, apodo, email, materia y nota (0-10)
let alumnos = [
  { id: 1, name: "Leanne Graham", username: "Bret", email: "Sincere@april.biz", materia: "Programacion Web", nota: 8 },
  { id: 2, name: "Ervin Howell", username: "Antonette", email: "Shanna@melissa.tv", materia: "Base de Datos", nota: 7 },
  { id: 3, name: "Clementine Bauch", username: "Samantha", email: "Nathan@yesenia.net", materia: "Redes", nota: 9 },
  { id: 4, name: "Patricia Lebsack", username: "Karianne", email: "Julianne.OConner@kory.org", materia: "Sistemas Operativos", nota: 6 },
  { id: 5, name: "Chelsey Dietrich", username: "Kamren", email: "Lucio_Hettinger@annie.ca", materia: "Programacion Web", nota: 10 },
  { id: 6, name: "Mrs. Dennis Schulist", username: "Leopoldo_Corkery", email: "Karley_Dach@jasper.info", materia: "Algoritmos", nota: 8 },
  { id: 7, name: "Kurtis Weissnat", username: "Elwyn.Skiles", email: "Telly.Hoeger@billy.biz", materia: "Base de Datos", nota: 7 },
  { id: 8, name: "Nicholas Runolfsdottir V", username: "Maxime_Nienow", email: "Sherwood@rosamond.me", materia: "Redes", nota: 5 },
  { id: 9, name: "Glenna Reichert", username: "Delphine", email: "Chaim_McDermott@dana.io", materia: "Algoritmos", nota: 9 },
  { id: 10, name: "Clementina DuBuque", username: "Moriah.Stanton", email: "Rey.Padberg@karina.biz", materia: "Sistemas Operativos", nota: 8 },
];

// Contador autoincremental para asignar IDs únicos a nuevos alumnos
// Arranca desde length + 1 para no pisar los IDs del array inicial
let nextId = alumnos.length + 1;

// Normaliza un string: elimina espacios al inicio/fin y convierte a minúsculas
// Usada en comparaciones para que sean case-insensitive ("Bret" === "bret")
const normalizar = (valor = "") => valor.trim().toLowerCase();

/**
 * validarDuplicados({ name, username, email })
 * Recorre el array de alumnos y verifica si alguno de los tres campos ya existe.
 * Las comparaciones son case-insensitive gracias a normalizar().
 *
 * @returns {Object|null} - { campo, mensaje } si hay duplicado, null si no hay
 */
function validarDuplicados({ name, username, email }) {
  // Verifica nombre duplicado
  if (alumnos.some((a) => normalizar(a.name) === normalizar(name))) {
    return { campo: "nombre", mensaje: "El nombre ya fue utilizado" };
  }

  // Verifica apodo duplicado
  if (alumnos.some((a) => normalizar(a.username) === normalizar(username))) {
    return { campo: "apodo", mensaje: "El apodo ya fue utilizado" };
  }

  // Verifica email duplicado
  if (alumnos.some((a) => normalizar(a.email) === normalizar(email))) {
    return { campo: "email", mensaje: "El email ya fue utilizado" };
  }

  // Sin duplicados
  return null;
}

/**
 * POST /api/alumnos
 * Devuelve la lista de alumnos, con filtro opcional por materia.
 * Si el body incluye { materia: "Redes" }, devuelve solo los alumnos de esa materia.
 * Si materia está vacío o ausente, devuelve todos los alumnos.
 *
 * Body: { materia?: string }
 * Respuesta: { ok, total, alumnos }
 */
app.post("/api/alumnos", (req, res) => {
  const { materia } = req.body;

  // Si se recibió una materia con texto, filtra; si no, devuelve todos
  // includes() permite búsqueda parcial: "Web" matchea "Programacion Web"
  const resultado = materia?.trim()
    ? alumnos.filter((a) => normalizar(a.materia).includes(normalizar(materia)))
    : alumnos;

  res.json({ ok: true, total: resultado.length, alumnos: resultado });
});

/**
 * POST /api/alumnos/agregar
 * Valida y agrega un nuevo alumno al array en memoria.
 * Realiza tres capas de validación antes de insertar:
 *   1. Presencia de todos los campos
 *   2. Formato de email y rango de nota
 *   3. Duplicados de nombre, apodo y email
 *
 * Body: { name, username, email, materia, nota }
 * Respuesta exitosa (201): { ok, mensaje, alumno, idGenerado }
 * Respuesta de error (400/409): { ok, campo, mensaje }
 */
app.post("/api/alumnos/agregar", (req, res) => {
  const { name, username, email, materia, nota } = req.body;

  // Capa 1: todos los campos son obligatorios
  if (!name || !username || !email || !materia || nota === undefined) {
    return res.status(400).json({
      ok: false,
      campo: "general",
      mensaje: "Todos los campos son obligatorios",
    });
  }

  // Capa 2a: validación de formato de email con regex básica
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, campo: "email", mensaje: "El email no es valido" });
  }

  // Capa 2b: la nota debe ser un número entre 0 y 10
  // Number() convierte el string del body a número; isNaN lo valida
  const notaNum = Number(nota);
  if (Number.isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
    return res.status(400).json({
      ok: false,
      campo: "nota",
      mensaje: "La nota debe ser un numero entre 0 y 10",
    });
  }

  // Capa 3: verifica que nombre, apodo y email no estén ya en uso
  const duplicado = validarDuplicados({ name, username, email });
  if (duplicado) {
    // 409 Conflict: el recurso ya existe
    return res.status(409).json({ ok: false, ...duplicado });
  }

  // Construye el nuevo alumno con ID autoincremental y datos saneados (trim)
  const nuevoAlumno = {
    id: nextId++,           // Asigna el ID actual y luego incrementa para el próximo
    name: name.trim(),
    username: username.trim(),
    email: email.trim(),
    materia: materia.trim(),
    nota: notaNum,          // Guardado como número, no como string
  };

  // Agrega el alumno al array en memoria
  alumnos.push(nuevoAlumno);

  // 201 Created con los datos del alumno recién agregado
  res.status(201).json({
    ok: true,
    mensaje: `Alumno "${nuevoAlumno.name}" agregado correctamente`,
    alumno: nuevoAlumno,
    idGenerado: nuevoAlumno.id,
  });
});

/**
 * POST /api/alumnos/estadisticas
 * Calcula y devuelve estadísticas generales sobre el array de alumnos.
 * Se recalcula en cada llamada para reflejar el estado actual del array.
 *
 * Respuesta: {
 *   ok,
 *   estadisticas: {
 *     totalAlumnos,
 *     promedioGeneral,    // con 2 decimales
 *     alumnosAprobados,   // nota >= 6
 *     alumnosReprobados,  // nota < 6
 *     porMateria          // { "Redes": 2, "Base de Datos": 2, ... }
 *   }
 * }
 */
app.post("/api/alumnos/estadisticas", (req, res) => {
  // Suma todas las notas con reduce y divide por el total para obtener el promedio
  const promedio = alumnos.reduce((acc, a) => acc + a.nota, 0) / alumnos.length;

  // Construye un objeto con la cantidad de alumnos por materia
  // reduce va acumulando: si la materia ya existe suma 1, si no la inicializa en 1
  const porMateria = alumnos.reduce((acc, a) => {
    acc[a.materia] = (acc[a.materia] || 0) + 1;
    return acc;
  }, {});

  res.json({
    ok: true,
    estadisticas: {
      totalAlumnos: alumnos.length,
      promedioGeneral: promedio.toFixed(2),                      // Redondea a 2 decimales
      alumnosAprobados: alumnos.filter((a) => a.nota >= 6).length,   // Nota de aprobación: 6
      alumnosReprobados: alumnos.filter((a) => a.nota < 6).length,
      porMateria,
    },
  });
});

// ── Inicio del servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Proyecto 4 corriendo en http://localhost:${PORT}`);
});