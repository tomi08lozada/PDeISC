import http from 'http';
import fs from 'fs';
import url from 'url';

import { suma, resta } from './modulos/calculo.js';
import { obtenerFecha } from './modulos/tiempo.js';
import { mostrarMenu } from './modulos/menu.js';
import { upperCase } from 'upper-case'; // npm install upper-case

// Pruebas
console.log("Suma:", suma(10, 5));
console.log("Resta:", resta(10, 5));
console.log("Fecha:", obtenerFecha());
console.log("Upper:", upperCase("hola mundo"));

http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const ruta = parsedUrl.pathname;

    // punto 3
    console.log("Host:", req.headers.host);
    console.log("Path:", ruta);
    console.log("Query:", parsedUrl.query);

    let archivo = './paginas/pagina.html';

    if (ruta === '/p2') archivo = './paginas/pagina2.html';
    if (ruta === '/p3') archivo = './paginas/pagina3.html';
    if (ruta === '/p4') archivo = './paginas/pagina4.html';
    if (ruta === '/p5') archivo = './paginas/pagina5.html';

    // punto 2
    fs.readFile(archivo, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("Pagina no encontrada");
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(mostrarMenu());
            res.write(data);
            res.end();
        }
    });

}).listen(3060);

console.log("Servidor en http://localhost:3060");