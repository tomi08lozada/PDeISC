// js/theme.js
// Controla el toggle entre modo día y modo noche (evento click).

const btnTema = document.getElementById('btnTema');

/**
 * Alterna la clase del <body> entre tema-dia y tema-noche
 * y actualiza el texto del botón.
 */
function alternarTema() {
  const esDia = document.body.classList.contains('tema-dia');

  document.body.classList.toggle('tema-dia', !esDia);
  document.body.classList.toggle('tema-noche', esDia);

  btnTema.textContent = esDia ? '☀️ Día' : '🌙 Noche';
}

btnTema.addEventListener('click', alternarTema);
