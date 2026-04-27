// ============================================================
// PROYECTO 4 — Método shift()
// shift() elimina el PRIMER elemento (índice 0) y lo retorna.
// Todos los demás elementos se re-indexan (cada uno baja 1).
// ============================================================

// --- Ejercicio 1: Quitar primer número ---
function runEj1() {
  const numeros = [10, 20, 30, 40, 50];
  const antes = [...numeros];
  const primero = numeros.shift(); // Elimina y retorna el índice 0

  const out = document.getElementById('output1');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-warn">Antes: ${renderInline(antes)}</div>
    <div class="msg-err">❌ shift() eliminó: <strong>${primero}</strong></div>
    <div class="msg-ok">✅ Después: ${renderInline(numeros)}</div>
    <div class="length-badge">length: ${numeros.length}</div>
  `;
}

// --- Ejercicio 2: Eliminar primer mensaje de chat ---
function runEj2() {
  const chat = ['¡Hola!', '¿Cómo estás?', 'Bien, gracias', '¿Y vos?'];
  const antes = [...chat];
  const leido = chat.shift(); // El mensaje más antiguo se "lee" y elimina

  const out = document.getElementById('output2');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-warn">Chat original: ${renderInline(antes)}</div>
    <div class="msg-err">📨 Mensaje leído: <strong>"${leido}"</strong></div>
    <div class="msg-ok">Mensajes restantes: ${renderInline(chat)}</div>
  `;
}

// --- Ejercicio 3: Cola de atención FIFO ---
// push() agrega al final (nuevo cliente), shift() atiende al primero.
let cola = [];
let contador = 1;
const nombres = ['Sofía','Carlos','Lucía','Martín','Ana','Diego','Valeria','Roberto'];

function agregarCliente() {
  const nombre = nombres[(contador - 1) % nombres.length] + ' #' + contador;
  cola.push(nombre); // Entra al FINAL de la cola
  contador++;
  actualizarCola();
  mostrarMsg(`✅ ${nombre} entró a la cola`, 'ok');
}

function atenderCliente() {
  if (cola.length === 0) {
    mostrarMsg('⚠️ La cola está vacía. Agregá clientes primero.', 'warn');
    return;
  }
  const atendido = cola.shift(); // Se atiende el PRIMERO (FIFO)
  actualizarCola();
  mostrarMsg(`🏪 Atendiendo a: <strong>${atendido}</strong> — quedan ${cola.length} en cola`, 'ok');
}

function actualizarCola() {
  const display = document.getElementById('cola-display');
  display.textContent = cola.length === 0 ? 'vacía' : cola.join(' → ');
}

function mostrarMsg(msg, tipo) {
  const out = document.getElementById('output3');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-${tipo}">${msg}</div>
    ${cola.length > 0 ? renderArray(cola) : '<span style="color:var(--muted);font-size:0.75rem">Cola vacía</span>'}
  `;
}

function renderArray(arr) {
  return `<div class="badges-wrap">${arr.map((item, i) => `<span class="badge-item" style="animation-delay:${i*70}ms"><span class="badge-index">${i}</span>${item}</span>`).join('')}</div>`;
}

function renderInline(arr) {
  return arr.map(i => `<code>${i}</code>`).join(', ');
}