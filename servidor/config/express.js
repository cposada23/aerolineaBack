'use strict';

/**
 * Module dependencies.
 */
const express               = require('express');
const compression           = require('compression');
const bodyParser            = require('body-parser');
const logger                = require('morgan');
const errorHandler          = require('errorhandler');
const lusca                 = require('lusca');
const dotenv                = require('dotenv');
const path                  = require('path');
const mongoose              = require('mongoose');
const cors                  = require('cors');
var   expressValidator      = require('express-validator');
const multipartMiddleware   = require('connect-multiparty')();
const TokenService          = require('../auth/services/TokenService');
const config                = require('./environment');

module.exports = function (app) {


    app.set('port', process.env.PORT || 3000);

    app.use(compression());
    app.use(logger('dev'));
    app.use(cors( {
        origin           : '*',
        withCredentials  : false,
        allowedHeaders   : ['Content-Type', 'Authorization','x-forwarded-for', 'x-forwarded-proto','X-Requested-With', 'Accept', 'Origin' ]
    } ));

    /**
     * Init body and cookie inside req
     * */
    app.use(bodyParser.json());
    /**
     * Manejo de errores con express validator
     */

    app.use(expressValidator());

    /**
     * recibir archivos en req.files
     */
    //app.use(multipartMiddleware);
    app.use(bodyParser.urlencoded({extended : true}));



    /**
     * Forzar HTTPS  en heroku
     */
    if(process.env.HEROKU === 'heroku'){
        app.use(function(req, res, next) {
            var protocol = req.get('x-forwarded-proto');
            protocol     == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
        });
    }


    /**
     * Token deserialization,
     * se verifica la existencia de la token y se extrae el payload del usuario
     * El pay load se usará en otras rutas
     */
    app.use((req, res, next) => {
        const token         = new TokenService(req.headers);
        req.isAuthenticated = token.isAuthenticated();
        req.tokenPayload    = token.getPayload();
        req.user            = {
            _id : req.tokenPayload._id
        };
        next();
    });

/*
    app.use(lusca.xframe('SAMEORIGIN'));
    app.use(lusca.xssProtection(true));*/

    /**
     * directorios estaticos
     */
    app.use('/public', express.static(path.join(config.root, '/public')));
    app.use('/bower_components', express.static(path.join(config.root,'/bower_components')));
    app.use('/qrs', express.static(path.join(config.root,'/qrs')));
    //app.use('/node_modules' , express.static(path.join(config.root, '/node_modules')));
    app.use(errorHandler());

};