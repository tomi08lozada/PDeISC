// js/game.js
// Conecta la clase Hangman con el DOM y el flujo de autenticación.

const ABECEDARIO = 'abcdefghijklmnopqrstuvwxyz'.split('');

let juego = null;
let segundosJugados = 0;
let intervaloTiempo = null;
let modoAuth = 'login';

const elementos = {
  palabraOculta: document.getElementById('palabraOculta'),
  mensajeEstado: document.getElementById('mensajeEstado'),
  contadorErrores: document.getElementById('contadorErrores'),
  teclado: document.getElementById('teclado'),
  titulo: document.getElementById('titulo'),
  btnNuevaPalabra: document.getElementById('btnNuevaPalabra'),
  chipJugador: document.getElementById('chipJugador'),
  btnCerrarSesion: document.getElementById('btnCerrarSesion'),
  modalAuth: document.getElementById('modalAuth'),
  tituloAuth: document.getElementById('tituloAuth'),
  mensajeAuth: document.getElementById('mensajeAuth'),
  inputUsuario: document.getElementById('inputUsuario'),
  inputPassword: document.getElementById('inputPassword'),
  btnLogin: document.getElementById('btnLogin'),
  btnRegistro: document.getElementById('btnRegistro'),
  btnAlternarAuth: document.getElementById('btnAlternarAuth')
};

const PARTES_CUERPO = [
  'parte-cabeza', 'parte-torso', 'parte-brazo-izq',
  'parte-brazo-der', 'parte-pierna-izq', 'parte-pierna-der'
];

function mostrarMensajeAuth(texto, esError = false) {
  elementos.mensajeAuth.textContent = texto || '';
  elementos.mensajeAuth.className = esError ? 'mensaje-auth error' : 'mensaje-auth';
}

function actualizarVistaAuth() {
  const esLogin = modoAuth === 'login';
  elementos.tituloAuth.textContent = esLogin ? 'Iniciar sesión' : 'Crear cuenta';
  elementos.btnLogin.classList.toggle('oculta', !esLogin);
  elementos.btnRegistro.classList.toggle('oculta', esLogin);
  elementos.btnAlternarAuth.textContent = esLogin
    ? '¿No tenés cuenta? Registrate'
    : '¿Ya tenés cuenta? Iniciá sesión';
  mostrarMensajeAuth('');
}

function mostrarModalAuth() {
  actualizarVistaAuth();
  elementos.modalAuth.classList.remove('oculta');
  elementos.inputUsuario.focus();
}

function ocultarModalAuth() {
  elementos.modalAuth.classList.add('oculta');
  mostrarMensajeAuth('');
}

function actualizarInterfazSesion() {
  const autenticado = estaAutenticado();
  const usuario = obtenerUsuario();

  elementos.chipJugador.textContent = autenticado ? `👤 ${usuario}` : '👤 —';
  elementos.btnCerrarSesion.classList.toggle('oculta', !autenticado);

  if (autenticado) {
    ocultarModalAuth();
    if (!juego) iniciarPartida();
  } else {
    mostrarModalAuth();
  }
}

async function procesarAuth(accion) {
  const usuario = elementos.inputUsuario.value.trim();
  const password = elementos.inputPassword.value;

  if (!usuario || !password) {
    mostrarMensajeAuth('Completá usuario y contraseña.', true);
    return;
  }

  mostrarMensajeAuth('Procesando...');

  const resultado = accion === 'login'
    ? await iniciarSesion(usuario, password)
    : await crearCuenta(usuario, password);

  if (!resultado.ok) {
    mostrarMensajeAuth(resultado.mensaje || 'No se pudo completar la operación.', true);
    return;
  }

  guardarSesion(resultado.token, resultado.username);
  elementos.inputPassword.value = '';
  actualizarInterfazSesion();
}

function cerrarSesionLocal() {
  cerrarSesion();
  detenerTemporizador();
  juego = null;
  elementos.mensajeEstado.textContent = 'Iniciá sesión para jugar.';
  elementos.mensajeEstado.className = 'mensaje-estado';
  actualizarInterfazSesion();
}

elementos.btnLogin.addEventListener('click', () => procesarAuth('login'));
elementos.btnRegistro.addEventListener('click', () => procesarAuth('registro'));
elementos.btnAlternarAuth.addEventListener('click', () => {
  modoAuth = modoAuth === 'login' ? 'registro' : 'login';
  actualizarVistaAuth();
});
elementos.btnCerrarSesion.addEventListener('click', cerrarSesionLocal);

