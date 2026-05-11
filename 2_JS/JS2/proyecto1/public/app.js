

"use strict";

/* ════════════════════════════════════════════════════
   CONSTANTES
════════════════════════════════════════════════════ */
const MIN_NUMBERS = 10;
const MAX_NUMBERS = 20;

/* ════════════════════════════════════════════════════
   REFERENCIAS AL DOM
════════════════════════════════════════════════════ */
const numberInput  = document.getElementById("numberInput");
const addBtn       = document.getElementById("addBtn");
const errorMsg     = document.getElementById("errorMsg");
const counter      = document.getElementById("counter");
const progressBar  = document.getElementById("progressBar");
const saveBtn      = document.getElementById("saveBtn");
const clearBtn     = document.getElementById("clearBtn");
const numbersPanel = document.getElementById("numbersPanel");
const numbersList  = document.getElementById("numbersList");
const historyPanel = document.getElementById("historyPanel");
const historyList  = document.getElementById("historyList");
const themeToggle  = document.getElementById("themeToggle");
const themeIcon    = document.getElementById("themeIcon");

/* ════════════════════════════════════════════════════
   ESTADO DE LA APLICACIÓN
════════════════════════════════════════════════════ */
let numbers     = [];
let fileHistory = [];

/* ════════════════════════════════════════════════════
   TEMA (claro / oscuro)
════════════════════════════════════════════════════ */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "dark") {
    themeIcon.className = "bi bi-moon-stars-fill";
    themeToggle.title   = "Cambiar a modo claro";
  } else {
    themeIcon.className = "bi bi-sun-fill";
    themeToggle.title   = "Cambiar a modo oscuro";
  }
  localStorage.setItem("numreg-theme", theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

(function initTheme() {
  const saved  = localStorage.getItem("numreg-theme");
  const system = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  applyTheme(saved || system);
})();

themeToggle.addEventListener("click", toggleTheme);

/* ════════════════════════════════════════════════════
   MENSAJES DE ERROR / INFO
════════════════════════════════════════════════════ */
function showError(msg, duration = 3000) {
  errorMsg.textContent = msg;
  clearTimeout(showError._timer);
  showError._timer = setTimeout(() => { errorMsg.textContent = ""; }, duration);
}

/* ════════════════════════════════════════════════════
   VALIDACIÓN DE ENTRADA
════════════════════════════════════════════════════ */
function validateInput(value, excludeIndex = -1) {
  const trimmed = value.trim();

  if (trimmed === "") {
    return { valid: false, number: null, error: "⚠️ El campo no puede estar vacío." };
  }

  if (!/^-?\d+$/.test(trimmed)) {
    return {
      valid: false,
      number: null,
      error: "⚠️ Solo se permiten números enteros (sin letras ni símbolos).",
    };
  }

  if (excludeIndex === -1 && numbers.length >= MAX_NUMBERS) {
    return {
      valid: false,
      number: null,
      error: `⚠️ Ya alcanzaste el máximo de ${MAX_NUMBERS} números.`,
    };
  }

  return { valid: true, number: parseInt(trimmed, 10), error: "" };
}

/* ════════════════════════════════════════════════════
   INTERFAZ — ACTUALIZACIÓN DE UI
════════════════════════════════════════════════════ */
function updateCounter() {
  const count = numbers.length;
  counter.textContent = `${count} / ${MAX_NUMBERS}`;
  const pct = (count / MAX_NUMBERS) * 100;
  progressBar.style.width = `${pct}%`;
  progressBar.setAttribute("aria-valuenow", count);
  if (count >= MIN_NUMBERS) {
    progressBar.style.background = "linear-gradient(90deg, #43d98e, #6ee7b7)";
  } else {
    progressBar.style.background = "";
  }
}

function updateNumbersPanel() {
  numbersPanel.classList.toggle("d-none", numbers.length === 0);
}

function updateButtons() {
  saveBtn.classList.toggle("d-none", numbers.length < MIN_NUMBERS);
  clearBtn.classList.toggle("d-none", numbers.length === 0);

  if (numbers.length >= MAX_NUMBERS) {
    numberInput.disabled     = true;
    addBtn.disabled          = true;
    numberInput.placeholder  = "Límite alcanzado";
  } else {
    numberInput.disabled     = false;
    addBtn.disabled          = false;
    numberInput.placeholder  = "Escribí un número…";
  }
}

/* ════════════════════════════════════════════════════
   RENDERIZADO DE CHIPS
════════════════════════════════════════════════════ */

/**
 * Re-renderiza toda la grilla de chips desde el array `numbers`.
 * Se llama tras cualquier operación que cambie el array (agregar,
 * editar, borrar) para mantener los índices siempre correctos.
 */
function renderChips() {
  numbersList.innerHTML = "";
  numbers.forEach((num, i) => {
    const chip = document.createElement("div");
    chip.className     = "num-chip";
    chip.dataset.index = i;
    chip.innerHTML = `
      <span class="chip-index">#${i + 1}</span>
      <span class="chip-value">${num}</span>
      <span class="chip-actions">
        <button class="chip-btn chip-edit"  title="Editar"  aria-label="Editar número ${i + 1}">
          <i class="bi bi-pencil-fill"></i>
        </button>
        <button class="chip-btn chip-delete" title="Borrar" aria-label="Borrar número ${i + 1}">
          <i class="bi bi-x-lg"></i>
        </button>
      </span>
    `;
    numbersList.appendChild(chip);
  });
}

/* ════════════════════════════════════════════════════
   LÓGICA PRINCIPAL — AGREGAR NÚMERO
════════════════════════════════════════════════════ */
function addNumber() {
  const { valid, number, error } = validateInput(numberInput.value);

  if (!valid) {
    showError(error);
    numberInput.focus();
    return;
  }

  numbers.push(number);
  renderChips();
  updateCounter();
  updateNumbersPanel();
  updateButtons();

  numberInput.value    = "";
  errorMsg.textContent = "";
  numberInput.focus();
}

/* ════════════════════════════════════════════════════
   EDITAR NÚMERO INDIVIDUAL
════════════════════════════════════════════════════ */

/**
 * Reemplaza el chip en `index` por un input inline para editar el valor.
 * Al confirmar (Enter o clic en ✓) valida y guarda; al cancelar (Esc o ✕)
 * restaura el chip original.
 */
function startEdit(index) {
  const chipEl = numbersList.querySelector(`.num-chip[data-index="${index}"]`);
  if (!chipEl || chipEl.classList.contains("editing")) return;

  const currentValue = numbers[index];
  chipEl.classList.add("editing");

  chipEl.innerHTML = `
    <span class="chip-index">#${index + 1}</span>
    <input
      class="chip-input"
      type="text"
      value="${currentValue}"
      maxlength="20"
      inputmode="numeric"
      aria-label="Editar número ${index + 1}"
      autofocus
    />
    <span class="chip-actions">
      <button class="chip-btn chip-confirm" title="Confirmar" aria-label="Confirmar edición">
        <i class="bi bi-check-lg"></i>
      </button>
      <button class="chip-btn chip-cancel"  title="Cancelar"  aria-label="Cancelar edición">
        <i class="bi bi-x-lg"></i>
      </button>
    </span>
  `;

  const input = chipEl.querySelector(".chip-input");
  input.focus();
  input.select();

  // Filtro en tiempo real dentro del chip
  input.addEventListener("input", () => {
    const cleaned    = input.value.replace(/[^0-9-]/g, "");
    const normalized = cleaned.replace(/(?!^)-/g, "");
    if (input.value !== normalized) input.value = normalized;
  });

  // Confirmar con Enter, cancelar con Escape
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter")  { e.preventDefault(); confirmEdit(index, input.value); }
    if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
  });

  chipEl.querySelector(".chip-confirm").addEventListener("click", () => confirmEdit(index, input.value));
  chipEl.querySelector(".chip-cancel").addEventListener("click",  () => cancelEdit());
}

