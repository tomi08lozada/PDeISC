
"use strict";

/* ════════════════════════════════════════════════════
   REFERENCIAS AL DOM
════════════════════════════════════════════════════ */
const fileInput      = document.getElementById("fileInput");
const selectBtn      = document.getElementById("selectBtn");
const dropZone       = document.getElementById("dropZone");
const fileNameDisplay = document.getElementById("fileNameDisplay");
const uploadError    = document.getElementById("uploadError");

const resultsSection = document.getElementById("resultsSection");

const statTotal   = document.getElementById("statTotal");
const statValid   = document.getElementById("statValid");
const statInvalid = document.getElementById("statInvalid");
const statPct     = document.getElementById("statPct");
const pctBar      = document.getElementById("pctBar");
const pctLabel    = document.getElementById("pctLabel");

const validList   = document.getElementById("validList");
const invalidList = document.getElementById("invalidList");
const validCount  = document.getElementById("validCount");
const invalidCount = document.getElementById("invalidCount");

const saveBtn  = document.getElementById("saveBtn");
const saveMsg  = document.getElementById("saveMsg");

const themeToggle = document.getElementById("themeToggle");
const themeIcon   = document.getElementById("themeIcon");

/* ════════════════════════════════════════════════════
   ESTADO
════════════════════════════════════════════════════ */
let lastResult = null;   // { valid: number[], invalid: number[], all: number[] }

/* ════════════════════════════════════════════════════
   TEMA
════════════════════════════════════════════════════ */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.className = theme === "dark" ? "bi bi-moon-stars-fill" : "bi bi-sun-fill";
  localStorage.setItem("numfilter-theme", theme);
}

(function initTheme() {
  const saved  = localStorage.getItem("numfilter-theme");
  const system = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  applyTheme(saved || system);
})();

