// ============================================================
// PROYECTO 2 — Método pop()
// pop() elimina el ÚLTIMO elemento del array y lo retorna.
// Muta el array original: el length disminuye en 1.
// ============================================================

// --- Ejercicio 1: Eliminar último animal ---
// pop() no necesita argumentos. Devuelve el elemento removido.
function runEj1() {
  const animales = ['Perro', 'Gato', 'Pájaro', 'Pez'];
  const antes = [...animales]; // copia para mostrar estado previo

  const eliminado = animales.pop(); // Elimina 'Pez' y lo retorna

  const out = document.getElementById('output1');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-warn">Antes: ${renderInline(antes)}</div>
    <div class="msg-err">❌ Eliminado: <strong>${eliminado}</strong></div>
    <div class="msg-ok">✅ Después: ${renderInline(animales)}</div>
    <div class="length-badge">length: ${animales.length}</div>
  `;
}

// --- Ejercicio 2: Lista de compras ---
// pop() retorna el elemento quitado, lo podemos capturar en una variable.
function runEj2() {
  const lista = ['Leche', 'Pan', 'Arroz', 'Aceite'];
  const antes = [...lista];

  const quitado = lista.pop(); // Capturamos lo que se eliminó

  const out = document.getElementById('output2');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-warn">Lista original: ${renderInline(antes)}</div>
    <div class="msg-err">🛒 Producto eliminado: <strong>${quitado}</strong></div>
    <div class="msg-ok">Lista restante: ${renderInline(lista)}</div>
  `;
}

// --- Ejercicio 3: Vaciar con while + pop() ---
// El bucle while sigue mientras haya elementos (length > 0).
// Cada iteración saca uno del final y lo registra.
let historial = [];
const arrOriginal = ['Elemento A', 'Elemento B', 'Elemento C', 'Elemento D', 'Elemento E'];
let arrCopy = [...arrOriginal];

function runEj3() {
  arrCopy = [...arrOriginal]; // resetear
  historial = [];

  // Simulamos el while con un intervalo para que se vea paso a paso
  const out = document.getElementById('output3');
  out.style.display = 'block';
  out.innerHTML = '<div class="msg-warn">Vaciando array...</div>';

  let i = 0;
  const interval = setInterval(() => {
    if (arrCopy.length === 0) {
      clearInterval(interval);
      out.innerHTML += `<div class="msg-ok">✅ Array vaciado. Se extrajeron ${historial.length} elementos.</div>
        <div class="badges-wrap mt-2">${historial.map((h,idx) => `<span class="badge-item removed" style="animation-delay:${idx*60}ms"><span class="badge-index">${idx}</span>${h}</span>`).join('')}</div>`;
      return;
    }
    const item = arrCopy.pop();
    historial.push(item);
    out.innerHTML = `<div class="msg-warn">Restante: [${arrCopy.join(', ')}]</div>
      <div class="msg-err">pop() extrajo → <strong>${item}</strong></div>`;
  }, 600);
}

function renderInline(arr) {
  return arr.map(i => `<code>${i}</code>`).join(', ');
}