// Proyecto 2

// Navegación 
document.querySelectorAll('.nav-section').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault()
    const target = btn.dataset.target
    document.querySelectorAll('.section-panel').forEach(p => p.classList.add('d-none'))
    document.getElementById('section-' + target).classList.remove('d-none')
  })
})

// Sección 1: click (contador) 
let clics = 0
document.getElementById('btn-contador').addEventListener('click', () => {
  clics++
  document.getElementById('resultado-click').textContent = `Clics: ${clics}`
})

// ── Sección 2: keydown / keyup 
const inputTeclado = document.getElementById('input-teclado')
const resultadoTeclado = document.getElementById('resultado-teclado')

inputTeclado.addEventListener('keydown', (e) => {
  resultadoTeclado.innerHTML = `⬇️ <strong>keydown</strong> — Tecla: <code>${e.key}</code> | Código: <code>${e.code}</code>`
})

inputTeclado.addEventListener('keyup', (e) => {
  resultadoTeclado.innerHTML = `⬆️ <strong>keyup</strong> — Tecla: <code>${e.key}</code> | Código: <code>${e.code}</code>`
})

//  Sección 3: mousemove / mouseenter / mouseleave 
const zonaMouse = document.getElementById('zona-mouse')
const resultadoMouse = document.getElementById('resultado-mouse')

zonaMouse.addEventListener('mousemove', (e) => {
  const rect = zonaMouse.getBoundingClientRect()
  const x = Math.round(e.clientX - rect.left)
  const y = Math.round(e.clientY - rect.top)
  resultadoMouse.innerHTML = `🖱️ <strong>mousemove</strong> — X: <code>${x}</code> &nbsp; Y: <code>${y}</code>`
})

zonaMouse.addEventListener('mouseenter', () => {
  zonaMouse.style.background = '#fff3cd'
  resultadoMouse.innerHTML = `✅ <strong>mouseenter</strong> — El mouse entró al área`
})

zonaMouse.addEventListener('mouseleave', () => {
  zonaMouse.style.background = ''
  resultadoMouse.innerHTML = `❌ <strong>mouseleave</strong> — El mouse salió del área`
})

//  Sección 4: focus / blur
const inputFocus = document.getElementById('input-focus')
const resultadoFocus = document.getElementById('resultado-focus')

inputFocus.addEventListener('focus', () => {
  resultadoFocus.innerHTML = `🟢 <strong>focus</strong> — El campo tiene el foco`
  inputFocus.classList.add('border-info')
})

inputFocus.addEventListener('blur', () => {
  resultadoFocus.innerHTML = `🔴 <strong>blur</strong> — El campo perdió el foco. Valor: <code>"${inputFocus.value}"</code>`
  inputFocus.classList.remove('border-info')
})

// ── Sección 5: dblclick ───────────────────────────────────
const cajaDobleClic = document.getElementById('caja-doble')
const resultadoDoble = document.getElementById('resultado-doble')
const colores = ['#ffd6d6', '#d6ffd6', '#d6d6ff', '#fff4d6', '#d6f4ff']
let colorIdx = 0

cajaDobleClic.addEventListener('dblclick', () => {
  colorIdx = (colorIdx + 1) % colores.length
  cajaDobleClic.style.background = colores[colorIdx]
  resultadoDoble.innerHTML = `💥 <strong>dblclick</strong> — Color cambiado a <code>${colores[colorIdx]}</code>`
})