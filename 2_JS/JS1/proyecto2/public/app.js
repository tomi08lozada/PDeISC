/**
 * app.js — SportStore: Inventario Deportivo
 *
 * Demuestra 3 métodos de almacenaje en arrays:
 *   1. push()    — Agrega al final del array
 *   2. unshift() — Agrega al inicio del array
 *   3. splice()  — Inserta en una posición específica
 *
 * Los datos se muestran dinámicamente sin recargar la página.
 */

"use strict";

// ─────────────────────────────────────────────────────
// Array principal que almacena los artículos deportivos
// ─────────────────────────────────────────────────────
let inventario = [];

// Método de almacenaje actualmente seleccionado
let metodoActual = 'push';

// Contador de IDs únicos
let idCounter = 1;

// Emojis por deporte para las tarjetas
const SPORT_ICONS = {
  'Fútbol':      '⚽',
  'Basketball':  '🏀',
  'Tenis':       '🎾',
  'Natación':    '🏊',
  'Running':     '🏃',
  'Ciclismo':    '🚴',
  'Padel':       '🏓',
  'Volleyball':  '🏐',
  'default':     '🏅',
};

// ─────────────────────────────────────────────────────
// Cambiar el método de almacenaje activo
// ─────────────────────────────────────────────────────
function setMetodo(metodo) {
  metodoActual = metodo;

  // Actualizar estilos de los botones
  document.querySelectorAll('.btn-method').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`).classList.add('active');

  // Actualizar descripción
  const descripciones = {
    push:    '<code>array.push(item)</code> — Añade el elemento al <strong>final</strong> del array.',
    unshift: '<code>array.unshift(item)</code> — Añade el elemento al <strong>inicio</strong> del array.',
    splice:  '<code>array.splice(Math.floor(len/2), 0, item)</code> — Inserta el elemento en el <strong>centro</strong> del array.',
  };
  document.getElementById('methodInfo').innerHTML = descripciones[metodo];
}

// ─────────────────────────────────────────────────────
// Agregar artículo al inventario
// ─────────────────────────────────────────────────────
function agregarArticulo() {
  // Leer datos del formulario usando getElementById
  const nombre    = document.getElementById('nombre').value.trim();
  const deporte   = document.getElementById('deporte').value;
  const marca     = document.getElementById('marca').value.trim();
  const precio    = parseFloat(document.getElementById('precio').value);
  const stock     = parseInt(document.getElementById('stock').value, 10);
  const talle     = document.getElementById('talle').value;
  const color     = document.getElementById('color').value.trim();
  const condicion = document.querySelector('input[name="condicion"]:checked').value;
  const notas     = document.getElementById('notas').value.trim();

  // ── Validación ──
  let hayError = false;

  const validarCampo = (id, errId, condicion, mensaje) => {
    const errEl = document.getElementById(errId);
    if (condicion) {
      errEl.textContent = mensaje;
      document.getElementById(id).classList.add('is-invalid-custom');
      hayError = true;
    } else {
      errEl.textContent = '';
      document.getElementById(id).classList.remove('is-invalid-custom');
    }
  };

  validarCampo('nombre',  'err_nombre',  !nombre,          'El nombre es obligatorio.');
  validarCampo('deporte', 'err_deporte', !deporte,         'Seleccioná un deporte.');
  validarCampo('marca',   'err_marca',   !marca,           'La marca es obligatoria.');
  validarCampo('precio',  'err_precio',  isNaN(precio) || precio < 0, 'Ingresá un precio válido.');
  validarCampo('stock',   'err_stock',   isNaN(stock)  || stock  < 0, 'Ingresá un stock válido.');

  if (hayError) return;

  // ── Construir el objeto artículo ──
  const articulo = {
    id:        idCounter++,
    nombre,
    deporte,
    marca,
    precio,
    stock,
    talle,
    color:     color || 'No especificado',
    condicion,
    notas:     notas || '—',
    fecha:     new Date().toLocaleString('es-AR'),
    metodoUsado: metodoActual,
  };

  // ── Almacenar según el método seleccionado ──
  switch (metodoActual) {
    case 'push':
      // push() agrega al FINAL del array
      inventario.push(articulo);
      break;

    case 'unshift':
      // unshift() agrega al INICIO del array
      inventario.unshift(articulo);
      break;

    case 'splice':
      // splice(pos, deleteCount, item) inserta en posición sin borrar elementos
      // Insertamos en el centro del array
      const posicion = Math.floor(inventario.length / 2);
      inventario.splice(posicion, 0, articulo);
      break;
  }

  // ── Actualizar la interfaz ──
  renderInventario();
  actualizarConsola();
  actualizarContadores();
  limpiarFormulario();

  // Feedback visual breve
  mostrarFeedback(`✓ "${nombre}" agregado con <strong>${metodoActual}()</strong>`);
}

// ─────────────────────────────────────────────────────
// Renderizar el grid de productos dinámicamente
// ─────────────────────────────────────────────────────
function renderInventario(lista = null) {
  const grid   = document.getElementById('inventarioGrid');
  const emptyMsg = document.getElementById('emptyMsg');
  const fuente = lista || inventario;

  grid.innerHTML = '';

  if (fuente.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5" id="emptyMsg">
        <i class="bi bi-inbox display-4 text-muted d-block mb-3"></i>
        <p class="text-muted">El inventario está vacío. Agregá tu primer artículo.</p>
      </div>`;
    return;
  }

  // Recorrer el array y crear una tarjeta por cada artículo
  fuente.forEach((art, index) => {
    const icon       = SPORT_ICONS[art.deporte] || SPORT_ICONS.default;
    const badgeClass = `badge-${art.condicion.toLowerCase().replace(' ', '')}`;
    const valorTotal = (art.precio * art.stock).toLocaleString('es-AR');

    const col = document.createElement('div');
    col.className = 'col-sm-6 col-xl-4';
    col.innerHTML = `
      <div class="product-card">
        <!-- Badge de condición -->
        <span class="product-badge ${badgeClass}">${art.condicion}</span>

        <!-- Índice en el array -->
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="badge-idx">[${index}]</span>
          <small class="text-muted" style="font-size:.7rem">${art.metodoUsado}()</small>
        </div>

        <!-- Icono deporte -->
        <div class="product-icon">${icon}</div>

        <!-- Info principal -->
        <div class="product-name">${art.nombre}</div>
        <div class="product-sport">${art.deporte} · ${art.marca}</div>

        <!-- Precio y stock -->
        <div class="d-flex align-items-end justify-content-between mt-2 mb-1">
          <span class="product-price">$${art.precio.toLocaleString('es-AR')}</span>
          <span class="product-meta">Stock: ${art.stock} u.</span>
        </div>
        <div class="product-meta mb-2">Valor total: $${valorTotal} · Talle ${art.talle} · ${art.color}</div>

        <!-- Notas (si tiene) -->
        ${art.notas !== '—' ? `<div class="product-meta fst-italic mb-2">"${art.notas}"</div>` : ''}

        <!-- Botón eliminar -->
        <button class="btn-delete-product" onclick="eliminarArticulo(${art.id})">
          <i class="bi bi-x-lg me-1"></i>Eliminar
        </button>
      </div>`;
    grid.appendChild(col);
  });
}