themeToggle.addEventListener("click", () => {
  applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

/* ════════════════════════════════════════════════════
   LÓGICA DE FILTRADO
════════════════════════════════════════════════════ */

/**
 * Recibe el contenido del .txt y devuelve todos los números encontrados.
 * Busca líneas con el patrón:  #01  →  525
 * También acepta archivos planos (un número por línea).
 *
 * @param {string} text - Contenido crudo del archivo.
 * @returns {number[]}
 */
function extractNumbers(text) {
  const numbers = [];

  for (const line of text.split("\n")) {
    const trimmed = line.trim();

    // Formato NumReg: "  #01  →  525"
    const arrowMatch = trimmed.match(/→\s*(-?\d+)/);
    if (arrowMatch) {
      numbers.push(parseInt(arrowMatch[1], 10));
      continue;
    }

    // Formato plano: línea que solo contiene un entero
    if (/^-?\d+$/.test(trimmed)) {
      numbers.push(parseInt(trimmed, 10));
    }
  }

  return numbers;
}

/**
 * Determina si un número cumple la condición:
 * su primer dígito (ignorando signo) == su último dígito.
 *
 * Ejemplos: 525 ✓ | 3 ✓ | 1221 ✗ | -151 ✓ | -120 ✗
 *
 * @param {number} n
 * @returns {boolean}
 */
function startsAndEndsSame(n) {
  const str = Math.abs(n).toString();   // ignoramos el signo negativo
  return str[0] === str[str.length - 1];
}

/**
 * Procesa el array de números y devuelve válidos e inválidos.
 * Los válidos se ordenan de menor a mayor.
 *
 * @param {number[]} numbers
 * @returns {{ valid: number[], invalid: number[], all: number[] }}
 */
function filterNumbers(numbers) {
  const valid   = numbers.filter(startsAndEndsSame).sort((a, b) => a - b);
  const invalid = numbers.filter(n => !startsAndEndsSame(n));
  return { valid, invalid, all: numbers };
}

/* ════════════════════════════════════════════════════
   RENDERIZADO DE RESULTADOS
════════════════════════════════════════════════════ */
function renderResults(result) {
  const { valid, invalid, all } = result;
  const total = all.length;
  const pct   = total === 0 ? 0 : Math.round((valid.length / total) * 100);

  // Estadísticas
  statTotal.textContent   = total;
  statValid.textContent   = valid.length;
  statInvalid.textContent = invalid.length;
  statPct.textContent     = `${pct}%`;
  pctBar.style.width      = `${pct}%`;
  pctLabel.textContent    = `${pct}%`;

  // Contadores de sección
  validCount.textContent   = valid.length;
  invalidCount.textContent = invalid.length;

  // Chips válidos (ordenados asc ya desde filterNumbers)
  validList.innerHTML = "";
  if (valid.length === 0) {
    validList.innerHTML = `<span class="text-muted" style="font-size:.88rem">Ningún número cumple la condición.</span>`;
  } else {
    valid.forEach((n, i) => {
      const chip = document.createElement("span");
      chip.className = "num-chip valid";
      chip.style.animationDelay = `${i * 0.04}s`;
      chip.innerHTML = `<span class="chip-pos">#${i + 1}</span>${n}`;
      validList.appendChild(chip);
    });
  }

  // Chips inválidos
  invalidList.innerHTML = "";
  if (invalid.length === 0) {
    invalidList.innerHTML = `<span class="text-muted" style="font-size:.88rem">Todos los números son útiles.</span>`;
  } else {
    invalid.forEach((n, i) => {
      const chip = document.createElement("span");
      chip.className = "num-chip invalid";
      chip.style.animationDelay = `${i * 0.04}s`;
      chip.innerHTML = `${n}`;
      invalidList.appendChild(chip);
    });
  }

  // Muestra la sección
  resultsSection.classList.remove("d-none");
  saveMsg.classList.add("d-none");

  // Scroll suave hacia los resultados
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ════════════════════════════════════════════════════
   PROCESAR ARCHIVO
════════════════════════════════════════════════════ */
function processFile(file) {
  uploadError.textContent = "";

  // Validar tipo
  if (!file.name.endsWith(".txt")) {
    uploadError.textContent = "⚠️ Solo se aceptan archivos .txt";
    return;
  }

  // Mostrar nombre
  fileNameDisplay.textContent = `📄 ${file.name}`;
  fileNameDisplay.classList.remove("d-none");

  const reader = new FileReader();

  reader.onload = (e) => {
    const text    = e.target.result;
    const numbers = extractNumbers(text);

    if (numbers.length === 0) {
      uploadError.textContent = "⚠️ No se encontraron números en el archivo.";
      resultsSection.classList.add("d-none");
      return;
    }

    lastResult = filterNumbers(numbers);
    renderResults(lastResult);
  };

  reader.onerror = () => {
    uploadError.textContent = "⚠️ Error al leer el archivo.";
  };

  reader.readAsText(file, "utf-8");
}

/* ════════════════════════════════════════════════════
   GUARDAR RESULTADO EN DISCO
════════════════════════════════════════════════════ */

/**
 * Construye el contenido del .txt de resultado.
 */
function buildResultContent(result) {
  const { valid, invalid, all } = result;
  const total = all.length;
  const pct   = total === 0 ? 0 : ((valid.length / total) * 100).toFixed(1);
  const sep   = "─".repeat(40);
  const now   = new Date();
  const pad   = n => String(n).padStart(2, "0");
  const ts    = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ` +
                `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return [
    "NumFilter — Resultado del filtrado",
    sep,
    `Fecha y hora    : ${ts}`,
    `Total leídos    : ${total}`,
    `Útiles          : ${valid.length}`,
    `Descartados     : ${invalid.length}`,
    `% útiles        : ${pct}%`,
    sep,
    "",
    "NÚMEROS ÚTILES (mismo dígito al inicio y al final, orden ascendente):",
    "",
    valid.length > 0
      ? valid.map((n, i) => `  #${String(i+1).padStart(2,"0")}  →  ${n}`).join("\n")
      : "  (ninguno)",
    "",
    sep,
    "NÚMEROS DESCARTADOS:",
    "",
    invalid.length > 0
      ? invalid.map((n, i) => `  #${String(i+1).padStart(2,"0")}  →  ${n}`).join("\n")
      : "  (ninguno)",
    "",
    sep,
  ].join("\n");
}

/**
 * Descarga el archivo en el navegador y lo envía al servidor para guardarlo en disco.
 */
async function saveResult() {
  if (!lastResult) return;

  const content  = buildResultContent(lastResult);
  const now      = new Date();
  const pad      = n => String(n).padStart(2, "0");
  const ts       = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}` +
                   `_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const filename = `numfilter_resultado_${ts}.txt`;

  // ── 1. Descarga en el navegador ──
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // ── 2. Guarda en disco vía servidor (Node.js fs.writeFile) ──
  try {
    const res  = await fetch("/api/save", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ filename, content }),
    });
    const data = await res.json();

    saveMsg.classList.remove("d-none", "error");
    if (data.ok) {
      saveMsg.textContent = `✅ Guardado en: archivos_guardados/${filename}`;
    } else {
      saveMsg.textContent = `⚠️ Descargado, pero no se pudo guardar en disco: ${data.error}`;
      saveMsg.classList.add("error");
    }
  } catch {
    saveMsg.classList.remove("d-none");
    saveMsg.classList.add("error");
    saveMsg.textContent = "⚠️ Descargado en el navegador. El servidor no está disponible para guardar en disco.";
  }
}

/* ════════════════════════════════════════════════════
   EVENTOS
════════════════════════════════════════════════════ */

// Botón elegir archivo
selectBtn.addEventListener("click", () => fileInput.click());

// Cambio en el input file
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) processFile(fileInput.files[0]);
});

// Drag & Drop
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
});

// Botón guardar
saveBtn.addEventListener("click", saveResult);