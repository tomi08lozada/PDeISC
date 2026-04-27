// PROYECTO 5 — Método splice()
// splice(inicio, cantEliminar, ...nuevosItems)
// El método más versátil: elimina, inserta y/o reemplaza.
// Retorna array con los elementos ELIMINADOS.

// Ejercicio 1: Eliminar dos elementos desde posición 1
// splice(1, 2) → empieza en índice 1, elimina 2 elementos.
function runEj1() {
  const letras = ['a', 'b', 'c', 'd', 'e'];
  const antes = [...letras];

  // Retorna los elementos eliminados
  const eliminados = letras.splice(1, 2); // Elimina 'b' y 'c'

  const out = document.getElementById('output1');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-warn">Antes: ${renderInline(antes)}</div>
    <div class="msg-err">✂️ Eliminados (splice retornó): ${renderInline(eliminados)}</div>
    <div class="msg-ok">✅ Resultado: ${renderInline(letras)}</div>
    ${renderArray(letras)}
  `;
}

// Ejercicio 2: Insertar sin eliminar (cantEliminar = 0)
// Cuando el segundo argumento es 0, splice solo inserta.
const nombresBase = ['Ana', 'Luis', 'Pedro'];

function runEj2() {
  const input = document.getElementById('nombre-input');
  const nombre = input.value.trim();
  if (!nombre) { alert('Ingresá un nombre'); return; }

  const nombres = [...nombresBase];
  // splice(1, 0, nombre) → en posición 1, elimina 0, inserta nombre
  nombres.splice(1, 0, nombre);

  const out = document.getElementById('output2');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-ok">✅ "${nombre}" insertado en posición 1</div>
    ${renderArray(nombres)}
    <div class="length-badge">length: ${nombres.length}</div>
  `;
}

// Ejercicio 3: Reemplazar elementos
// splice(inicio, cantEliminar, nuevo1, nuevo2...) reemplaza in-place.
function runEj3() {
  const frutas = ['Manzana', 'Pera', 'Uva', 'Kiwi'];
  const antes = [...frutas];

  // Desde posición 1, elimina 2 y coloca 'Mango' y 'Fresa' en su lugar
  const reemplazados = frutas.splice(1, 2, 'Mango', 'Fresa');

  const out = document.getElementById('output3');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-warn">Antes: ${renderInline(antes)}</div>
    <div class="msg-err">🔄 Reemplazados: ${renderInline(reemplazados)}</div>
    <div class="msg-ok">✅ Resultado: ${renderInline(frutas)}</div>
    ${renderArray(frutas)}
  `;
}

function renderArray(arr) {
  return `<div class="badges-wrap mt-2">${arr.map((item, i) => `<span class="badge-item" style="animation-delay:${i*70}ms"><span class="badge-index">${i}</span>${item}</span>`).join('')}</div>`;
}

function renderInline(arr) {
  return `[${arr.map(i => `<code>${i}</code>`).join(', ')}]`;
}