//crea un array vacio con tres frutas.
function runEj1() {
    const frutas = [];
    frutas.push('Manzana');
    frutas.push('Banana');
    frutas.push('Naranja');
    const out = document.getElementById('output1');
    out.style.display = 'flex';
    out.innerHTML = renderArray(frutas) + `<div class="length-badge">length: ${frutas.length}</div>`;
}
//agrega los nombres a las tres frutas llenando el array
function runEj2() {
    const amigos = [];
    amigos.push('Moli', 'Joaco', 'Mateo');
    const out = document.getElementById('output2');
    out.style.display = 'flex';
    out.innerHTML = renderArray(amigos) + `<div class="length-badge">length: ${amigos.length}</div>`;
}
//pone numeros constantes en el array.
const numerosBase = [10, 25, 30, 45];

//le solicita un numero al ususario.
function runEj3() {
    const input = document.getElementById('nuevo-numero');
    const val = parseInt(input.value);
    if (isNaN(val)) { alert('Ingresá un número válido'); return; }
    const numeros = [...numerosBase];
    const ultimo = numeros[numeros.length - 1];
    const out = document.getElementById('output3');
    out.style.display = 'block';
    if (val > ultimo) {
    numeros.push(val);
    //verifica si el numero ingresado es mayor al ultimo numero.
    out.innerHTML = `<div class="msg-ok">✅ ${val} es mayor que ${ultimo} → push() ejecutado</div>${renderArray(numeros)}<div class="length-badge">length: ${numeros.length}</div>`;
    } else {
    out.innerHTML = `<div class="msg-err">❌ ${val} no es mayor que ${ultimo} → push() no se ejecutó</div>${renderArray(numeros)}`;
    }
}

function renderArray(arr) {
    return `<div class="badges-wrap">${arr.map((item, i) => `<span class="badge-item" style="animation-delay:${i*70}ms"><span class="badge-index">${i}</span>${item}</span>`).join('')}</div>`;
}