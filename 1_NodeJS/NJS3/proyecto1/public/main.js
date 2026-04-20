// Proyecto 1 — Manipulación DOM con DHTML

const stage = document.getElementById('stage')
const placeholder = document.getElementById('placeholder-msg')
const toastEl = document.getElementById('toastFeedback')
const toastMsg = document.getElementById('toast-msg')
const toast = new bootstrap.Toast(toastEl, { delay: 2000 })

const colores = ['#198754', '#0d6efd', '#dc3545', '#fd7e14', '#6f42c1', '#20c997']
let colorIndex = 0

const imagenes = [
  'https://picsum.photos/seed/foto1/500/260',
  'https://picsum.photos/seed/foto2/500/260',
  'https://picsum.photos/seed/foto3/500/260'
]
let imgIndex = 0

const tamanios = ['200px', '350px', '100%']
let sizeIndex = 0

function mostrarToast(msg) {
  toastMsg.textContent = msg
  toast.show()
}

function ocultarPlaceholder() {
  if (placeholder) placeholder.style.display = 'none'
}

// 1. Agregar H1
document.getElementById('btn-agregar-h1').addEventListener('click', () => {
  if (!document.getElementById('titulo-dom')) {
    ocultarPlaceholder()
    const h1 = document.createElement('h1')
    h1.id = 'titulo-dom'
    h1.textContent = 'Hola DOM'
    stage.appendChild(h1)
    mostrarToast(' H1 agregado al DOM')
  } else {
    mostrarToast(' El H1 ya existe')
  }
})

// 2. Cambiar texto del H1
document.getElementById('btn-cambiar-texto').addEventListener('click', () => {
  const h1 = document.getElementById('titulo-dom')
  if (h1) {
    h1.textContent = h1.textContent === 'Hola DOM' ? 'Chau DOM' : 'Hola DOM'
    mostrarToast(` Texto cambiado a: "${h1.textContent}"`)
  } else {
    mostrarToast(' Primero agregá el H1')
  }
})

// 3. Cambiar color del H1
document.getElementById('btn-cambiar-color').addEventListener('click', () => {
  const h1 = document.getElementById('titulo-dom')
  if (h1) {
    colorIndex = (colorIndex + 1) % colores.length
    h1.style.color = colores[colorIndex]
    mostrarToast(` Color cambiado a: ${colores[colorIndex]}`)
  } else {
    mostrarToast(' Primero agregá el H1')
  }
})

// 4. Agregar imagen
document.getElementById('btn-agregar-img').addEventListener('click', () => {
  if (!document.getElementById('imagen-dom')) {
    ocultarPlaceholder()
    const img = document.createElement('img')
    img.id = 'imagen-dom'
    img.src = imagenes[0]
    img.alt = 'Imagen dinámica'
    img.style.width = tamanios[0]
    img.classList.add('img-fluid')
    stage.appendChild(img)
    mostrarToast(' Imagen agregada al DOM')
  } else {
    mostrarToast(' La imagen ya existe')
  }
})

// 5. Cambiar imagen
document.getElementById('btn-cambiar-img').addEventListener('click', () => {
  const img = document.getElementById('imagen-dom')
  if (img) {
    imgIndex = (imgIndex + 1) % imagenes.length
    img.src = imagenes[imgIndex]
    mostrarToast(` Imagen cambiada (${imgIndex + 1}/${imagenes.length})`)
  } else {
    mostrarToast(' Primero agregá la imagen')
  }
})

// 6. Cambiar tamaño
document.getElementById('btn-cambiar-size').addEventListener('click', () => {
  const img = document.getElementById('imagen-dom')
  if (img) {
    sizeIndex = (sizeIndex + 1) % tamanios.length
    img.style.width = tamanios[sizeIndex]
    mostrarToast(` Tamaño cambiado a: ${tamanios[sizeIndex]}`)
  } else {
    mostrarToast(' Primero agregá la imagen')
  }
})