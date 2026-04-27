// Ejercicio 1: Primeros 3 elementos
// slice(0, 3) → desde índice 0 hasta índice 2 (3 no incluido).
function runEj1() {
  const numeros = [10, 20, 30, 40, 50, 60];
  const primeros = numeros.slice(0, 3); // [10, 20, 30]

  const out = document.getElementById('output1');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-warn">Original (sin cambios): ${renderInline(numeros)}</div>
    <div class="msg-ok">✅ slice(0, 3): ${renderInline(primeros)}</div>
    ${renderArray(primeros)}
    <div class="length-badge">Nuevo array length: ${primeros.length}</div>
  `;
}

// Ejercicio 2: Posición 2 hasta 4
// slice(2, 5) toma índices 2, 3, 4 (el 5 no se incluye).
function runEj2() {
  const pelis = ['Matrix', 'Avatar', 'Inception', 'Interstellar', 'Dune', 'Oppenheimer'];
  const seleccion = pelis.slice(2, 5); // índices 2, 3, 4

  const out = document.getElementById('output2');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-warn">Original (sin cambios): ${renderInline(pelis)}</div>
    <div class="msg-ok">✅ slice(2, 5) → índices 2, 3 y 4:</div>
    ${renderArray(seleccion)}
    <div class="length-badge">Nuevo array length: ${seleccion.length}</div>
  `;
}

// Ejercicio 3: Últimos 3 con índice negativo
// slice(-3) equivale a slice(arr.length - 3). No necesitás saber el length.
function runEj3() {
  const letras = ['a', 'b', 'c', 'd', 'e', 'f'];
  const ultimos = letras.slice(-3); // ['d', 'e', 'f']

  const out = document.getElementById('output3');
  out.style.display = 'block';
  out.innerHTML = `
    <div class="msg-warn">Original: ${renderInline(letras)} (length: ${letras.length})</div>
    <div class="msg-ok">✅ slice(-3) = slice(${letras.length - 3}): últimos 3</div>
    ${renderArray(ultimos)}
    <div class="length-badge">Nuevo array length: ${ultimos.length}</div>
  `;
}

function renderArray(arr) {
  return `<div class="badges-wrap mt-2">${arr.map((item, i) => `<span class="badge-item" style="animation-delay:${i*80}ms"><span class="badge-index">${i}</span>${item}</span>`).join('')}</div>`;
}

function renderInline(arr) {
  return `[${arr.map(i => `<code>${i}</code>`).join(', ')}]`;
}