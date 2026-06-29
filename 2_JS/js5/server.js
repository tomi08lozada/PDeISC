/**
 * server.js
 * Servidor principal Express para el sistema de gestión de alumnos.
 * Conecta con MySQL (XAMPP) y expone una API REST usando solo métodos POST.
 *
 * Endpoints disponibles:
 *  POST /api/setup           → Crea la base de datos, tabla e inserta 5 alumnos de ejemplo
 *  POST /api/alumnos         → Obtiene todos los alumnos
 *  POST /api/alumnos/crear   → Crea un nuevo alumno
 *  POST /api/alumnos/editar  → Edita un alumno existente por ID
 *  POST /api/alumnos/eliminar → Elimina un alumno por ID
 */

const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Conexión a MySQL ─────────────────────────────────────────────────────────
/**
 * Configuración de conexión a MySQL de XAMPP.
 * Por defecto: usuario root, sin contraseña, puerto 3306.
 */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar con MySQL:", err.message);
    process.exit(1);
  }
  console.log("✅ Conectado a MySQL correctamente");
});

// ─── Helper: Seleccionar alumnosDB antes de cada consulta ─────────────────────
/**
 * Garantiza que todas las operaciones se ejecuten sobre alumnosDB.
 * @param {Function} callback - Se llama con (err) una vez seleccionada la DB
 */
const usarDB = (callback) => {
  db.query("USE alumnosDB", (err) => {
    if (err) {
      console.error("❌ Error al seleccionar alumnosDB:", err.message);
      return callback(err);
    }
    callback(null);
  });
};

// ─── POST /api/setup ──────────────────────────────────────────────────────────
/**
 * Crea la base de datos, tabla e inserta 5 alumnos de ejemplo.
 * Es idempotente: si ya existen datos no los duplica.
 */
app.post("/api/setup", (req, res) => {
  db.query("CREATE DATABASE IF NOT EXISTS alumnosDB", (err) => {
    if (err) return res.status(500).json({ error: "Error al crear la base de datos" });

    db.query("USE alumnosDB", (err) => {
      if (err) return res.status(500).json({ error: "Error al seleccionar la base de datos" });

      const crearTabla = `
        CREATE TABLE IF NOT EXISTS alumnos (
          id       INT AUTO_INCREMENT PRIMARY KEY,
          nombre   VARCHAR(100) NOT NULL,
          apellido VARCHAR(100) NOT NULL,
          edad     INT NOT NULL
        )
      `;

      db.query(crearTabla, (err) => {
        if (err) return res.status(500).json({ error: "Error al crear la tabla" });

        db.query("SELECT COUNT(*) AS total FROM alumnos", (err, results) => {
          if (err) return res.status(500).json({ error: "Error al verificar alumnos" });

          if (results[0].total > 0) {
            return res.json({ message: "La base de datos ya estaba configurada", yaExistia: true });
          }

          // Insertar 5 alumnos de ejemplo
          const alumnos = [
            ["Lucas", "Fernández", 20],
            ["Valentina", "Gómez", 22],
            ["Mateo", "Rodríguez", 19],
            ["Camila", "López", 21],
            ["Thiago", "Martínez", 23],
          ];

          db.query("INSERT INTO alumnos (nombre, apellido, edad) VALUES ?", [alumnos], (err) => {
            if (err) return res.status(500).json({ error: "Error al insertar alumnos de ejemplo" });

            console.log("✅ Setup completado: DB, tabla y alumnos de ejemplo creados");
            res.json({ message: "Setup completado exitosamente", alumnosInsertados: alumnos.length });
          });
        });
      });
    });
  });
});

// ─── POST /api/alumnos ────────────────────────────────────────────────────────
/**
 * Devuelve todos los alumnos ordenados por ID ascendente.
 * Body: {} (no requiere parámetros)
 */
