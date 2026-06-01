const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT   = 3000;
const PUBLIC = path.join(__dirname, 'public');
const ASSETS = path.join(__dirname, 'assets');

/* Tipos MIME por extension */
const MIME = {
  '.html' : 'text/html; charset=utf-8',
  '.css'  : 'text/css',
  '.js'   : 'text/javascript',
  '.json' : 'application/json',
  '.png'  : 'image/png',
  '.jpg'  : 'image/jpeg',
  '.jpeg' : 'image/jpeg',
  '.gif'  : 'image/gif',
  '.svg'  : 'image/svg+xml',
  '.webp' : 'image/webp',
  '.ico'  : 'image/x-icon',
  '.mp3'  : 'audio/mpeg',
  '.wav'  : 'audio/wav',
  '.ogg'  : 'audio/ogg',
  '.woff' : 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf'  : 'font/ttf',
};

const server = http.createServer((req, res) => {
  /* Normalizar URL y evitar path traversal */
  let urlPath = req.url.split('?')[0];       
  if (urlPath === '/') urlPath = '/index.html'; 

  /* Buscar primero en /public */
  const fileInPublic = path.normalize(path.join(PUBLIC, urlPath));
  const fileInAssets = path.normalize(path.join(ASSETS, urlPath.replace(/^\/assets/, '')));

  /* bloquear acceso fuera de las carpetas permitidas */
  const inPublic = fileInPublic.startsWith(PUBLIC);
  const inAssets = fileInAssets.startsWith(ASSETS);

  if (!inPublic && !inAssets) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  /* Intentar servir desde /public primero, luego desde /assets */
  const tryFiles = [];
  if (inPublic) tryFiles.push(fileInPublic);
  if (urlPath.startsWith('/assets') && inAssets) tryFiles.push(fileInAssets);

  function serveFile(paths) {
    if (paths.length === 0) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 — Archivo no encontrado: ${urlPath}`);
      return;
    }
    fs.readFile(paths[0], (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          serveFile(paths.slice(1));
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 — Error interno del servidor');
        }
        return;
      }
      const ext      = path.extname(paths[0]).toLowerCase();
      const mimeType = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    });
  }

  serveFile(tryFiles);
});

server.listen(PORT, () => {
  console.log(`\n GUSACAT corriendo en http://localhost:${PORT}\n`);
});