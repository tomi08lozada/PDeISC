/**
 * app.js — BancoDigital: Alta de Clientes
 * Demuestra las 3 formas de lectura de formularios en JavaScript:
 *   1. getElementById
 *   2. querySelector / querySelectorAll
 *   3. FormData API
 */

"use strict";

// Array global que almacena todos los clientes cargados

const clientes = [];


// Etiquetas amigables para mostrar en el panel

const LABELS = {
  nombre:   'Nombre',
  apellido: 'Apellido',
  dni:      'DNI',
  tipo:     'Tipo de Cuenta',
  email:    'Email',
  deposito: 'Depósito Inicial',
  sucursal: 'Sucursal',
};


// MÉTODO 1 — getElementById
// Accede a cada campo directamente por su id único.
function leerMetodo1() {
  // Leer cada campo usando document.getElementById('id')
  const datos = {
    nombre:   document.getElementById('m1_nombre').value.trim(),
    apellido: document.getElementById('m1_apellido').value.trim(),
    dni:      document.getElementById('m1_dni').value.trim(),
    tipo:     document.getElementById('m1_tipo').value,
    email:    document.getElementById('m1_email').value.trim(),
    deposito: document.getElementById('m1_deposito').value,
    sucursal: document.getElementById('m1_sucursal').value,
  };

  // Validar y registrar
  if (!validar(datos)) return;

  registrarCliente(datos, 'getElementById', 'M1');
  document.getElementById('formM1').reset();   // limpiar formulario
}


// MÉTODO 2 — querySelector (por nombre de atributo)
// Selecciona los inputs dentro del form #formM2
// usando selectores CSS como [name="..."].
function leerMetodo2() {
  const form = document.getElementById('formM2');

  // querySelector devuelve el PRIMER elemento que coincide
  const datos = {
    nombre:   form.querySelector('[name="nombre"]').value.trim(),
    apellido: form.querySelector('[name="apellido"]').value.trim(),
    dni:      form.querySelector('[name="dni"]').value.trim(),
    tipo:     form.querySelector('[name="tipo"]').value,
    email:    form.querySelector('[name="email"]').value.trim(),
    deposito: form.querySelector('[name="deposito"]').value,
    sucursal: form.querySelector('[name="sucursal"]').value,
  };

  // Alternativa con querySelectorAll: recorremos todos los .campo-m2
  // para loguear en consola cómo funciona la iteración
  const todosCampos = form.querySelectorAll('.campo-m2');
  console.log('[Método 2] Campos encontrados con querySelectorAll:', todosCampos.length);
  todosCampos.forEach(el => console.log(`  ${el.name} = ${el.value}`));

  if (!validar(datos)) return;

  registrarCliente(datos, 'querySelector', 'M2');
  document.getElementById('formM2').reset();
}

// MÉTODO 3 — FormData API
// Crea un objeto FormData a partir del elemento <form>.
// Itera todas las entradas con .entries() o usa .get().