app.post("/api/alumnos", (req, res) => {
  usarDB((err) => {
    if (err) return res.status(500).json({ error: "Error al seleccionar la base de datos" });

    db.query("SELECT * FROM alumnos ORDER BY id ASC", (err, results) => {
      if (err) {
        console.error("❌ Error obteniendo alumnos:", err.message);
        return res.status(500).json({ error: "Error al obtener alumnos" });
      }
      console.log(`📋 Devolviendo ${results.length} alumnos`);
      res.json({ alumnos: results });
    });
  });
});

// ─── POST /api/alumnos/crear ──────────────────────────────────────────────────
/**
 * Inserta un nuevo alumno en la tabla.
 * Body: { nombre: string, apellido: string, edad: number }
 */
app.post("/api/alumnos/crear", (req, res) => {
  const { nombre, apellido, edad } = req.body;

  if (!nombre || !apellido || !edad) {
    return res.status(400).json({ error: "Todos los campos son requeridos: nombre, apellido, edad" });
  }
  if (isNaN(edad) || edad <= 0 || edad > 120) {
    return res.status(400).json({ error: "La edad debe ser un número entre 1 y 120" });
  }

  usarDB((err) => {
    if (err) return res.status(500).json({ error: "Error al seleccionar la base de datos" });

    db.query(
      "INSERT INTO alumnos (nombre, apellido, edad) VALUES (?, ?, ?)",
      [nombre.trim(), apellido.trim(), parseInt(edad)],
      (err, result) => {
        if (err) {
          console.error("❌ Error creando alumno:", err.message);
          return res.status(500).json({ error: "Error al crear el alumno" });
        }
        console.log(`✅ Alumno creado con ID: ${result.insertId}`);
        res.json({ message: "Alumno creado exitosamente", id: result.insertId });
      }
    );
  });
});

// ─── POST /api/alumnos/editar ─────────────────────────────────────────────────
/**
 * Actualiza los datos de un alumno existente.
 * Body: { id: number, nombre: string, apellido: string, edad: number }
 */
app.post("/api/alumnos/editar", (req, res) => {
  const { id, nombre, apellido, edad } = req.body;

  if (!id || !nombre || !apellido || !edad) {
    return res.status(400).json({ error: "Todos los campos son requeridos: id, nombre, apellido, edad" });
  }
  if (isNaN(edad) || edad <= 0 || edad > 120) {
    return res.status(400).json({ error: "La edad debe ser un número entre 1 y 120" });
  }

  usarDB((err) => {
    if (err) return res.status(500).json({ error: "Error al seleccionar la base de datos" });

    db.query(
      "UPDATE alumnos SET nombre = ?, apellido = ?, edad = ? WHERE id = ?",
      [nombre.trim(), apellido.trim(), parseInt(edad), parseInt(id)],
      (err, result) => {
        if (err) {
          console.error("❌ Error editando alumno:", err.message);
          return res.status(500).json({ error: "Error al editar el alumno" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Alumno no encontrado" });
        }
        console.log(`✅ Alumno ID ${id} actualizado`);
        res.json({ message: "Alumno actualizado exitosamente" });
      }
    );
  });
});

// ─── POST /api/alumnos/eliminar ───────────────────────────────────────────────
/**
 * Elimina un alumno por su ID.
 * Body: { id: number }
 */
app.post("/api/alumnos/eliminar", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "El ID del alumno es requerido" });
  }

  usarDB((err) => {
    if (err) return res.status(500).json({ error: "Error al seleccionar la base de datos" });

    db.query("DELETE FROM alumnos WHERE id = ?", [parseInt(id)], (err, result) => {
      if (err) {
        console.error("❌ Error eliminando alumno:", err.message);
        return res.status(500).json({ error: "Error al eliminar el alumno" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Alumno no encontrado" });
      }
      console.log(`✅ Alumno ID ${id} eliminado`);
      res.json({ message: "Alumno eliminado exitosamente" });
    });
  });
});

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});