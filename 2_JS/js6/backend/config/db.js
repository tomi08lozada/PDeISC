// config/db.js
// Configura y exporta un pool de conexiones a MySQL.
// Pensado para XAMPP: host local, usuario root, sin contraseña por defecto.

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Score',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conectado a MySQL - Base de datos "Score"');
    conn.release();
  } catch (err) {
    console.error('❌ No se pudo conectar a MySQL:', err.message);
    console.error('   Revisá que XAMPP tenga MySQL corriendo y que la BD "Score" exista (ver backend/database/score.sql)');
  }
}

module.exports = { pool, testConnection };
