// server.js
// Punto de entrada del backend. Se corre con: npm start

const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/scores', apiRoutes);

app.listen(PORT, async () => {
  console.log(`🎮 Servidor "El Ahorcado" corriendo en http://localhost:${PORT}`);
  await testConnection();
});
