function decodificar(){
    const input = document.getElementById("inputMsg").value;

  // reemplaza cada (...) por su contenido invertido
    const resultado = input.replace(/\(([^()]*)\)/g, (match, contenido) => {
    return contenido.split("").reverse().join("");
    });

    document.getElementById("output").innerHTML = resultado;
}