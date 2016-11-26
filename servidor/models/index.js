'use strict';
const express       = require('express');
const controller    = require('./usuario.controller');
const auth          = require('../auth/services/AuthModule');

var router = express.Router();



router.get('/ciudades', controller.getCiudades);
router.get('/aeropuerto/:ciudad', controller.getAeropuerto);


router.get('/crear' , controller.crear);
router.get('/crear2' , controller.crear2);
router.get('/borrar', controller.borrar);
router.get('/aeropuerto', controller.getAeropuertos);
router.post('/aeropuerto/crear', controller.crearAeropuerto);
router.get('/aeropuerto/:codigo', controller.getAero);
router.get('/vuelo', controller.getVuelos);
router.get('/vuelo/aeropuertoOrigen/:aeropuertoOrigen', controller.getVuelosAeropuertoOrigen);
router.get('/vuelo/ciudadOrigen/:ciudadOrigen', controller.getVuelosCiudadOrigen);
router.get('/vuelo/vuelosOrigenDestino/:ciudadOrigen/:ciudadDestino' , controller.getVuelosCiudadOrigen);
router.post('/tiquete/generar', auth.isAuthenticated, controller.generarTiquete);

module.exports = router;