function confirmEdit(index, rawValue) {
  const { valid, number, error } = validateInput(rawValue, index);
  if (!valid) {
    showError(error);
    // Vuelve a enfocar el input del chip
    const inp = numbersList.querySelector(".chip-input");
    if (inp) inp.focus();
    return;
  }

  numbers[index]       = number;
  errorMsg.textContent = "";
  renderChips();
  updateCounter();
}

function cancelEdit() {
  renderChips();
}

/* ════════════════════════════════════════════════════
   BORRAR NÚMERO INDIVIDUAL
════════════════════════════════════════════════════ */

/**
 * Elimina el número en `index`, re-renderiza los chips
 * y actualiza toda la UI.
 */
function deleteNumber(index) {
  numbers.splice(index, 1);
  renderChips();
  updateCounter();
  updateNumbersPanel();
  updateButtons();
}

/* ════════════════════════════════════════════════════
   DELEGACIÓN DE EVENTOS — CHIPS
════════════════════════════════════════════════════ */

/**
 * Delegación única sobre la grilla de chips.
 * Detecta clics en botones de editar y borrar.
 */
numbersList.addEventListener("click", (e) => {
  // Botón editar
  const editBtn = e.target.closest(".chip-edit");
  if (editBtn) {
    const chip  = editBtn.closest(".num-chip");
    const index = parseInt(chip.dataset.index, 10);
    startEdit(index);
    return;
  }

  // Botón borrar
  const deleteBtn = e.target.closest(".chip-delete");
  if (deleteBtn) {
    const chip  = deleteBtn.closest(".num-chip");
    const index = parseInt(chip.dataset.index, 10);
    deleteNumber(index);
  }
});

