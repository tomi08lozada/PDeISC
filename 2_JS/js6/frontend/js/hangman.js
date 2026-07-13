// js/hangman.js
// Clase que representa el estado y las reglas del juego "El Ahorcado".
// No toca el DOM: solo maneja datos (palabra, letras adivinadas, errores).

class Hangman {
  /**
   * @param {string} palabra - la palabra secreta (ya en minúsculas, sin tildes).
   * @param {number} intentosMax - cantidad de errores permitidos antes de perder.
   */
  constructor(palabra, intentosMax = 6) {
    this.palabra = palabra;
    this.intentosMax = intentosMax;
    this.letrasAdivinadas = [];   // letras correctas ya descubiertas
    this.letrasFalladas = [];     // letras incorrectas ya probadas
  }

  /**
   * Procesa el intento de una letra.
   * Devuelve true si la letra está en la palabra, false si no.
   */
  intentarLetra(letra) {
    letra = letra.toLowerCase();

    if (this.letrasAdivinadas.includes(letra) || this.letrasFalladas.includes(letra)) {
      return null; // ya se había probado esta letra
    }

    if (this.palabra.includes(letra)) {
      this.letrasAdivinadas.push(letra);
      return true;
    }

    this.letrasFalladas.push(letra);
    return false;
  }

  /** Cantidad de errores cometidos hasta el momento. */
  get errores() {
    return this.letrasFalladas.length;
  }

  /** true si ya se descubrieron todas las letras de la palabra. */
  haGanado() {
    return this.palabra.split('').every(l => this.letrasAdivinadas.includes(l));
  }

  /** true si se llegó al máximo de errores permitidos. */
  haPerdido() {
    return this.errores >= this.intentosMax;
  }

  /** true si la partida ya terminó (ganó o perdió). */
  terminado() {
    return this.haGanado() || this.haPerdido();
  }

  /**
   * Devuelve la palabra tal como debe mostrarse en pantalla,
   * con guiones bajos en las letras todavía no adivinadas.
   * Ej: "c_s_" para "casa" si solo se adivinó la "c" y la "s".
   */
  obtenerPalabraVisible() {
    return this.palabra
      .split('')
      .map(l => (this.letrasAdivinadas.includes(l) ? l : '_'))
      .join(' ');
  }
}
