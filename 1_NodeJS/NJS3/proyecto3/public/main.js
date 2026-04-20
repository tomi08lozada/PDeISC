const panelHijos = document.getElementById('panel-hijos')
const mapa = {
  click: 'contenedor-click',
  teclado: 'contenedor-teclado',
  mouse: 'contenedor-mouse',
  focus: 'contenedor-focus',
  doble: 'contenedor-doble'
}

document.querySelectorAll('.nav-section').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault()
    const target = btn.dataset.target
    document.querySelectorAll('.section-panel').forEach(p => p.classList.add('d-none'))
    document.getElementById('section-' + target).classList.remove('d-none')

    const contenedor = document.getElementById(mapa[target])
    const hijos = contenedor ? contenedor.children : []
    let lista = ''
    for (let i = 0; i < hijos.length; i++) {
      lista += '<li><code>&lt;' + hijos[i].tagName.toLowerCase() + '&gt;</code> — clase: <code>"' + (hijos[i].className || '(sin clase)') + '"</code></li>'
    }
    panelHijos.innerHTML =
      '<div class="d-flex align-items-center gap-3 mb-3">' +
        '<span class="badge bg-dark fs-5">' + hijos.length + '</span>' +
        '<div><strong>hijos directos</strong> en <code>#' + mapa[target] + '</code></div>' +
      '</div>' +
      '<ul class="mb-0">' + lista + '</ul>'
  })
})