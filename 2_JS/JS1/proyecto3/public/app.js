/**
 * app.js — PersonDB: Almacén de Personas con LocalStorage
 *
 * Funcionalidades:
 *   - Formulario con 12+ campos validados dinámicamente
 *   - Almacenamiento y recuperación en localStorage
 *   - Listado dinámico de personas almacenadas
 *   - Vista de detalle inline
 *   - Búsqueda en tiempo real
 *   - Mensajes de éxito/error animados
 */

"use strict";

// CLAVE usada en localStorage para guardar el array
const LS_KEY = 'persondb_personas';


// Cargar las personas al iniciar la página
// (ya que localStorage persiste entre sesiones)

document.addEventListener('DOMContentLoaded', () => {
  renderLista();          // mostrar lo que haya guardado
  actualizarLSBar();      // actualizar barra de estado
});

// LEER del localStorage
// JSON.parse convierte el string guardado a un array JS

function cargarPersonas() {
  const data = localStorage.getItem(LS_KEY);
  return data ? JSON.parse(data) : [];   // si no hay datos, devolver array vacío
}

// ESCRIBIR en el localStorage
// JSON.stringify convierte el array JS a un string

function guardarEnLS(personas) {
  localStorage.setItem(LS_KEY, JSON.stringify(personas));
  actualizarLSBar();
}


// Actualizar la barra de estado de localStorage
// ─────────────────────────────────────────────────────
function actualizarLSBar() {
  const personas = cargarPersonas();
  const bytes    = (localStorage.getItem(LS_KEY) || '').length;
  document.getElementById('lsStatus').textContent =
    `LocalStorage activo — ${personas.length} registros guardados · ${(bytes / 1024).toFixed(2)} KB usados`;
  document.getElementById('headerCount').textContent = personas.length;
}