elementos.inputPassword.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') procesarAuth(modoAuth);
});
elementos.inputUsuario.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') elementos.inputPassword.focus();
});

async function iniciarPartida() {
  if (!estaAutenticado()) {
    mostrarModalAuth();
    return;
  }

  detenerTemporizador();
  elementos.mensajeEstado.textContent = 'Cargando palabra...';
  elementos.mensajeEstado.className = 'mensaje-estado';

  const palabra = await obtenerPalabraAleatoria();
  juego = new Hangman(palabra, 6);
  segundosJugados = 0;

  ocultarPartesCuerpo();
  construirTeclado();
  actualizarVista();
  elementos.mensajeEstado.textContent = '¡Adiviná la palabra!';
  iniciarTemporizador();
}

function construirTeclado() {
  elementos.teclado.innerHTML = '';
  ABECEDARIO.forEach(letra => {
    const boton = document.createElement('button');
    boton.textContent = letra;
    boton.className = 'tecla';
    boton.addEventListener('click', () => manejarIntentoLetra(letra, boton));
    elementos.teclado.appendChild(boton);
  });
}

function manejarIntentoLetra(letra, boton) {
  if (!juego || juego.terminado()) return;

  const acierto = juego.intentarLetra(letra);
  if (acierto === null) return;

  boton.disabled = true;
  boton.classList.add(acierto ? 'correcta' : 'incorrecta');

  if (!acierto) mostrarSiguienteParteCuerpo();

  actualizarVista();

  if (juego.terminado()) finalizarPartida();
}

function mostrarSiguienteParteCuerpo() {
  const parte = PARTES_CUERPO[juego.errores - 1];
  const el = document.getElementById(parte);
  if (el) el.style.display = 'inline';
}

function ocultarPartesCuerpo() {
  PARTES_CUERPO.forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
}

function actualizarVista() {
  elementos.palabraOculta.textContent = juego.obtenerPalabraVisible();
  elementos.contadorErrores.textContent = juego.errores;
}

function iniciarTemporizador() {
  intervaloTiempo = setInterval(() => { segundosJugados++; }, 1000);
}

function detenerTemporizador() {
  clearInterval(intervaloTiempo);
}

function formatearResumenPartida(resultado) {
  const puntos = resultado.puntosPartida;
  const tiempo = resultado.tiempoPartida;

  if (resultado.actualizado) {
    return `¡Ganaste! 🎉 Esta partida: ${puntos} pts en ${tiempo}s. ¡Nuevo récord guardado!`;
  }

  return `¡Ganaste! 🎉 Esta partida: ${puntos} pts en ${tiempo}s. Tu récord sigue siendo ${resultado.puntosRecord} pts (${resultado.tiempoRecord}s).`;
}

async function finalizarPartida() {
  detenerTemporizador();

  if (juego.haGanado()) {
    elementos.mensajeEstado.textContent = '¡Ganaste! 🎉 Guardando tu puntaje...';
    elementos.mensajeEstado.className = 'mensaje-estado ganado';

    const resultado = await guardarScore({
      tiempo: segundosJugados,
      puntos: calcularPuntos()
    });

    if (resultado.ok) {
      elementos.mensajeEstado.textContent = formatearResumenPartida(resultado);
      cargarTabla();
    } else {
      elementos.mensajeEstado.textContent = `¡Ganaste! 🎉 (${resultado.mensaje || 'no se pudo guardar el puntaje'})`;
    }
  } else {
    elementos.palabraOculta.textContent = juego.palabra.split('').join(' ');
    elementos.mensajeEstado.textContent = 'Perdiste 😢 La palabra era: ' + juego.palabra;
    elementos.mensajeEstado.className = 'mensaje-estado perdido';
  }

  document.querySelectorAll('.tecla').forEach(b => b.disabled = true);
}

function calcularPuntos() {
  const base = juego.palabra.length * 20;
  const penalizacionErrores = juego.errores * 10;
  const penalizacionTiempo = Math.floor(segundosJugados / 2);
  return Math.max(base - penalizacionErrores - penalizacionTiempo, 10);
}

elementos.btnNuevaPalabra.addEventListener('click', iniciarPartida);

elementos.titulo.addEventListener('dblclick', () => {
  if (estaAutenticado()) iniciarPartida();
});

document.querySelector('.dibujo').addEventListener('mouseenter', () => {
  document.querySelector('.dibujo').style.filter = 'drop-shadow(0 0 8px var(--color-acento))';
});
document.querySelector('.dibujo').addEventListener('mouseleave', () => {
  document.querySelector('.dibujo').style.filter = 'none';
});

actualizarInterfazSesion();
