// routes/api.js
// Define las rutas del ABML y autenticación. Todas son POST.

const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

router.post('/registro', scoreController.registro);
router.post('/login', scoreController.login);
router.post('/alta', scoreController.alta);
router.post('/baja', scoreController.baja);
router.post('/modificacion', scoreController.modificacion);
router.post('/listado', scoreController.listado);

module.exports = router;