// GUARDAR PERSONA — función principal del formulario
function guardarPersona() {
  // ── 1. Leer todos los campos ──
  const nombre       = document.getElementById('p_nombre').value.trim();
  const apellido     = document.getElementById('p_apellido').value.trim();
  const edad         = document.getElementById('p_edad').value.trim();
  const fechanac     = document.getElementById('p_fechanac').value;
  const sexoEl       = document.querySelector('input[name="sexo"]:checked');
  const sexo         = sexoEl ? sexoEl.value : '';
  const documento    = document.getElementById('p_documento').value.trim();
  const estadocivil  = document.getElementById('p_estadocivil').value;
  const nacionalidad = document.getElementById('p_nacionalidad').value;
  const telefono     = document.getElementById('p_telefono').value.trim();
  const mail         = document.getElementById('p_mail').value.trim();
  const tieneHijosEl = document.querySelector('input[name="tieneHijos"]:checked');
  const tieneHijos   = tieneHijosEl ? tieneHijosEl.value : 'no';
  const cantHijos    = document.getElementById('p_cantHijos').value;

  // ── 2. Validar todos los campos ──
  let ok = true;

  // Función auxiliar para mostrar/ocultar mensajes de error
  const validar = (id, errId, condFalla, msg) => {
    const errEl = document.getElementById(errId);
    if (condFalla) {
      errEl.textContent = msg;
      document.getElementById(id)?.classList.add('fc-error');
      ok = false;
    } else {
      errEl.textContent = '';
      document.getElementById(id)?.classList.remove('fc-error');
    }
  };

  // Validaciones campo a campo
  validar('p_nombre',     'e_nombre',     !nombre,                        'El nombre es requerido.');
  validar('p_apellido',   'e_apellido',   !apellido,                      'El apellido es requerido.');
  validar('p_edad',       'e_edad',       !edad || isNaN(+edad) || +edad < 0 || +edad > 120,
                                                                           'Edad inválida (0–120).');
  validar('p_fechanac',   'e_fechanac',   !fechanac,                      'La fecha de nacimiento es requerida.');
  validar('p_documento',  'e_documento',  !/^\d{7,10}$/.test(documento),  'Documento: solo números (7–10 dígitos).');
  validar('p_estadocivil','e_estadocivil',!estadocivil,                   'Seleccioná el estado civil.');
  validar('p_nacionalidad','e_nacionalidad',!nacionalidad,                'Seleccioná la nacionalidad.');
  validar('p_telefono',   'e_telefono',   !/^\d{8,15}$/.test(telefono),   'Teléfono: solo números (8–15 dígitos).');
  validar('p_mail',       'e_mail',       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail),
                                                                           'Email inválido.');

  // Validar campo sexo (radio) — no tiene id directo, usar el contenedor
  const errSexo = document.getElementById('e_sexo');
  if (!sexo) {
    errSexo.textContent = 'Seleccioná el sexo.';
    ok = false;
  } else {
    errSexo.textContent = '';
  }

  // Si tiene hijos, validar cantidad
  if (tieneHijos === 'si') {
    validar('p_cantHijos', 'e_cantHijos',
      !cantHijos || isNaN(+cantHijos) || +cantHijos < 1,
      'Ingresá la cantidad de hijos (mínimo 1).');
  }

  // Si hay errores, NO guardar y mostrar alerta
  if (!ok) {
    mostrarAlerta('⚠️ Hay campos con errores. Revisá el formulario antes de guardar.', 'warn');
    return;
  }

  // ── 3. Verificar que el documento no esté duplicado ──
  const personas = cargarPersonas();
  const duplicado = personas.some(p => p.documento === documento);
  if (duplicado) {
    mostrarAlerta(`El documento <strong>${documento}</strong> ya está registrado.`, 'err');
    return;
  }

  // ── 4. Construir objeto persona ──
  const persona = {
    id:           Date.now(),    // ID único basado en timestamp
    nombre,
    apellido,
    edad:         +edad,
    fechanac,
    sexo,
    documento,
    estadocivil,
    nacionalidad,
    telefono,
    mail,
    tieneHijos:   tieneHijos === 'si',
    cantHijos:    tieneHijos === 'si' ? +cantHijos : 0,
    fechaRegistro: new Date().toLocaleString('es-AR'),
  };

  // ── 5. Agregar al array y guardar en localStorage ──
  personas.push(persona);        // push() al array cargado
  guardarEnLS(personas);         // persistir en localStorage

  // ── 6. Actualizar la interfaz ──
  renderLista();
  limpiarForm();
  mostrarAlerta(
    `✓ <strong>${nombre} ${apellido}</strong> guardado correctamente en LocalStorage.`,
    'ok'
  );

  console.log('[PersonDB] Persona guardada:', persona);
  console.log('[PersonDB] Total en LS:', personas.length);
}

