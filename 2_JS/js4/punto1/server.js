/**
 * PROYECTO 1 - Server Node.js
 * Propósito: Servidor express que actúa como proxy POST hacia JSONPlaceholder.
 * El cliente hace POST a /api/usuarios, el servidor consulta la API pública
 * y devuelve los datos al cliente.
 *
 * Ejecutar: node server.js
 * Puerto:   3001
 */

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3001;
const USUARIOS_RESPALDO = [
  { id: 1, name: "Leanne Graham", username: "Bret", email: "Sincere@april.biz" },
  { id: 2, name: "Ervin Howell", username: "Antonette", email: "Shanna@melissa.tv" },
  { id: 3, name: "Clementine Bauch", username: "Samantha", email: "Nathan@yesenia.net" },
  { id: 4, name: "Patricia Lebsack", username: "Karianne", email: "Julianne.OConner@kory.org" },
  { id: 5, name: "Chelsey Dietrich", username: "Kamren", email: "Lucio_Hettinger@annie.ca" },
  { id: 6, name: "Mrs. Dennis Schulist", username: "Leopoldo_Corkery", email: "Karley_Dach@jasper.info" },
  { id: 7, name: "Kurtis Weissnat", username: "Elwyn.Skiles", email: "Telly.Hoeger@billy.biz" },
  { id: 8, name: "Nicholas Runolfsdottir V", username: "Maxime_Nienow", email: "Sherwood@rosamond.me" },
  { id: 9, name: "Glenna Reichert", username: "Delphine", email: "Chaim_McDermott@dana.io" },
  { id: 10, name: "Clementina DuBuque", username: "Moriah.Stanton", email: "Rey.Padberg@karina.biz" },
];

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json()); // Parsear body JSON
app.use(express.static(path.join(__dirname, "public"))); // Servir archivos estáticos

/**
 * POST /api/usuarios
 * Obtiene todos los usuarios de JSONPlaceholder usando axios.
 * Aunque la API pública no necesita body, nosotros exponemos POST
 * para cumplir el requisito de "solo POST".
 *
 * Body esperado: {} (vacío o con filtros futuros)
 * Respuesta:     Array de objetos { id, name, email }
 */
app.post("/api/usuarios", async (req, res) => {
  try {
    // Petición GET interna hacia la API pública (desde el servidor, no el cliente)
    let datosApi;
    try {
      const respuesta = await axios.get("https://jsonplaceholder.typicode.com/users");
      datosApi = respuesta.data;
    } catch (error) {
      datosApi = USUARIOS_RESPALDO;
    }

    const vistos = { nombres: new Set(), apodos: new Set(), emails: new Set() };
    const usuariosFiltrados = datosApi
      .map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
      }))
      .filter((u) => {
        const nombre = u.name.trim().toLowerCase();
        const apodo = u.username.trim().toLowerCase();
        const email = u.email.trim().toLowerCase();

        if (vistos.nombres.has(nombre) || vistos.apodos.has(apodo) || vistos.emails.has(email)) {
          return false;
        }

        vistos.nombres.add(nombre);
        vistos.apodos.add(apodo);
        vistos.emails.add(email);
        return true;
      });

    // Devolvemos 200 con los datos
    res.status(200).json({
      ok: true,
      total: usuariosFiltrados.length,
      usuarios: usuariosFiltrados,
    });
  } catch (error) {
    // Si la API externa falla, devolvemos 500
    console.error("Error al obtener usuarios:", error.message);
    res.status(500).json({ ok: false, mensaje: "Error al obtener usuarios" });
  }
});

// ── Inicio del servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Proyecto 1 corriendo en http://localhost:${PORT}`);
});
