'use strict';

var path   = require('path');
var config = require('../config/environment');

module.exports = function (app) {


    app.use('/auth',        require('../auth'));
    /*app.use('/universidad', require('../models/universidad'));
    app.use('/facultad',    require('../models/facultad'));
    app.use('/carrera',     require('../models/carrera'));
    app.use('/materia',     require('../models/materia'));
    app.use('/usuario',     require('../models/'));
    */
    app.route('/').get(function (req, res) {
        res.sendFile(path.join(config.root, '/public/index.html'));
    });
};