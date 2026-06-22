/**
 * PROYECTO 3 — Server Node.js
 * Propósito: Servidor que obtiene todos los usuarios y permite
 *            buscarlos por nombre (filtrado en el servidor).
 *
 * Ejecutar: node server.js
 * Puerto:   3003
 */

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3003;
const USUARIOS_RESPALDO = [
  { id: 1, name: "Leanne Graham", username: "Bret", email: "Sincere@april.biz", address: { city: "Gwenborough" }, website: "hildegard.org" },
  { id: 2, name: "Ervin Howell", username: "Antonette", email: "Shanna@melissa.tv", address: { city: "Wisokyburgh" }, website: "anastasia.net" },
  { id: 3, name: "Clementine Bauch", username: "Samantha", email: "Nathan@yesenia.net", address: { city: "McKenziehaven" }, website: "ramiro.info" },
  { id: 4, name: "Patricia Lebsack", username: "Karianne", email: "Julianne.OConner@kory.org", address: { city: "South Elvis" }, website: "kale.biz" },
  { id: 5, name: "Chelsey Dietrich", username: "Kamren", email: "Lucio_Hettinger@annie.ca", address: { city: "Roscoeview" }, website: "demarco.info" },
  { id: 6, name: "Mrs. Dennis Schulist", username: "Leopoldo_Corkery", email: "Karley_Dach@jasper.info", address: { city: "South Christy" }, website: "ola.org" },
  { id: 7, name: "Kurtis Weissnat", username: "Elwyn.Skiles", email: "Telly.Hoeger@billy.biz", address: { city: "Howemouth" }, website: "elvis.io" },
  { id: 8, name: "Nicholas Runolfsdottir V", username: "Maxime_Nienow", email: "Sherwood@rosamond.me", address: { city: "Aliyaview" }, website: "jacynthe.com" },
  { id: 9, name: "Glenna Reichert", username: "Delphine", email: "Chaim_McDermott@dana.io", address: { city: "Bartholomebury" }, website: "conrad.com" },
  { id: 10, name: "Clementina DuBuque", username: "Moriah.Stanton", email: "Rey.Padberg@karina.biz", address: { city: "Lebsackbury" }, website: "ambrose.net" },
];

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/**
 * POST /api/usuarios
 * Obtiene todos los usuarios de la API y los devuelve al cliente.
 * El cliente luego hace el filtrado en tiempo real en el navegador.
 *
 * Respuesta: { ok: true, usuarios: Array }
 */
app.post("/api/usuarios", async (req, res) => {
  try {
    let datosApi;
    try {
      const respuesta = await axios.get("https://jsonplaceholder.typicode.com/users");
      datosApi = respuesta.data;
    } catch (error) {
      datosApi = USUARIOS_RESPALDO;
    }

    const vistos = { nombres: new Set(), apodos: new Set(), emails: new Set() };
    const usuariosSinRepetir = datosApi.filter((usuario) => {
      const nombre = usuario.name.trim().toLowerCase();
      const apodo = usuario.username.trim().toLowerCase();
      const email = usuario.email.trim().toLowerCase();

      if (vistos.nombres.has(nombre) || vistos.apodos.has(apodo) || vistos.emails.has(email)) {
        return false;
      }

      vistos.nombres.add(nombre);
      vistos.apodos.add(apodo);
      vistos.emails.add(email);
      return true;
    });

    // Devolvemos todos los campos sin repetir nombre, apodo ni email.
    res.status(200).json({
      ok: true,
      total: usuariosSinRepetir.length,
      usuarios: usuariosSinRepetir,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message);
    res.status(500).json({ ok: false, mensaje: "Error al obtener usuarios" });
  }
});

// ── Inicio del servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Proyecto 3 corriendo en http://localhost:${PORT}`);
});
