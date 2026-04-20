const stage = document.getElementById('stage')
const placeholder = document.getElementById('placeholder')
let contadores = { parrafo: 0, lista: 0, tabla: 0, card: 0, alerta: 0 }

function ocultarPlaceholder() {
  if (placeholder) placeholder.style.display = 'none'
}

const templates = {
  parrafo: () => {
    contadores.parrafo++
    return '<p class="border-start border-primary border-3 ps-3"><strong>Parrafo #' + contadores.parrafo + '</strong> — Agregado con <code>innerHTML</code>. Lorem ipsum dolor sit amet.</p>'
  },
  lista: () => {
    contadores.lista++
    return '<ul class="list-group"><li class="list-group-item"><strong>Lista #' + contadores.lista + '</strong> — Item 1</li><li class="list-group-item">Item 2</li><li class="list-group-item">Item 3</li></ul>'
  },
  tabla: () => {
    contadores.tabla++
    return '<div class="table-responsive"><table class="table table-bordered table-sm"><thead class="table-dark"><tr><th colspan="3">Tabla #' + contadores.tabla + '</th></tr><tr><th>Col A</th><th>Col B</th><th>Col C</th></tr></thead><tbody><tr><td>1</td><td>2</td><td>3</td></tr><tr><td>4</td><td>5</td><td>6</td></tr></tbody></table></div>'
  },
  card: () => {
    contadores.card++
    return '<div class="card border-info"><div class="card-header bg-info text-white">Card #' + contadores.card + '</div><div class="card-body"><h5 class="card-title">Titulo</h5><p class="card-text">Contenido con <code>innerHTML</code>.</p></div></div>'
  },
  alerta: () => {
    contadores.alerta++
    const tipos = ['success', 'warning', 'danger', 'primary', 'info']
    const tipo = tipos[(contadores.alerta - 1) % tipos.length]
    return '<div class="alert alert-' + tipo + '"><strong>Alerta #' + contadores.alerta + '</strong> — Tipo: ' + tipo + '</div>'
  }
}

document.querySelectorAll('.btn-inner').forEach(btn => {
  btn.addEventListener('click', () => {
    ocultarPlaceholder()
    const wrapper = document.createElement('div')
    wrapper.innerHTML = templates[btn.dataset.tipo]()
    stage.appendChild(wrapper)
  })
})

document.getElementById('btn-limpiar').addEventListener('click', () => {
  stage.innerHTML = '<p class="text-muted fst-italic" id="placeholder">Usa los botones para agregar elementos con innerHTML</p>'
  contadores = { parrafo: 0, lista: 0, tabla: 0, card: 0, alerta: 0 }
})