// ─────────────────────────────────────────────────────
// Eliminar artículo del array con filter()
// filter() crea un NUEVO array sin el elemento
// ─────────────────────────────────────────────────────
function eliminarArticulo(id) {
  // filter() recorre el array y devuelve solo los que NO tienen ese id
  inventario = inventario.filter(art => art.id !== id);
  renderInventario();
  actualizarConsola();
  actualizarContadores();
}

// ─────────────────────────────────────────────────────
// Filtrar inventario (búsqueda en vivo)
// Usa filter() con includes() — no modifica el array original
// ─────────────────────────────────────────────────────
function filtrar() {
    const texto   = document.getElementById('filtro').value.toLowerCase();
    const deporte = document.getElementById('filtroDeporte').value;

    const resultado = inventario.filter(art => {
    const coincideTexto   = art.nombre.toLowerCase().includes(texto) ||
                            art.marca.toLowerCase().includes(texto);
    const coincideDeporte = !deporte || art.deporte === deporte;
    return coincideTexto && coincideDeporte;
    });

    renderInventario(resultado);
}


// Actualizar la "consola" que muestra el array
function actualizarConsola() {
  const pre = document.getElementById('arrayConsole');
  document.getElementById('arrayLen').textContent = `${inventario.length} elementos`;

  if (inventario.length === 0) {
    pre.textContent = '// El array está vacío';
    return;
  }

  // Mostrar representación simplificada del array
  const repr = inventario.map((art, i) =>
    `[${i}] { id:${art.id}, nombre:"${art.nombre}", precio:${art.precio}, stock:${art.stock}, método:"${art.metodoUsado}()" }`
    ).join('\n');

    pre.textContent = `inventario = [\n  ${repr.split('\n').join('\n  ')}\n]`;
}

// Actualizar contadores del header
// Usa reduce() para sumar el valor total del inventario

function actualizarContadores() {
    document.getElementById('cntTotal').textContent = inventario.length;

  // reduce() acumula el valor total (precio × stock) de cada artículo
  const valorTotal = inventario.reduce((acc, art) => acc + art.precio * art.stock, 0);
    document.getElementById('cntValor').textContent =
    '$' + valorTotal.toLocaleString('es-AR', { maximumFractionDigits: 0 });
}


// Vaciar todo el inventario

function vaciarInventario() {
  if (!inventario.length) return;
  if (!confirm('¿Seguro que querés vaciar el inventario?')) return;
  inventario = [];   // reasignar array vacío
  renderInventario();
  actualizarConsola();
  actualizarContadores();
}

// Limpiar el formulario
function limpiarFormulario() {
  document.getElementById('formDeporte').reset();
  // Limpiar mensajes de error
  document.querySelectorAll('.invalid-msg').forEach(el => el.textContent = '');
}

// Mostrar feedback temporal en el header
function mostrarFeedback(msg) {
  // Crear toast ligero
  const toast = document.createElement('div');
  toast.className = 'position-fixed bottom-0 end-0 m-3 p-3';
  toast.style.cssText = `
    background: rgba(255,87,34,.15);
    border: 1px solid rgba(255,87,34,.35);
    color: #FF8A65;
    border-radius: 10px;
    font-size: .875rem;
    z-index: 9999;
    animation: fadeSlide .3s ease;
    backdrop-filter: blur(8px);
  `;
  toast.innerHTML = msg;
  document.body.appendChild(toast);

  // Agregar la animación al style si no existe
  if (!document.getElementById('toastStyle')) {
    const style = document.createElement('style');
    style.id = 'toastStyle';
    style.textContent = `
      @keyframes fadeSlide {
        from { opacity:0; transform:translateY(10px); }
        to   { opacity:1; transform:translateY(0); }
      }`;
    document.head.appendChild(style);
  }

  setTimeout(() => toast.remove(), 3000);
}