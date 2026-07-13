// controllers/scoreController.js
// ABML de scores + registro/login de usuarios.
// Toda la comunicación con el front se hace por POST.

const crypto = require('crypto');
const { pool } = require('../config/db');

const COLUMNAS_VALIDAS = ['id', 'nombre', 'tiempo', 'puntos', 'fecha'];
const TOKEN_SECRETO = process.env.TOKEN_SECRETO || 'ahorcado-estanga-secreto-local';

function hashPassword(password) {
  // Generamos un 'salt' aleatorio de 16 bytes (32 caracteres en hex)
  const salt = crypto.randomBytes(16).toString('hex');
  // scryptSync con longitud 32 bytes genera un hash de 64 caracteres en hex.
  // El string final tendrá: 32 (salt) + 1 (:) + 64 (hash) = 97 caracteres.
  // Esto entra perfectamente en el VARCHAR(128) de la base de datos, evitando que se corte (trunque).
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

function verificarPassword(password, almacenado) {
  // Separamos el salt y el hash que guardamos en la base de datos
  const [salt, hash] = almacenado.split(':');
  if (!salt || !hash) return false;
  
  // Volvemos a aplicar scrypt con la misma contraseña y el mismo salt, a 32 bytes de longitud
  const prueba = crypto.scryptSync(password, salt, 32).toString('hex');
  
  // Comparamos de forma segura contra ataques de tiempo (timing attacks)
  // Las longitudes de los buffers DEBEN coincidir (ambos de 32 bytes = 64 caracteres hex)
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(prueba, 'hex'));
}

function crearToken(usuario) {
  const payload = Buffer.from(JSON.stringify({
    id: usuario.id,
    username: usuario.username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  })).toString('base64url');
  const firma = crypto.createHmac('sha256', TOKEN_SECRETO).update(payload).digest('base64url');
  return `${payload}.${firma}`;
}

function verificarToken(token) {
  if (!token || typeof token !== 'string') return null;
  const partes = token.split('.');
  if (partes.length !== 2) return null;

  const [payload, firma] = partes;
  const firmaEsperada = crypto.createHmac('sha256', TOKEN_SECRETO).update(payload).digest('base64url');
  if (firma !== firmaEsperada) return null;

  try {
    const datos = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!datos.id || !datos.username || datos.exp < Date.now()) return null;
    return datos;
  } catch {
    return null;
  }
}

function obtenerUsuarioDeRequest(req) {
  const token = req.body.token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return verificarToken(token);
}

/**
 * REGISTRO: crea una cuenta nueva.
 * Espera: { username, password }
 */
