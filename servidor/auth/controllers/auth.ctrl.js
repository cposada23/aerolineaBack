'use strict';
const AuthModule    = require('../services/AuthModule');
const Facebook      = require('../facebook/facebookAuth');
const Google        = require('../google/googleAuth');
const Local         = require('../local/localAuth');
const TokenService  = require('../services/TokenService');
//const crypto        = require('crypto');
//const nodemailer    = require('nodemailer');
const jwt           = require('jsonwebtoken');
const Email         = require('./email.ctrl');
const User = require('../../models/Usuario');




module.exports = {
    facebookAuth,
    googleAuth,
    localAuth,
    localsingup,
    retrieveUser,
    generateToken,
    forgot,
    reset
};


/**
 * Autenticación local
 * @param req
 * @param res
 * @param next
 */
function localAuth(req, res, next) {

    req.assert('email', 'El email no es valido ').isEmail();
    req.assert('email', 'Llene el campo del email').notEmpty();
    req.assert('password', 'Ingrese su contraseña').notEmpty();
    req.sanitize('email').normalizeEmail({remove_dots:false});
    var errors = req.validationErrors();
    if(errors){
        console.log("errors local auth" + JSON.stringify(errors));
        return res.status(400).send(errors);
        //return next({status:400,errors:errors});

    }

    const options = {
        password: req.body.password,
        email: req.body.email
    };
    Local.localAuthentication(options, (err, user)=>{
        if(err || !user){
            return res.status(401).send(err);
            //return next({status: 401, err: 'User not found'});
        }
        req.user = user;

        next();
    })
}

/**
 * Loca Singup
 */

function localsingup(req, res,next){
    req.assert('email', 'El email no es valido ').isEmail();
    req.assert('email', 'Llene el campo del email').notEmpty();
    req.assert('nombre', 'Llene el campo del nombre').notEmpty();
    req.assert('apellidos', 'Llene el campo del apellido').notEmpty();
    req.assert('password', 'Ingrese su contraseña').notEmpty();
    req.assert('password', 'La contraseña debe tener al menos 4 caracteres').len(4);
    req.assert('confirm', 'Las contraseñas no coinciden').equals(req.body.password);

    req.sanitize('email').normalizeEmail({remove_dots:false});

    var errors = req.validationErrors();
    if(errors){
        console.log("errors local sigup" + JSON.stringify(errors));
        return res.status(400).send(errors);
    }
    console.log("req.body " + JSON.stringify(req.body));

    var datos = req.body;
    Local.localSingUp(datos, function (err, user) {
        if(err || !user){
            return res.status(400).send(err);
        }
        req.user = user;

        next();
    });

}


/**
 * Social auth
 * @param req
 * @param res
 * @param next
 */
function facebookAuth(req, res, next) {
    const options = {
        code: req.body.code,
        clientId: req.body.clientId,
        redirectUri: req.body.redirectUri
    };

    Facebook.facebookAuthentication(options, (err, response) => {
        if(err){
            return next({err, status: 401});
        }
        req.authObject = response;
        next();
    });
}


function googleAuth(req, res, next) {
    const options = {
        code: req.body.code,
        clientId: req.body.clientId,
        redirectUri: req.body.redirectUri
    };

    Google.googleAuthentication(options,(err,response)=>{
        if(err){
            console.log("Error en google Authentication");
            return next({err, status:401});
        }
        req.authObject = response;
        next();
    });


}


function retrieveUser(req, res, next) {
    if(!req.authObject) {
        return next({status: 401, err: 'User not found'});
    }
    const userToRetrieve = {
        user: req.authObject.user,
        type: req.authObject.type
    };

    AuthModule.createOrRetrieveUser(userToRetrieve, (err, user) => {
        if (err || !user) {
            console.log("Error createOrRetrieve user auth controller")
            return next({status: 401, err: 'Error while fetching user'});
        }
        req.user = user;

        next();
    });
}




/**
 * Recuperar la contraseña en caso de olvidarla
 * @param req
 * @param res
 */
function forgot(req, res) {
    console.log("llame a forgot desde " + req.headers.host);
    req.assert('email','Debe ingresar un email valido').isEmail();
    req.assert('email', 'Debe ingresar su emal').notEmpty();
    req.sanitize('email').normalizeEmail({remove_dots:false});

    var errors = req.validationErrors();
    if(errors){
        console.log("Errores en forgot " + JSON.stringify(errors));
        return res.status(400).send(errors);
    }

    User.findOne({email:req.body.email}, function (err, user) {
        if(err) return res.status(400).send([{"param": "email", "msg":"Algo salio mal intente de nuevo mas tarde"}]);
        if(!user) return res.status(400).send([{"param": "email", "msg":"El email no esta asociado a ninguna cuenta de passalo"}]);
        var u = {
            firstName: user.firstName,
            _id: user._id,

        };
        jwt.sign(u, process.env.TOKEN_SECRET, {
            algorithm: 'HS256',
            expiresIn: 300 // expira  en 5 minutos
        }, function (err, token) {
            console.log("Nueva token en jwtsing" + token );
            user.resetToken = token;
            user.save(function (err, user) {
                if (err) return res.status(400).send([{"param": "transporter", "msg":"Algo salio mal, intente de nuevo mas tarde"}]);
                var data = {
                    token:token,
                    name: user.firstName,
                    email: user.email,
                    host: req.headers.host
                };
                Email.sendEmail(data, function (err) {
                    if(err)return res.status(400).send([{"param": "transporter", "msg":"Algo salio mal, intente de nuevo mas tarde"}]);

                    return res.status(200).send([{"param": "trasnporter", "msg":"Se envio un email a " +user.email+" con instrucciones sobre como recuperar su contraseña"}]);
                });
            });
        });
    });
}


function reset(req, res, next) {
    req.assert('password' , 'a contraseña no puede estar en blanco').notEmpty();
    req.assert('confirm', 'Las contraseñas no coinciden').equals(req.body.password);
    req.assert('password', ' la contraseña debe tener mas de 4 caracteres').len(4);
    req.assert('token', 'No hay token o esta ya vencio').notEmpty();

    var errors = req.validationErrors();

    if (errors){
        console.log("errors en reset");
        return res.status(400).send(errors);
    }
    var id;
    try {
        id  = jwt.verify(req.body.token, process.env.TOKEN_SECRET);
        console.log("id: " + JSON.stringify(id));
        User.findOne({_id:id._id}, function (err, user) {
            if(err)return res.status(401).send([{"params":"User", "msg":"Token invalida o a expirado" }]);
            console.log("usuario encontrado " + user.firstName);
            if(!(user.resetToken===req.body.token)){
                return res.status(401).send([{"params":"User", "msg":"Token invalida o a expirado" }]);
            }
            user.password = req.body.password;
            user.resetToken = undefined;
            user.save(function (err, user) {
                if(err)return res.status(400).send([{"params":"User", "msg":"Algo salio mal, no se pudo cambiar la contraseña" }]);
                return res.status(200).send([{"params":"User", "msg":"Contraseña cambiada exitosamente. Ingrese con su nueva contraseña"}]);
            });

        });
    } catch (err) {
        console.log(err);
        return res.status(401).send([{"param": "token", "msg":"La token expiro, no se pudo cambiar la contaseña"}]);
    }
}

function generateToken(req, res, next) {
    TokenService.createToken({user: req.user}, (err, token) => {
        if(err){
            console.log("error generando token en auth controller");
            return next({status: 401, err: 'User Validation failed'});
        }
        req.generatedToken = token;
        next();
    });
}
