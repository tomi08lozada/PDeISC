// PROYECTO 7 — Método indexOf()
// indexOf(elemento) busca usando igualdad estricta (===).
// Retorna el ÍNDICE de la primera ocurrencia, o -1 si no existe.

// --- Ejercicio 1: Posición de "perro" ---
// indexOf busca de izquierda a derecha y retorna la primera coincidencia.
function runEj1() {
  const animales = ['Gato', 'Perro', 'Conejo', 'Perro', 'Loro'];
  const pos = animales.indexOf('Perro'); // Retorna 1 (primera ocurrencia)

  const out = document.getElementById('output1');
  out.style.display = 'block';

  // Destacamos el elemento encontrado
  const badges = animales.map((item, i) => `
    <span class="badge-item ${i === pos ? 'found' : ''}" style="animation-delay:${i*70}ms">
      <span class="badge-index">${i}</span>${item}${i === pos ? ' ✓' : ''}
    </span>`).join('');

  out.innerHTML = `
    <div class="msg-ok">✅ "Perro" encontrado en índice: <strong>${pos}</strong></div>
    <div class="badges-wrap">${badges}</div>
    <div class="msg-warn" style="margin-top:8px">⚠️ Segunda ocurrencia (índice 3) es ignorada — indexOf devuelve solo la primera.</div>
  `;
}

// --- Ejercicio 2: Buscar número en array ---
// indexOf con números usa === : el tipo debe coincidir.
const numeros = [10, 30, 50, 70, 90];

function runEj2() {
  const input = document.getElementById('num-input');
  const val = parseInt(input.value);
  if (isNaN(val)) { alert('Ingresá un número'); return; }

  const idx = numeros.indexOf(val); // -1 si no existe

  const out = document.getElementById('output2');
  out.style.display = 'block';

  const badges = numeros.map((item, i) => `
    <span class="badge-item ${i === idx ? 'found' : ''}" style="animation-delay:${i*70}ms">
      <span class="badge-index">${i}</span>${item}
    </span>`).join('');

  if (idx !== -1) {
    out.innerHTML = `
      <div class="msg-ok">✅ ${val} encontrado en índice: <strong>${idx}</strong></div>
      <div class="badges-wrap">${badges}</div>`;
  } else {
    out.innerHTML = `
      <div class="msg-err">❌ ${val} no está en el array (indexOf retornó -1)</div>
      <div class="badges-wrap">${badges}</div>`;
  }
}

// --- Ejercicio 3: Buscar ciudad ---
// El patrón clásico: idx !== -1 para verificar existencia.
const ciudades = ['París', 'Madrid', 'Roma', 'Berlín', 'Londres', 'Tokio', 'Buenos Aires'];

function runEj3() {
  const input = document.getElementById('ciudad-input');
  const ciudad = input.value.trim();
  if (!ciudad) { alert('Ingresá una ciudad'); return; }

  // indexOf es case-sensitive: 'madrid' !== 'Madrid'
  const idx = ciudades.indexOf(ciudad);

  const out = document.getElementById('output3');
  out.style.display = 'block';

  const badges = ciudades.map((item, i) => `
    <span class="badge-item ${i === idx ? 'found' : ''}" style="animation-delay:${i*60}ms">
      <span class="badge-index">${i}</span>${item}
    </span>`).join('');

  if (idx !== -1) {
    out.innerHTML = `
      <div class="msg-ok">✅ "${ciudad}" está en el índice: <strong>${idx}</strong></div>
      <div class="badges-wrap">${badges}</div>`;
  } else {
    out.innerHTML = `
      <div class="msg-err">❌ "${ciudad}" no existe en el array.</div>
      <div class="msg-warn">💡 Tip: indexOf es case-sensitive. Probá con mayúsculas correctas.</div>
      <div class="badges-wrap">${badges}</div>`;
  }
}