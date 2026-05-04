/**
 * server.js — Servidor Express para Proyecto 2
 * Sirve los archivos estáticos de la carpeta /public
 */

const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = 3002;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Proyecto 2 corriendo en http://localhost:${PORT}`);
});