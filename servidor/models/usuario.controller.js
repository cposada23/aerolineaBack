'use strict';

const User              = require('./Usuario');
const Compra            = require('./compra/compra.js');
const Tiquete           = require('./tiquete/tiquete.js');
const Puesto            = require('./puesto/puesto');
const PuestoPorVuelo    = require("./puesto/PuestoPorVuelo");
const Aeropuerto        = require("./aeropuerto/aeropuerto");
const Avion             = require("./avion/avion");
const Vuelo             = require("./vuelo/vuelo");
const Temporada         = require("./temporada/temporada");
const ciudad            = require("./ciudad/ciudad");
const async             = require("async");

exports.borrar = function (req, res) {
    
    ciudad.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("ciudades borradas");
    });
    /*Compra.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("ciudades borradas");
    });
    */
    /*
    Tiquete.remove({}, function (err) {
        if (err)return handleError(res, err);
       console.log("ciudades borradas");
    });
    */
    /*
    Puesto.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("puestos borradas");
    });
    
    PuestoPorVuelo.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("puesto por vuelos borradas");
    });
    ¨*/
    Aeropuerto.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("aeropuerto borradas");
    });
     Avion.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("Avion borradas");
    });
     Temporada.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("Temporada borradas");
    });
    /*
   
    
    Vuelo.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("Vuelo borradas");
    });
    
   
    */
    
    return res.status(200).json({borrada:'datos'});
};


exports.crear = function (req, res) {
    console.log("create");
    
    async.waterfall([
        
        crearAeropuertos,
        crearAviones,
        crearTemporadas,
        crearVuelos
        
    ], function (err) {
            if(err) return handleError(res, err);
            console.log('Termino de crear');
            return res.status(200).json({data:'Termino de crear'});
        }
    );
};

function crearAeropuertos(callback){
    
        console.log("crear aeropuertos");
        var medellin    = new ciudad({ nombre: 'Medellin' });
        var bogota      = new ciudad({ nombre: 'Bogota' });
      
        medellin.save(function (err, medellin) {
            var aeropuertoJoseMaria = new Aeropuerto({nombre:'Jose Maria Cordova', codigo:'SKRG', ciudad: medellin});
            aeropuertoJoseMaria.save();
            
        });
        bogota.save(function(err, bogota){
            var elDorado = new Aeropuerto({nombre:'El Dorado', codigo: 'BOG', ciudad: bogota});
            elDorado.save();
            
        });
        callback (null);
}

function crearAviones( callback){
    console.log("crear aviones");
    var avion1 = new Avion({codigo:'a380', numeroPuestos:4});
    avion1.save();
    var avion2 = new Avion({codigo:'a320', numeroPuestos:4});
    avion2.save();
    callback (null );
}



function crearTemporadas(callback) {
    console.log("crear temporadas");
    var Ia = new Date(2017, 1, 1);
    var Fa = new Date(2017, 5, 30);
    var temporadaAlta = new Temporada({codigo:'Alta', fechaInicio:Ia, fechaFin: Fa,precioA:0.2 });
    temporadaAlta.save();
    var Ib = new Date(2017, 6, 1);
    var Fb = new Date(2017, 12, 30);
    var temporadaBaja = new Temporada({codigo:'Baja', fechaInicio:Ib, fechaFin: Fb,precioA:0.05 });
    temporadaBaja.save();
    callback (null);
}


function crearVuelos(callback) {
    console.log("Cear Vuelos");
    Aeropuerto.findOne({codigo:'SKRG'}, function (error, aeropuerto) {
        if(error){
            console.log("error buscando aeropuerto");
            callback(error);
        }
        console.log(JSON.stringify(aeropuerto));
        callback(null);
    });
    
    /*
    Aeropuerto.findOne({codigo:'SKRG'}, function (error, aeropuerto) {
        if(error){
            console.log("aeropuerto medellin no encontrado");
            callback(error);
        }  
        console.log(aeropuerto);
        var aeropuertoOrigen = aeropuerto;
        Aeropuerto.findOne({codigo:'BOG'}, function (error, aeropuerto) {
            if(error){
                callback(error);
                console.log("aeropuerto bogota no encontrado");    
            } 
            var aeropuertoDestino = aeropuerto;
            Temporada.findOne({codigo:'baja'}, function (error, temporada) {
                if(error){
                    console.log("error buscando temporada" );
                    callback(error);
                }
                var temporadaBaja = temporada;
                var dt = new Date(2017, 6, 1);
                Avion.findOne({codigo:'a380'}, function (error, avion) {
                    var vuelo = new Vuelo({temporada: temporadaBaja, avion:avion, aeropuertoOrigen: aeropuertoOrigen,aeropuertoDestino:aeropuertoDestino , fecha: dt, precioBase: 1000000 }); 
                    vuelo.save();
                    callback(null);
                });
            });
        });
    });*/
}


function handleError(res, err) {
    return res.status(500).json(err);
};