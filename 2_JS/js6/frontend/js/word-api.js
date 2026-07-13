// js/word-api.js
// Se encarga de pedir una palabra aleatoria a una API externa (fetch).
// Se usa la API pública en español "Greenborn" (GET, no requiere API key).
// Si por algún motivo la API externa falla (sin internet, caída, CORS, etc.)
// se usa un listado local de respaldo para que el juego nunca se rompa.

const PALABRAS_RESPALDO = [
  'programacion', 'universidad', 'teclado', 'navegador', 'servidor',
  'variable', 'funcion', 'algoritmo', 'javascript', 'ahorcado',
  'computadora', 'internet', 'aplicacion', 'desarrollo', 'estructura'
];

/**
 * Pide una palabra al azar a la API pública de palabras en español.
 * Devuelve la palabra en minúsculas y sin espacios extra.
 * Si la API falla, devuelve una palabra tomada del listado local.
 */
async function obtenerPalabraAleatoria() {
  try {
    const respuesta = await fetch('https://clientes.api.greenborn.com.ar/public-random-word', {
      headers: { 'Accept': 'application/json' }
    });

    if (!respuesta.ok) throw new Error('La API de palabras respondió con error');

    const datos = await respuesta.json();
    // La API devuelve un array, ej: ["casa"]
    const palabra = Array.isArray(datos) ? datos[0] : datos.word || datos;

    if (!palabra || typeof palabra !== 'string') throw new Error('Formato inesperado de la API');

    return normalizarPalabra(palabra);
  } catch (error) {
    console.warn('No se pudo obtener palabra de la API externa, se usa respaldo local:', error.message);
    const aleatoria = PALABRAS_RESPALDO[Math.floor(Math.random() * PALABRAS_RESPALDO.length)];
    return normalizarPalabra(aleatoria);
  }
}

/**
 * Limpia una palabra: minúsculas, sin espacios ni caracteres no alfabéticos.
 */
function normalizarPalabra(palabra) {
  return palabra
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // saca tildes, más fácil para jugar
    .replace(/[^a-zñ]/g, '');
}
