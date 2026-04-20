import http from 'http';
import fs from 'fs';

import { suma } from './modulos/calculo.js';
import { obtenerFecha } from './modulos/tiempo.js';

http.createServer((req, res) => {

    fs.readFile('./html/punto2.html', 'utf-8', (err, data) => {

        if (err) {
            res.writeHead(500);
            res.end("Error");
        } else {

            //valores en el HTML
            let html = data
                .replace('{{suma}}', suma(5, 5))
                .replace('{{fecha}}', obtenerFecha());

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        }

    });

}).listen(3080);

console.log("Servidor punto 2 en http://localhost:3080");