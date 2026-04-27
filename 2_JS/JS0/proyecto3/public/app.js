// ============================================================
// PROYECTO 3 — Método unshift()
// unshift() inserta elementos al INICIO del array.
// Todos los elementos existentes se desplazan (re-indexan).
// ============================================================

// --- Ejercicio 1: Agregar colores al inicio ---
// Cada unshift() al array vacío lo llena desde el principio.
// El último unshift() termina siendo el índice 0 final.
function runEj1() {
  const colores = [];
  colores.unshift('Azul');    // ['Azul']
  colores.unshift('Rojo');    // ['Rojo', 'Azul']
  colores.unshift('Verde');   // ['Verde', 'Rojo', 'Azul']

  const out = document.getElementById('output1');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-ok">✅ unshift() ejecutado 3 veces</div>
    ${renderArray(colores)}
    <div class="length-badge">length: ${colores.length}</div>
  `;
}

// --- Ejercicio 2: Tarea urgente al principio ---
// unshift() garantiza que la tarea urgente quede en índice 0.
const tareasBase = ['Estudiar', 'Leer', 'Hacer gym'];

function runEj2() {
  const input = document.getElementById('tarea-input');
  const valor = input.value.trim();
  if (!valor) { alert('Escribí una tarea primero'); return; }

  const tareas = [...tareasBase];  // Copia del array original
  tareas.unshift('🚨 ' + valor);   // Insertar al principio

  const out = document.getElementById('output2');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-ok">✅ Tarea urgente en posición 0</div>
    ${renderArray(tareas)}
    <div class="length-badge">length: ${tareas.length}</div>
  `;
}

// --- Ejercicio 3: Usuario conectado primero ---
// El usuario nuevo aparece primero en la lista de conectados.
const usuariosBase = ['Ana', 'Luis', 'Pedro', 'María'];

function runEj3() {
  const input = document.getElementById('usuario-input');
  const nombre = input.value.trim();
  if (!nombre) { alert('Ingresá un nombre de usuario'); return; }

  const usuarios = [...usuariosBase];
  usuarios.unshift(nombre); // El nuevo usuario va al frente

  const out = document.getElementById('output3');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-ok">✅ <strong>${nombre}</strong> conectado — aparece primero</div>
    ${renderArray(usuarios)}
    <div class="length-badge">length: ${usuarios.length}</div>
  `;
}

function renderArray(arr) {
  return `<div class="badges-wrap">${arr.map((item, i) => `<span class="badge-item" style="animation-delay:${i*70}ms"><span class="badge-index">${i}</span>${item}</span>`).join('')}</div>`;
}