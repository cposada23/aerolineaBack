'use strict';

/**
 * Module dependencies.
 */
const express       = require('express');
const compression   = require('compression');
const dotenv        = require('dotenv');
const path          = require('path');
const mongoose      = require('mongoose');


/**
 * Cargar las variables de entorno del archivo .env, donde estan las keys y contraseñas
 */
dotenv.load({ path: 'servidor/.env' });

/**
 * Configuración de la app
 */
const config        = require('./config/environment');

/**
 * Crear el servidor express
 */
const app = express();

/**
 * Conectar a MongoDB.
 *
 *
 */
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
mongoose.connect(process.env.MONGODB_URI, options);
mongoose.connection.on('error', (error) => {
    //console.error('MongoDB Connection Error.' + error);
});

/**
 * COnfiguracion de express
 */
require('./config/express')(app);
/**
 * routes
 */
require('./endPoints/routes')(app);



app.listen(app.get('port'), () => {
    console.log(`Servidor express escuchado en el puerto ${app.get('port')} en ${app.get('env')} mode`);
});

module.exports = app;


