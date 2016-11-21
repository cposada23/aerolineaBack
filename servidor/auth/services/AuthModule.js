'use strict';
const User          = require('../../models/Usuario');
const TokenService  = require('./TokenService');
module.exports = {
    createOrRetrieveUser,
    isAuthenticated,
    isAdmin
};

/**
 * Este metodo es responsable de obtener el usuario
 * si no se encuentra ninguno con las credenciales especificadas,
 * se crea un nuevo usuario.
 * @param options
 * @param cb
 */

function createOrRetrieveUser(options, cb) {
    // select the query object based on the auth type


    const query1 = {
        email: options.user.email
    };
    const query2 = {
        [`profiles.${options.type}`]: options.user.profiles[options.type]
    };

    User.findOne(query1, (err, user)=>{
        if(err){
            console.log("error en query 1");
            return cb('Error fetching user');
        }
        if(user) {
            console.log("Usuario",JSON.stringify(user));
            if(user.profiles.hasOwnProperty(options.type)) {
                console.log("si la tiene");
                return cb(null, user);
            }else{
                user.profiles[options.type] = options.user.profiles[options.type];
                user.save(function (err, user) {
                    if(err)return cb("error retornando usuario");
                    console.log("usuario guardado");
                    return cb(null, user);
                });
            }
        }
        else {
            console.log("No se encontro el usuario con el email " + query1.email);
            console.log("creando usuario "+ JSON.stringify(options.user));
            createUser(options.user, cb);
        }
    });


    /*User.findOne(query2, (err, user) => {
        if(err) return cb('Error fetching user');

        // User found, return him to the callback
        if(user) return cb(null, user);

        // No user is found, create new user
        createUser(options.user, cb);
    });*/
}

/**
 * Guarda al nuevo usuario en la base de datos
 * @param user
 * @param cb
 */
function createUser(user, cb) {
    console.log("usuario en create user" +  JSON.stringify(user));
    const newUser = new User(user);

    //newUser.save(cb);
    newUser.save(function (err, user) {
        if(err){
            console.log("error guardando el usuario en create user");
            return cb(err);
        }

        console.log("usuario guardado en create user ");
        return cb(null, user);
    });
}


function isAuthenticated(req, res, next) {

    if (req.isAuthenticated){
        console.log("req.user._id " + req.user);
        return next();
    }
    if (req.xhr){
        return res.status(401).send([{"param": "AUTH", "msg": "No autorizado"}]);
    }
    else {
        return res.status(401).send([{"param": "auth", "msg": "no autorizado"}]);
    }
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated){
        if(req.tokenPayload.rol === 'admin') {
            return next();
        }
        return res.status(401).send([{"param": "AUTH", "msg": "No autorizado"}]);

    }
    if (req.xhr){
        console.log("xhr");
        return res.status(401).send([{"param": "AUTH", "msg": "No autorizado"}]);
    }
    else {
        console.log("else");
        return res.status(401).send([{"param": "auth", "msg": "no autorizado"}]);
    }
}