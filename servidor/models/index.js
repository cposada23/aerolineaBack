'use strict';
const express       = require('express');
const controller    = require('./usuario.controller');
const auth          = require('../auth/services/AuthModule');

var router = express.Router();

/*router.get('/materias/:id',                      auth.isAuthenticated,       controller.materiasSeguidas);
router.get('/mispublicaciones/:page/:first',     auth.isAuthenticated,       controller.misPublicaciones);
*/

module.exports = router;