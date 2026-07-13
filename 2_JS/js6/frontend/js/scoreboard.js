// js/scoreboard.js
// Consume la API propia (siempre por POST) para auth, listar/guardar scores,
// maneja el ordenamiento, la búsqueda y la exportación a CSV/PDF.

const URL_BASE = '/api/scores';
const CLAVE_TOKEN = 'ahorcado_token';
const CLAVE_USUARIO = 'ahorcado_usuario';

let sesion = {
  token: localStorage.getItem(CLAVE_TOKEN) || '',
  username: localStorage.getItem(CLAVE_USUARIO) || ''
};

let estadoTabla = {
  orden: 'puntos',
  direccion: 'DESC',
  busqueda: '',
  datos: []
};

function estaAutenticado() {
  return Boolean(sesion.token && sesion.username);
}

function guardarSesion(token, username) {
  sesion.token = token;
  sesion.username = username;
  localStorage.setItem(CLAVE_TOKEN, token);
  localStorage.setItem(CLAVE_USUARIO, username);
}

function cerrarSesion() {
  sesion.token = '';
  sesion.username = '';
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_USUARIO);
}

function obtenerToken() {
  return sesion.token;
}

function obtenerUsuario() {
  return sesion.username;
}

async function iniciarSesion(usuario, password) {
  const respuesta = await fetch(`${URL_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usuario, password })
  });
  return respuesta.json();
}

async function crearCuenta(usuario, password) {
  const respuesta = await fetch(`${URL_BASE}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usuario, password })
  });
  return respuesta.json();
}

async function cargarTabla() {
  try {
    const respuesta = await fetch(`${URL_BASE}/listado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        busqueda: estadoTabla.busqueda,
        orden: estadoTabla.orden,
        direccion: estadoTabla.direccion
      })
    });

    const resultado = await respuesta.json();
    if (!resultado.ok) throw new Error(resultado.mensaje);

    estadoTabla.datos = resultado.datos;
    renderizarTabla(resultado.datos);
    actualizarIconosOrden();
  } catch (error) {
    console.error('Error al cargar la tabla de posiciones:', error);
    document.getElementById('cuerpoTabla').innerHTML =
      `<tr><td colspan="4">No se pudo conectar con el servidor / base de datos.</td></tr>`;
  }
}

function renderizarTabla(filas) {
  const cuerpo = document.getElementById('cuerpoTabla');
  cuerpo.innerHTML = filas.map(fila => `
    <tr>
      <td>${escaparHTML(fila.nombre)}</td>
      <td>${fila.tiempo}</td>
      <td>${fila.puntos}</td>
      <td>${formatearFecha(fila.fecha)}</td>
    </tr>
  `).join('') || '<tr><td colspan="4">Todavía no hay puntajes guardados.</td></tr>';
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const anio = fecha.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function actualizarIconosOrden() {
  document.querySelectorAll('thead th').forEach(th => {
    const icono = th.querySelector('.orden-icono');
    if (th.dataset.col === estadoTabla.orden) {
      icono.textContent = estadoTabla.direccion === 'ASC' ? '▲' : '▼';
    } else {
      icono.textContent = '';
    }
  });
}

document.querySelectorAll('thead th').forEach(th => {
  th.addEventListener('click', () => {
    const columna = th.dataset.col;
    if (estadoTabla.orden === columna) {
      estadoTabla.direccion = estadoTabla.direccion === 'ASC' ? 'DESC' : 'ASC';
    } else {
      estadoTabla.orden = columna;
      estadoTabla.direccion = 'ASC';
    }
    cargarTabla();
  });
});

let temporizadorBusqueda;
document.getElementById('inputBusqueda').addEventListener('input', (evento) => {
  clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = setTimeout(() => {
    estadoTabla.busqueda = evento.target.value;
    cargarTabla();
  }, 300);
});

async function guardarScore(datosScore) {
  const fechaHoy = new Date().toISOString().slice(0, 10);

  const respuesta = await fetch(`${URL_BASE}/alta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...datosScore,
      fecha: fechaHoy,
      token: obtenerToken()
    })
  });

  return respuesta.json();
}

document.getElementById('btnExportarCSV').addEventListener('click', () => {
  const filas = estadoTabla.datos;
  if (!filas.length) return;

  const encabezado = ['Nombre', 'Tiempo (s)', 'Puntos', 'Fecha'];
  const lineas = filas.map(f => [f.nombre, f.tiempo, f.puntos, formatearFecha(f.fecha)].join(';'));
  const csv = [encabezado.join(';'), ...lineas].join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = 'tabla_posiciones.csv';
  enlace.click();
});

document.getElementById('btnExportarPDF').addEventListener('click', () => {
  const filas = estadoTabla.datos;
  if (!filas.length) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Tabla de posiciones - El Ahorcado', 14, 16);
  doc.setFontSize(10);
  doc.text(`Orden: ${estadoTabla.orden} (${estadoTabla.direccion})`, 14, 23);

  let y = 34;
  doc.setFontSize(11);
  doc.text('Nombre', 14, y);
  doc.text('Tiempo (s)', 80, y);
  doc.text('Puntos', 120, y);
  doc.text('Fecha', 155, y);
  y += 6;

  filas.forEach(fila => {
    doc.text(String(fila.nombre), 14, y);
    doc.text(String(fila.tiempo), 80, y);
    doc.text(String(fila.puntos), 120, y);
    doc.text(formatearFecha(fila.fecha), 155, y);
    y += 7;
    if (y > 280) { doc.addPage(); y = 20; }
  });

  doc.save('tabla_posiciones.pdf');
});

cargarTabla();