// RENDER LISTA — muestra dinámicamente las personas
function renderLista() {
  const container = document.getElementById('personasList');
  const busqueda  = document.getElementById('busqueda')?.value.toLowerCase() || '';
  let personas    = cargarPersonas();

  // Filtrar por nombre si hay texto en el buscador
  if (busqueda) {
    personas = personas.filter(p =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda)
    );
  }

  // Actualizar contador
  document.getElementById('headerCount').textContent = cargarPersonas().length;

  if (personas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-person-x"></i>
        ${busqueda ? 'No se encontraron personas con ese nombre.' : 'No hay personas registradas aún.<br/>Completá el formulario para comenzar.'}
      </div>`;
    return;
  }

  container.innerHTML = '';

  // Crear una tarjeta por persona (orden inverso: más reciente primero)
  [...personas].reverse().forEach(p => {
    const iniciales = `${p.nombre[0]}${p.apellido[0]}`.toUpperCase();
    const avClass   = p.sexo === 'Femenino' ? 'av-f' : 'av-m';

    const div = document.createElement('div');
    div.className = 'persona-card';
    div.onclick   = (e) => {
      // Evitar que el clic en el botón de eliminar abra el detalle
      if (!e.target.classList.contains('persona-delete') &&
          !e.target.closest('.persona-delete')) {
        mostrarDetalle(p.id);
      }
    };

    div.innerHTML = `
      <div class="persona-avatar ${avClass}">${iniciales}</div>
      <div class="flex-grow-1">
        <div class="persona-name">${p.nombre} ${p.apellido}</div>
        <div class="persona-sub">${p.estadocivil} · ${p.nacionalidad} · ${p.edad} años</div>
        <div class="persona-doc">
          <i class="bi bi-card-text me-1"></i>DNI ${p.documento} ·
          <i class="bi bi-envelope me-1 ms-1"></i>${p.mail}
        </div>
      </div>
      <button class="persona-delete" onclick="eliminarPersona(${p.id})">
        <i class="bi bi-trash3 me-1"></i>Eliminar
      </button>
    `;
    container.appendChild(div);
  });
}

// ELIMINAR persona del localStorage por ID
function eliminarPersona(id) {
  if (!confirm('¿Eliminar esta persona del almacén?')) return;

  let personas = cargarPersonas();
  // filter() crea un nuevo array excluyendo la persona con ese ID
  personas = personas.filter(p => p.id !== id);
  guardarEnLS(personas);
  cerrarDetalle();
  renderLista();
  mostrarAlerta('Persona eliminada del LocalStorage.', 'warn');
}

// MOSTRAR DETALLE inline de una persona
function mostrarDetalle(id) {
  const personas = cargarPersonas();
  const p        = personas.find(per => per.id === id);
  if (!p) return;

  // Mapeo de campos a etiquetas amigables
  const campos = [
    ['Nombre completo',   `${p.nombre} ${p.apellido}`],
    ['Edad',              `${p.edad} años`],
    ['Fecha de nac.',     p.fechanac],
    ['Sexo',              p.sexo],
    ['Documento',         p.documento],
    ['Estado civil',      p.estadocivil],
    ['Nacionalidad',      p.nacionalidad],
    ['Teléfono',          p.telefono],
    ['Email',             p.mail],
    ['Hijos',             p.tieneHijos ? `Sí — ${p.cantHijos} hijo/s` : 'No'],
    ['Fecha de registro', p.fechaRegistro],
  ];

  const panel    = document.getElementById('detallePanel');
  const titulo   = document.getElementById('detalleTitulo');
  const contenido = document.getElementById('detalleContenido');

  titulo.textContent = `${p.nombre} ${p.apellido}`;
  contenido.innerHTML = campos.map(([key, val]) => `
    <div class="col-12 detalle-row">
      <span class="d-key">${key}</span>
      <span class="d-val">${val}</span>
    </div>`
  ).join('');

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cerrarDetalle() {
  document.getElementById('detallePanel').style.display = 'none';
}

// TOGGLE campo "cantidad de hijos"
// Se muestra u oculta dinámicamente según el radio seleccionado
function toggleHijos(radio) {
  const campoHijos = document.getElementById('cantHijosField');
  if (radio.value === 'si') {
    campoHijos.style.display = 'block';
  } else {
    campoHijos.style.display = 'none';
    document.getElementById('p_cantHijos').value = '';
    document.getElementById('e_cantHijos').textContent = '';
  }
}

// BORRAR TODO el localStorage de esta app

function borrarTodo() {
  if (!confirm('¿Borrar TODOS los registros del LocalStorage?')) return;
  localStorage.removeItem(LS_KEY);
  renderLista();
  actualizarLSBar();
  cerrarDetalle();
  mostrarAlerta('🗑️ LocalStorage vaciado correctamente.', 'warn');
}

// LIMPIAR el formulario y sus mensajes de error
function limpiarForm() {
  document.getElementById('formPersona').reset();
  document.querySelectorAll('.err-msg').forEach(el => el.textContent = '');
  document.querySelectorAll('.fc-error').forEach(el => el.classList.remove('fc-error'));
  document.getElementById('cantHijosField').style.display = 'none';
}

// MOSTRAR ALERTA dinámica con auto-ocultar
function mostrarAlerta(mensaje, tipo) {
  const zone = document.getElementById('alertZone');
  zone.innerHTML = `<div class="alert-${tipo}">${mensaje}</div>`;
  zone.style.display = 'block';

  clearTimeout(zone._timer);
  zone._timer = setTimeout(() => {
    zone.style.display = 'none';
  }, 5000);

  // Hacer scroll hacia la alerta
  zone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}