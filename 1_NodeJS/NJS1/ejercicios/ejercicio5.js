const http = require('http');

const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ejercicio 5</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="container mt-5">
  <h1 class="mb-4">Tabla de Operaciones</h1>
  <table class="table table-bordered table-striped">
    <thead class="table-dark">
      <tr>
        <th>Operacion</th>
        <th>Expresion</th>
        <th>Resultado</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Suma</td><td>5 + 3</td><td>8</td></tr>
      <tr><td>Resta</td><td>8 - 6</td><td>2</td></tr>
      <tr><td>Multiplicacion</td><td>3 * 11</td><td>33</td></tr>
      <tr><td>Division</td><td>30 / 5</td><td>6</td></tr>
    </tbody>
  </table>
</body>
</html>
`;

const servidor = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

servidor.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});