async function registro(req, res) {
  try {
    const { username, password } = req.body;
    const nombreUsuario = (username || '').trim().toLowerCase();

    if (!nombreUsuario || nombreUsuario.length < 3) {
      return res.status(400).json({ ok: false, mensaje: 'El usuario debe tener al menos 3 caracteres' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ ok: false, mensaje: 'La contraseña debe tener al menos 4 caracteres' });
    }

    const [existente] = await pool.query('SELECT id FROM usuarios WHERE username = ?', [nombreUsuario]);
    if (existente.length) {
      return res.status(409).json({ ok: false, mensaje: 'Ese nombre de usuario ya existe' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO usuarios (username, password_hash) VALUES (?, ?)',
      [nombreUsuario, hashPassword(password)]
    );

    const usuario = { id: resultado.insertId, username: nombreUsuario };
    res.json({
      ok: true,
      mensaje: 'Cuenta creada correctamente',
      token: crearToken(usuario),
      username: nombreUsuario
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al crear la cuenta' });
  }
}

/**
 * LOGIN: inicia sesión con usuario y contraseña.
 * Espera: { username, password }
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;
    const nombreUsuario = (username || '').trim().toLowerCase();

    if (!nombreUsuario || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Usuario y contraseña son obligatorios' });
    }

    const [filas] = await pool.query(
      'SELECT id, username, password_hash FROM usuarios WHERE username = ?',
      [nombreUsuario]
    );

    if (!filas.length || !verificarPassword(password, filas[0].password_hash)) {
      return res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
    }

    const usuario = { id: filas[0].id, username: filas[0].username };
    res.json({
      ok: true,
      mensaje: 'Sesión iniciada',
      token: crearToken(usuario),
      username: usuario.username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al iniciar sesión' });
  }
}

/**
 * ALTA: guarda el puntaje del usuario autenticado.
 * Sobrescribe si el nuevo puntaje es mayor o igual al anterior.
 * Espera: { token, tiempo, puntos, fecha }
 */
async function alta(req, res) {
  try {
    const sesion = obtenerUsuarioDeRequest(req);
    if (!sesion) {
      return res.status(401).json({ ok: false, mensaje: 'Tenés que iniciar sesión para guardar puntajes' });
    }

    const { tiempo, puntos, fecha } = req.body;

    if (tiempo == null || puntos == null || !fecha) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos (tiempo, puntos, fecha)' });
    }

    const [existentes] = await pool.query(
      'SELECT id, tiempo, puntos, fecha FROM score WHERE user_id = ?',
      [sesion.id]
    );

    const puntosPartida = Number(puntos);
    const tiempoPartida = Number(tiempo);

    if (!existentes.length) {
      const [resultado] = await pool.query(
        'INSERT INTO score (user_id, nombre, tiempo, puntos, fecha) VALUES (?, ?, ?, ?, ?)',
        [sesion.id, sesion.username, tiempoPartida, puntosPartida, fecha]
      );

      return res.json({
        ok: true,
        mensaje: 'Score guardado correctamente',
        guardado: true,
        actualizado: true,
        id: resultado.insertId,
        puntosPartida,
        tiempoPartida,
        puntosRecord: puntosPartida,
        tiempoRecord: tiempoPartida
      });
    }

    const anterior = existentes[0];
    const debeActualizar = puntosPartida >= anterior.puntos;

    if (!debeActualizar) {
      return res.json({
        ok: true,
        mensaje: 'Partida registrada, pero no superaste tu récord anterior',
        guardado: false,
        actualizado: false,
        puntosPartida,
        tiempoPartida,
        puntosRecord: anterior.puntos,
        tiempoRecord: anterior.tiempo
      });
    }

    await pool.query(
      'UPDATE score SET nombre = ?, tiempo = ?, puntos = ?, fecha = ? WHERE user_id = ?',
      [sesion.username, tiempoPartida, puntosPartida, fecha, sesion.id]
    );

    res.json({
      ok: true,
      mensaje: 'Score actualizado correctamente',
      guardado: true,
      actualizado: true,
      id: anterior.id,
      puntosPartida,
      tiempoPartida,
      puntosRecord: puntosPartida,
      tiempoRecord: tiempoPartida
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al guardar el score' });
  }
}

/**
 * BAJA: elimina el puntaje del usuario autenticado (solo el propio).
 * Espera: { token, id? }
 */
async function baja(req, res) {
  try {
    const sesion = obtenerUsuarioDeRequest(req);
    if (!sesion) {
      return res.status(401).json({ ok: false, mensaje: 'Tenés que iniciar sesión' });
    }

    const { id } = req.body;
    const params = id ? [id, sesion.id] : [sesion.id];
    const condicion = id ? 'id = ? AND user_id = ?' : 'user_id = ?';

    const [resultado] = await pool.query(`DELETE FROM score WHERE ${condicion}`, params);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'No existe un score tuyo con ese id' });
    }
    res.json({ ok: true, mensaje: 'Score eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar el score' });
  }
}

/**
 * MODIFICACIÓN: actualiza el puntaje del usuario autenticado (solo el propio).
 * Espera: { token, id?, tiempo?, puntos?, fecha? }
 */
async function modificacion(req, res) {
  try {
    const sesion = obtenerUsuarioDeRequest(req);
    if (!sesion) {
      return res.status(401).json({ ok: false, mensaje: 'Tenés que iniciar sesión' });
    }

    const { id, tiempo, puntos, fecha } = req.body;

    const [resultado] = await pool.query(
      `UPDATE score SET
        nombre = ?,
        tiempo = COALESCE(?, tiempo),
        puntos = COALESCE(?, puntos),
        fecha  = COALESCE(?, fecha)
       WHERE user_id = ? ${id ? 'AND id = ?' : ''}`,
      id
        ? [sesion.username, tiempo ?? null, puntos ?? null, fecha ?? null, sesion.id, id]
        : [sesion.username, tiempo ?? null, puntos ?? null, fecha ?? null, sesion.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'No existe un score tuyo con ese id' });
    }
    res.json({ ok: true, mensaje: 'Score actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el score' });
  }
}

/**
 * LISTADO: devuelve los scores, con búsqueda y ordenamiento opcionales.
 * Espera: { busqueda?, orden?, direccion? }
 */
async function listado(req, res) {
  try {
    const { busqueda = '', orden = 'puntos', direccion = 'DESC' } = req.body;

    const columna = COLUMNAS_VALIDAS.includes(orden) ? orden : 'puntos';
    const dir = direccion && direccion.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [filas] = await pool.query(
      `SELECT id, nombre, tiempo, puntos, fecha
       FROM score
       WHERE nombre LIKE ?
       ORDER BY ${columna} ${dir}`,
      [`%${busqueda}%`]
    );

    res.json({ ok: true, datos: filas, orden: columna, direccion: dir });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al listar los scores' });
  }
}

module.exports = { registro, login, alta, baja, modificacion, listado };
