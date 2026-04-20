const preview = document.getElementById('preview')

//VALIDACIONES EN TIEMPO REAL

// NOMBRE: bloquea cualquier caracter que no sea letra o espacio mientras escribe
document.getElementById('inp-nombre').addEventListener('input', function () {
  // Elimina todo lo que no sea letra (incluyendo tildes y ñ) o espacio
  this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '')
  actualizarPreview()
})

// EMAIL: se valida al registrar (el navegador ya maneja type="email")
document.getElementById('inp-email').addEventListener('input', actualizarPreview)

// EDAD: bloquea letras y valores fuera de rango mientras escribe
document.getElementById('inp-edad').addEventListener('input', function () {
  // Elimina todo lo que no sea dígito
  this.value = this.value.replace(/[^0-9]/g, '')
  // Si el valor excede 120, lo corrige
  if (this.value !== '' && Number(this.value) > 120) this.value = '120'
  actualizarPreview()
})

//PREVIEW

function obtenerDatos() {
  const nombre = document.getElementById('inp-nombre').value.trim()
  const email  = document.getElementById('inp-email').value.trim()
  const edad   = document.getElementById('inp-edad').value.trim()
  const pais   = document.getElementById('sel-pais').value
  const generoEl = document.querySelector('input[name="genero"]:checked')
  const genero = generoEl ? generoEl.value : ''
  const intereses = []
  document.querySelectorAll('.chk-interes:checked').forEach(chk => intereses.push(chk.value))
  return { nombre, email, edad, pais, genero, intereses }
}

function fila(label, valor) {
  return (
    '<div class="dato-fila">' +
      '<span class="dato-label">' + label + '</span>' +
      '<span class="dato-valor">' + (valor || '<em class="text-muted">Sin completar</em>') + '</span>' +
    '</div>'
  )
}

function actualizarPreview() {
  const d = obtenerDatos()
  preview.innerHTML =
    '<h5 class="fw-bold mb-3">Datos ingresados:</h5>' +
    fila('Nombre',    d.nombre) +
    fila('Email',     d.email) +
    fila('Edad',      d.edad ? d.edad + ' años' : '') +
    fila('Género',    d.genero) +
    fila('País',      d.pais) +
    fila('Intereses', d.intereses.length ? d.intereses.join(', ') : '')
}

// Listeners restantes (nombre y edad ya tienen el suyo arriba)
document.getElementById('sel-pais').addEventListener('change', actualizarPreview)
document.querySelectorAll('input[name="genero"]').forEach(r => r.addEventListener('change', actualizarPreview))
document.querySelectorAll('.chk-interes').forEach(chk => chk.addEventListener('change', actualizarPreview))

//REGISTRAR

document.getElementById('btn-registrar').addEventListener('click', () => {
  const d = obtenerDatos()
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)

  if (!d.nombre || !d.email || !emailValido) {
    let errores = []
    if (!d.nombre)     errores.push('el nombre')
    if (!d.email)      errores.push('el email')
    else if (!emailValido) errores.push('un email válido (ej: nombre@mail.com)')
    preview.innerHTML =
      '<div class="alert alert-danger">Por favor ingresá: ' + errores.join(' y ') + '.</div>'
    return
  }

  preview.innerHTML =
    '<div class="alert alert-success fw-bold mb-3">¡Registro exitoso!</div>' +
    '<h5 class="fw-bold mb-3">Resumen:</h5>' +
    fila('Nombre',    d.nombre) +
    fila('Email',     d.email) +
    fila('Edad',      (d.edad || '-') + ' años') +
    fila('Género',    d.genero || '-') +
    fila('País',      d.pais   || '-') +
    fila('Intereses', d.intereses.length ? d.intereses.join(', ') : 'Ninguno')
})

// Inicializar preview al cargar
actualizarPreview()