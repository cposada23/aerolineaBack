const User = require('../../models/Usuario');

module.exports={
    localAuthentication,
    localSingUp

};
function localAuthentication(options, cb) {
    const email = options.email;
    const password = options.password;
    User.findOne({email:email}, function (err, user) {
        if(err){
            console.log("error retornando usuario en loalauth");
            return cb('Error fetching user');
        }
        if(user){
            console.log("Usuario encontrado en localAuthenticate " + JSON.stringify(user));
            if(!user.authenticate(password)){
                console.log("contraseña incorrecta en local authenticate");
                return cb([{"param": "password", "msg":"Contraseña incorrecta"}]);
            }
            return cb(null, user);
        }else if(!user){
            console.log("El email no esta registrado localauthentication" );
            return cb([{"params": "email" , "msg": "El email no esta registrado"}]);
        }

    });
}


function localSingUp(datos, cb) {
    console.log("local singup");
    User.findOne({email: datos.email}, function (err, existinguser) {
        if(err){
            console.log("error retornando usuario en localSinngup");
            return cb('Error fetching user');
        }else if(existinguser){
            console.log("ya existia un usuario con ese email");
            return cb([{"params": "email" , "msg": "El email ya esta registrado"}]);
        }
        var user = new User(datos);
        user.save(function (err, user) {
            if(err){
                console.log("Error guardando el usuario localsingup");
                return callback(err);
            }
            return (cb(null, user));
        });

    });
}