/* ════════════════════════════════════════════════════
   GENERACIÓN Y DESCARGA DEL ARCHIVO .TXT
════════════════════════════════════════════════════ */
function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  );
}

function buildFileContent(nums, ts) {
  const sep = "─".repeat(40);
  return [
    "NumReg — Registro de Números",
    sep,
    `Fecha y hora : ${ts.replace(/_/g, " ").replace(/-/g, (m, i) => i > 9 ? ":" : "-")}`,
    `Cantidad     : ${nums.length} número(s)`,
    sep,
    "",
    nums.map((n, i) => `  #${String(i + 1).padStart(2, "0")}  →  ${n}`).join("\n"),
    "",
    sep,
    `Suma         : ${nums.reduce((a, b) => a + b, 0)}`,
    `Promedio     : ${(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)}`,
    `Mínimo       : ${Math.min(...nums)}`,
    `Máximo       : ${Math.max(...nums)}`,
    sep,
  ].join("\n");
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ════════════════════════════════════════════════════
   HISTORIAL DE ARCHIVOS
════════════════════════════════════════════════════ */
function addToHistory(filename, content, ts) {
  fileHistory.push({ filename, content, ts });
  historyPanel.classList.remove("d-none");

  const li = document.createElement("li");
  li.className = "history-item";
  li.innerHTML = `
    <div>
      <div class="file-name">
        <i class="bi bi-file-earmark-text me-1"></i>${filename}
      </div>
      <small class="text-muted">${ts} — ${fileHistory[fileHistory.length - 1].content.split("\n").filter(l => l.includes("→")).length} número(s)</small>
    </div>
    <button class="btn-download-hist" data-index="${fileHistory.length - 1}">
      <i class="bi bi-download me-1"></i>Descargar
    </button>
  `;
  historyList.appendChild(li);
}

/* ════════════════════════════════════════════════════
   GUARDAR Y DESCARGAR
════════════════════════════════════════════════════ */

/**
 * 1. Genera el contenido del .txt.
 * 2. Lo descarga en el navegador (Blob).
 * 3. Lo envía al servidor para que Node.js lo guarde en disco
 *    dentro de la carpeta "archivos_guardados/" del proyecto,
 *    usando el módulo `fs` de Node.js (ver server.js → POST /api/save).
 */
async function saveAndDownload() {
  if (numbers.length < MIN_NUMBERS) {
    showError(`⚠️ Necesitás al menos ${MIN_NUMBERS} números para guardar.`);
    return;
  }

  const ts       = getTimestamp();
  const filename = `numreg_${ts}.txt`;
  const content  = buildFileContent(numbers, ts);

  // ── 1. Descarga en el navegador ──
  downloadFile(content, filename);

  // ── 2. Guarda en disco vía servidor (Node.js fs.writeFile) ──
  try {
    const response = await fetch("/api/save", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ filename, content }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Guardado en el servidor:", data.path);
    } else {
      console.warn("⚠️ El servidor no pudo guardar el archivo:", data.error);
    }
  } catch (err) {
    // Si el servidor no está corriendo (abrir index.html directo sin Node),
    // la descarga del navegador igual funciona; solo avisamos en consola.
    console.warn("⚠️ No se pudo contactar al servidor para guardar en disco:", err.message);
  }

  // ── 3. Registra en el historial de la sesión ──
  addToHistory(filename, content, ts);
}

/* ════════════════════════════════════════════════════
   LIMPIAR TODO
════════════════════════════════════════════════════ */
function clearAll() {
  numbers = [];
  numbersList.innerHTML = "";
  errorMsg.textContent  = "";
  updateCounter();
  updateNumbersPanel();
  updateButtons();
  numberInput.focus();
}

/* ════════════════════════════════════════════════════
   EVENTOS GLOBALES
════════════════════════════════════════════════════ */
addBtn.addEventListener("click", addNumber);

numberInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); addNumber(); }
});

numberInput.addEventListener("input", () => {
  const cleaned    = numberInput.value.replace(/[^0-9-]/g, "");
  const normalized = cleaned.replace(/(?!^)-/g, "");
  if (numberInput.value !== normalized) {
    numberInput.value = normalized;
    showError("⚠️ Solo se permiten números (sin letras ni símbolos).", 2000);
  }
});

saveBtn.addEventListener("click",  saveAndDownload);
clearBtn.addEventListener("click", clearAll);

historyList.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-download-hist");
  if (!btn) return;
  const item = fileHistory[parseInt(btn.dataset.index, 10)];
  if (item) downloadFile(item.content, item.filename);
});

/* ════════════════════════════════════════════════════
   INICIALIZACIÓN
════════════════════════════════════════════════════ */
updateCounter();
updateButtons();
numberInput.focus();