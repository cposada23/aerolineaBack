'use strict';

var path   = require('path');
var config = require('../config/environment');

module.exports = function (app) {


    app.use('/auth',        require('../auth'));
    app.use('/usuario',     require('../models/'));
    

    app.route('/').get(function (req, res) {
        res.sendFile(path.join(config.root, '/public/index.html'));
    });
};