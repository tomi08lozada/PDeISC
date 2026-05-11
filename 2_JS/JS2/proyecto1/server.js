"use strict";

const express = require("express");
const path    = require("path");
const fs      = require("fs");

/* ════════════════════════════════════════════════════
   CONFIGURACIÓN
════════════════════════════════════════════════════ */
const PORT = process.env.PORT || 3000;

/**
 * Carpeta donde se guardarán los archivos .txt generados.
 * Podés cambiar "archivos_guardados" por la ruta que prefieras.
 */
const SAVE_DIR = path.join(__dirname, "archivos_guardados");

if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR, { recursive: true });
  console.log(`  Carpeta creada: ${SAVE_DIR}`);
}

/* ════════════════════════════════════════════════════
   INSTANCIA DE EXPRESS
════════════════════════════════════════════════════ */
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ════════════════════════════════════════════════════
   ENDPOINT — GUARDAR ARCHIVO EN DISCO
   POST /api/save
   Body: { filename: string, content: string }
════════════════════════════════════════════════════ */
app.post("/api/save", (req, res) => {
  const { filename, content } = req.body;

  if (!filename || typeof filename !== "string") {
    return res.status(400).json({ ok: false, error: "Falta el nombre de archivo." });
  }
  if (!content || typeof content !== "string") {
    return res.status(400).json({ ok: false, error: "El contenido no puede estar vacío." });
  }

  // Solo permite caracteres seguros en el nombre del archivo
  const safeName = filename.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
  const filePath = path.join(SAVE_DIR, safeName);

  fs.writeFile(filePath, content, "utf8", (err) => {
    if (err) {
      console.error("Error al guardar archivo:", err);
      return res.status(500).json({ ok: false, error: "No se pudo guardar el archivo." });
    }
    console.log(`  Archivo guardado: ${filePath}`);
    res.json({ ok: true, path: filePath });
  });
});

/* ════════════════════════════════════════════════════
   HEALTHCHECK
════════════════════════════════════════════════════ */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ════════════════════════════════════════════════════
   CATCH-ALL
════════════════════════════════════════════════════ */
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ════════════════════════════════════════════════════
   INICIO
════════════════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log("─────────────────────────────────────");
  console.log(`  NumReg server corriendo`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Archivos guardados en: ${SAVE_DIR}`);
  console.log("─────────────────────────────────────");
});