function leerMetodo3() {
  const form     = document.getElementById('formM3');
  const formData = new FormData(form);   // captura TODOS los campos en un objeto

  // Recorrer todas las entradas (útil cuando hay muchos campos)
  console.log('[Método 3] Contenido de FormData:');
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value}`);
  }

  // Construir objeto de datos con .get(name)
  const datos = {
    nombre:   formData.get('nombre').trim(),
    apellido: formData.get('apellido').trim(),
    dni:      formData.get('dni').trim(),
    tipo:     formData.get('tipo'),
    email:    formData.get('email').trim(),
    deposito: formData.get('deposito'),
    sucursal: formData.get('sucursal'),
  };

  if (!validar(datos)) return;

  registrarCliente(datos, 'FormData API', 'M3');
  form.reset();
}

// VALIDACIÓN básica: verifica campos requeridos

function validar(datos) {
  const requeridos = ['nombre', 'apellido', 'dni', 'tipo', 'email'];

  for (const campo of requeridos) {
    if (!datos[campo]) {
      mostrarAlerta(`El campo "${LABELS[campo]}" es obligatorio.`, 'error');
      return false;
    }
  }
  // Validar formato de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    mostrarAlerta('El email no tiene un formato válido.', 'error');
    return false;
  }
  // Validar DNI: solo números, 7 u 8 dígitos
  if (!/^\d{7,8}$/.test(datos.dni)) {
    mostrarAlerta('El DNI debe tener entre 7 y 8 dígitos numéricos.', 'error');
    return false;
  }
  return true;
}

// REGISTRAR CLIENTE: guarda en array y actualiza UI
function registrarCliente(datos, metodo, metodoCode) {
  // Añadir metadatos
  datos.metodo  = metodo;
  datos.nro     = clientes.length + 1;
  datos.fecha   = new Date().toLocaleString('es-AR');

  // Guardar en el array global
  clientes.push(datos);

  // Actualizar panel de resultado (sin recargar la página)
  mostrarResultado(datos, metodoCode);

  // Actualizar lista de clientes
  actualizarLista();

  // Alerta de éxito
  mostrarAlerta(
    `✓ Cliente Nº${datos.nro} <strong>${datos.nombre} ${datos.apellido}</strong> registrado correctamente con <em>${metodo}</em>.`,
    'ok'
  );
}

//
// MOSTRAR RESULTADO en el panel derecho
// Actualiza el DOM dinámicamente sin recargar la página
function mostrarResultado(datos, metodoCode) {
  const panel = document.getElementById('resultPanel');
  const list  = document.getElementById('resultList');
  const badge = document.getElementById('resultBadge');
  const title = document.getElementById('resultTitle');

  // Actualizar encabezado
  title.textContent = `Cliente Nº${datos.nro}`;
  badge.textContent = datos.metodo;

  // Generar los ítems de la lista dinámicamente
  list.innerHTML = '';
  for (const [key, label] of Object.entries(LABELS)) {
    const val = datos[key] || '—';
    const li  = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `<span class="key">${label}</span><span class="val">${val}</span>`;
    list.appendChild(li);
  }

  // Fila extra: método utilizado
  const liMetodo = document.createElement('li');
  liMetodo.className = 'list-group-item';
  liMetodo.innerHTML = `<span class="key">Método JS</span><span class="val">${datos.metodo}</span>`;
  list.appendChild(liMetodo);

  // Mostrar el panel (oculto al inicio con display:none)
  panel.style.removeProperty('display');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ACTUALIZAR LISTA de clientes registrados
// ─────────────────────────────────────────────────────
function actualizarLista() {
  const container = document.getElementById('userList');
  const counter   = document.getElementById('userCount');

  counter.textContent = clientes.length;
  container.innerHTML = '';

  // Recorrer el array en orden inverso (más nuevo primero)
  [...clientes].reverse().forEach(c => {
    const initiales = (c.nombre[0] + c.apellido[0]).toUpperCase();

    const div = document.createElement('div');
    div.className = 'user-item';
    div.innerHTML = `
      <div class="user-avatar">${initiales}</div>
      <div>
        <div class="user-name">${c.nombre} ${c.apellido}</div>
        <div class="user-detail">DNI ${c.dni} · ${c.tipo}</div>
      </div>
      <span class="user-badge">${c.metodo}</span>
    `;
    container.appendChild(div);
  });
}

// MOSTRAR ALERTA dinámica (sin recarga)

function mostrarAlerta(mensaje, tipo) {
  const box = document.getElementById('alertBox');
  box.innerHTML = `
    <div class="alert-custom p-3 ${tipo === 'ok' ? 'alert-ok' : 'alert-err'}">
      ${mensaje}
    </div>
  `;
  box.style.display = 'block';

  // Ocultar después de 4 segundos
  clearTimeout(box._timer);
  box._timer = setTimeout(() => { box.style.display = 'none'; }, 4000);
}