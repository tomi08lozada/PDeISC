const contenedor = document.getElementById('contenedor-links')
const logPanel = document.getElementById('log-cambios')

function agregarLog(msg) {
  if (logPanel.querySelector('p.text-muted')) logPanel.innerHTML = ''
  const entry = document.createElement('div')
  entry.className = 'log-entry'
  const hora = new Date().toLocaleTimeString()
  entry.innerHTML = '<span class="text-muted">[' + hora + ']</span> ' + msg
  logPanel.prepend(entry)
}

document.querySelectorAll('.btn-crear').forEach(btn => {
  btn.addEventListener('click', () => {
    const href = btn.dataset.href
    const texto = btn.dataset.texto
    const id = 'link-' + texto
    if (document.getElementById(id)) {
      agregarLog('El enlace <strong>' + texto + '</strong> ya existe.')
      return
    }
    if (contenedor.querySelector('p.text-muted')) contenedor.innerHTML = ''
    const a = document.createElement('a')
    a.id = id
    a.href = href
    a.textContent = texto
    a.target = '_blank'
    contenedor.appendChild(a)
    agregarLog('Creado enlace <strong>' + texto + '</strong> a <code>' + href + '</code>')
  })
})

document.querySelectorAll('.btn-modificar').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = 'link-' + btn.dataset.id
    const nuevoHref = btn.dataset.nuevoHref
    const nuevoTexto = btn.dataset.nuevoTexto
    const enlace = document.getElementById(id)
    if (!enlace) {
      agregarLog('El enlace <strong>' + btn.dataset.id + '</strong> no existe. Crealo primero.')
      return
    }
    const hrefAnterior = enlace.getAttribute('href')
    enlace.setAttribute('href', nuevoHref)
    enlace.textContent = nuevoTexto
    agregarLog('Modificado <strong>' + btn.dataset.id + '</strong>: href <code>' + hrefAnterior + '</code> a <code>' + nuevoHref + '</code>')
  })
})

document.getElementById('btn-limpiar').addEventListener('click', () => {
  contenedor.innerHTML = '<p class="text-muted fst-italic">No hay enlaces. Crea algunos con los botones de arriba.</p>'
  agregarLog('Todos los enlaces fueron eliminados.')
})

document.getElementById('btn-limpiar-log').addEventListener('click', () => {
  logPanel.innerHTML = '<p class="text-muted fst-italic p-2">Sin cambios registrados.</p>'
})