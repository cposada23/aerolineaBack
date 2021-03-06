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
const qr                = require("qr-js");
const fs                = require("fs-extra");
var path                = require("path");
const targetPath        = path.join(__dirname, "../../qrs/");

/*Listar todas las ciudades */
exports.getCiudades = function (req, res) {
    console.log("getciudades");
    ciudad.find(function(error, ciudades){
        if(error)return handleError(res, error);
        return res.status(200).json(ciudades);
        
    });
};


/**
 * Obtener un aeropuerto dada la ciudad **/
exports.getAeropuerto = function (req, res) {
    console.log("get aeropuerto " );
    Aeropuerto.findOne({ciudad:req.params.ciudad}, function(error, aeropuerto) {
        if(error)return handleError(res, error);
        return res.status(200).json(aeropuerto);
    });
}

/**
 * Obtener todos los aeropuertos
 * */
exports.getAeropuertos= function (req, res) {
    Aeropuerto.find(function (error, aeropuertos) {
        if(error)return handleError(res, error);
        return res.status(200).json(aeropuertos);
    });
}

/**
 * Listar todos los vuelos 
 * */
 
exports.getVuelos = function (req, res) {
    Vuelo.find(function(error, vuelos) {
        if(error)return handleError(res, error);
        return res.status(200).json(vuelos);
    });
}

/**
 * Lista de vuelos dada la ciudad de origen */
 
exports.getVuelosCiudadOrigen = function (req, res) {
    Aeropuerto.findOne({ciudad:req.params.ciudadOrigen}, function(error, aeropuertoOrigen) {
        if(error)return handleError(res, error);
        Vuelo.find({aeropuertoOrigen: aeropuertoOrigen},function(error, vuelos) {
            if(error)return handleError(res, error);
            return res.status(200).json(vuelos);
        });
    });
}


/**
 * Lista de vuelos dado el aeropuerto de origen  */
exports.getVuelosAeropuertoOrigen = function (req, res) {
    Vuelo.find({aeropuertoOrigen: req.params.aeropuertoOrigen},function(error, vuelos) {
        if(error)return handleError(res, error);
        return res.status(200).json(vuelos);
    });
    
}

/**
 * Lista de vuelos dada la ciudad de origen y destino  */
 
exports.getVuelosCiudadOrigen = function (req, res) {
    Aeropuerto.findOne({ciudad:req.params.ciudadOrigen}, function(error, aeropuertoOrigen) {
        if(error)return handleError(res, error);
        Aeropuerto.findOne({ciudad:req.params.ciudadDestino}, function(error, aeropuertoDestino) {
            if(error)return handleError(res, error);
            
            Vuelo.find({aeropuertoOrigen:aeropuertoOrigen, aeropuertoDestino:aeropuertoDestino}).populate({path:'aeropuertoOrigen'})
            .populate({path:'aeropuertoDestino'})
            .populate({path:'avion'})
            .populate({path:'temporada'})
            .exec(function (error, vuelos) {
                if(error) return handleError(res, error);
                var disponibles = [];
                var response = [];
                async.each(vuelos, function(vuelo, call) {
                    var v = vuelo;
                    PuestoPorVuelo.count({vuelo: vuelo, disponible: true}, function (error, count) {
                        disponibles.push(count);
                        v.asientos = count;
                        console.log("foofof" + v.asientos);
                        response.push(v);
                        call();
                    });
                }, function(error) {
                    if(error)console.log("erro obteniendo el numero de puestos");
                    return res.status(200).json({vuelos: response});
                });
            });
        });
    });
}


/** Obtiene el numero de puestos disponibles para un vuelo **/
exports.getNumeroPuestos = function (req, res) {
    PuestoPorVuelo.count({vuelo: req.params.vuelo, disponible: true}, function (error, count) {
        if(error)return handleError(res,error);
        return res.status(200).json({disponibles: count});
    });
}

/**
 * async.each(items,
  // 2nd param is the function that each item is passed to
  function(item, callback){
    // Call an asynchronous function, often a save() to DB
    item.someAsyncCall(function (){
      // Async call is done, alert via callback
      callback();
    });
  },
  // 3rd param is the function to call when everything's done
  function(err){
    // All tasks are done now
    doSomethingOnceAllAreDone();
  }
);
*/

exports.generarReserva = function (req, res) {
    var reserva = req.body.reserva;
    var costoTiquete =  reserva.tipo.id==1?reserva.vueloIda.precioBase:reserva.vueloRegreso.precioBase;
    var precio = reserva.tipo.id==1?reserva.vueloIda.precioBase*reserva.numeroTiquetes:(reserva.vueloIda.precioBase + reserva.vueloRegreso.precioBase)*reserva.numeroTiquetes;
    var numeroTiquetes = reserva.numeroTiquetes;
    var numero = reserva.tipo.id==1?reserva.numeroTiquetes:reserva.numeroTiquetes*2;
    var descripcion = "Ciudad de salida, ciudad de llegada Tipo: ";
    descripcion = reserva.tipo.id==1?descripcion + "  ida.":descripcion + " ida y regreso";
    Compra.create({usuario:req.user._id , valorTotal: precio , descripcion: descripcion , numeroTiquetes: numero},function(error, compra) {
        if(error) return handleError(res, error);
        var qrCompra = targetPath + String(compra._id)+'.png';
        qr.saveSync(String(compra._id) + 'usuario: ' + String(req.user._id), qrCompra);
        var ruta = 'https://aerolinea-cposada23.c9users.io/qrs/'+String(compra._id)+'.png';
        compra.qr = ruta;
        compra.save(function (error, compra) {
            if(error)return handleError(res, error);
            if(reserva.tipo.id == 1){ // solo se crea lo de ida
                PuestoPorVuelo.find({disponible:true, vuelo:reserva.vueloIda}).limit(Number(numeroTiquetes)).exec(function (error, puestosIda) {
                    if(error){ return handleError(res, error); }
                    if(puestosIda.length<=0){
                        return handleError(res, "No hay  puestos diponibles");
                    }
                    async.each(puestosIda,function function_name(puesto, call) {
                        Tiquete.create({tipo: 1, vueloIda:reserva.vueloIda, compra: compra,puestoIda: puesto,precio:costoTiquete}, function(error, tiquete) {
                            if (error) call(error);
                            var qrTiquete = targetPath + String(tiquete._id)+'.png';
                            qr.saveSync(String(tiquete._id), qrTiquete);
                            var ruta = 'https://aerolinea-cposada23.c9users.io/qrs/'+String(tiquete._id)+'.png';
                            tiquete.qr = ruta;
                            tiquete.save(function (error) {
                                if(error)call(error);
                                puesto.disponible = false;
                                puesto.save(function (error) {
                                    if(error) call(error);
                                    call();
                                });
                            });
                        });
                    },function(error) { // se crearo todos los tiquetes de ida
                        if (error)return handleError(res, error);
                        return res.status(200).json({pu:puestosIda});
                    });
                }); 
            }if(reserva.tipo.id==2){
                PuestoPorVuelo.find({disponible:true, vuelo:reserva.vueloIda}).limit(Number(numeroTiquetes)).exec(function (error, puestosIda) {
                    if(error){
                        return handleError(res, error);
                    }
                    if(puestosIda.length<=0){
                        return handleError(res, "No hay  puestos diponibles");
                    }
                    async.each(puestosIda,function function_name(puesto, call) { //se crean los tiquetes de ida 
                        Tiquete.create({tipo: 1, vueloIda:reserva.vueloIda, compra: compra,puestoIda: puesto,precio:costoTiquete}, function(error, tiquete) {
                            if (error) call(error);
                            var qrTiquete = targetPath + String(tiquete._id)+'.png';
                            qr.saveSync(String(tiquete._id), qrTiquete);
                            var ruta = 'https://aerolinea-cposada23.c9users.io/qrs/'+String(tiquete._id)+'.png';
                            tiquete.qr = ruta;
                            tiquete.save(function (error) {
                                if(error)call(error);
                                puesto.disponible = false;
                                puesto.save(function (error) {
                                    if(error) call(error);
                                    call();
                                });
                            });
                        });
                    },function(error) { // se crearo todos los tiquetes de ida
                        if (error)return handleError(res, error);
                        PuestoPorVuelo.find({disponible:true, vuelo:reserva.vueloRegreso}).limit(Number(numeroTiquetes)).exec(function (error, puestosRegreso) { // se crean todos los tiquetes de regreso
                            if(error){
                                return handleError(res, error);
                            }
                            if(puestosIda.length<=0){
                                return handleError(res, "No hay  puestos diponibles");
                            }
                            async.each(puestosRegreso,function function_name(puesto, call) {
                                Tiquete.create({tipo: 2, vueloRegreso:reserva.vueloRegreso, compra: compra,puestoRegreso: puesto,precio:costoTiquete}, function(error, tiquete) {
                                   if (error) call(error);
                                    var qrTiquete = targetPath + String(tiquete._id)+'.png';
                                    qr.saveSync(String(tiquete._id), qrTiquete);
                                    var ruta = 'https://aerolinea-cposada23.c9users.io/qrs/'+String(tiquete._id)+'.png';
                                    tiquete.qr = ruta;
                                    tiquete.save(function (error) {
                                        if(error)call(error);
                                        puesto.disponible = false;
                                        puesto.save(function (error) {
                                            if(error) call(error);
                                            call();
                                        });
                                    });
                                });
                            },function(error) { // se crearo todos los tiquetes de regreso
                                if (error)return handleError(res, error);
                                return res.status(200).json({pu:puestosIda});
                            });
                        });
                    });
                }); 
                
            }
            
        });
    });
}


exports.misCompras = function (req, res) {
    Compra.find({usuario:req.user._id}, function(error, compras) {
       if(error) return handleError(res, error);
       return res.status(200).json(compras);
    });
}

exports.misTiquetes = function (req, res) {
    Tiquete.find({compra:req.params.compra}).populate({
        path:'vueloIda', 
        populate:[{path:'aeropuertoOrigen', model:'Aeropuertos'},{path:'aeropuertoDestino', model:'Aeropuertos'}]
    }).populate({
        path:'vueloRegreso', 
        populate:[{path:'aeropuertoOrigen', model:'Aeropuertos'},{path:'aeropuertoDestino', model:'Aeropuertos'}]
    }).exec(function (error, tiquetes) {
        if(error) return handleError(res.error);
        if(!tiquetes){
            return res.status(500).json({error:"no se encontraron tiqutes"});
        }
        return res.status(200).json(tiquetes);
    });
    
    
    
    /*Tiquete.find({compra:req.params.compra}, function(error, tiquetes) {
        if(error)return handleError(res,error);
        return res.status(200).json(tiquetes);
    });*/
}

exports.generarTiquete = function (req, res) {
    console.log("reqboyd" + JSON.stringify(req.body));
    return res.status(200).json({hola:'auth'});
}

exports.pagarTiquete = function (req,res) {
    console.log("pagar t")
    
    Tiquete.findOne({_id: req.params.id}, function (error, tiquete) {
        if(error)return handleError(res, error);
        tiquete.estado = true;
        tiquete.save(function (error, tiquete) {
            if(error)return handleError(res, error);
            return res.status(200).json(tiquete);
        });
    });
}

/**
 * nombre:String,
   codigo:String,
   ciudad:{type:Schema.Types.ObjectId, ref:'ciudades'}
   */

exports.crearAeropuerto = function (req, res) {
    console.log("crear aeropuerto");
    req.assert('ciudad', 'se debe especificar la ciudad').notEmpty();
    req.assert('codigo', 'Se debe especifica el codigo').notEmpty();
    req.assert('nombre', 'se debe especificar el nombre').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        console.log("error creando aeropuerto" + JSON.stringify(errors));
        return res.status(400).send(errors);
    }
    Aeropuerto.create({nombre: req.body.nombre, codigo: req.body.codigo, ciudad: req.body.ciudad}, function (error, aeropuerto) {
        if(error) return handleError(res, error);
        return res.status(200).json(aeropuerto);
    });}


/** LLenado de la base de datos **/
exports.borrar = function (req, res) {
    
    ciudad.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("ciudades borradas");
    });
    Compra.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("compras borradas");
    });
    Tiquete.remove({}, function (err) {
        if (err)return handleError(res, err);
       console.log("tiquetes borradas");
    });
    
    Puesto.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("puestos borradas");
    });
    
    PuestoPorVuelo.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("puesto por vuelos borradas");
    });
    
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

    
    Vuelo.remove({}, function (err) {
        if (err)return handleError(res, err);
        console.log("Vuelo borradas");
    });
    
   
    
    
    return res.status(200).json({borrada:'datos'});
};

exports.getAero = function (req, res) {
    
    console.log("get aero " + JSON.stringify(req.params));
    Aeropuerto.findOne({codigo:req.params.codigo}, function(error, aeropuerto) {
        if(error) return handleError(res, error);
        return res.status(200).json(aeropuerto);
    });
    
}


exports.crear = function (req, res) {
    console.log("create");
    
    async.waterfall([
        
        crearAeropuertos,
        crearAviones,
        crearTemporadas,
        //crearVuelos
        
    ], function (err) {
            if(err) return handleError(res, err);
            console.log('Termino de crear');
            return res.status(200).json({data:'Termino de crear'});
        }
    );
};

exports.crear2 = function (req,res) {
    console.log("crear 2");
    async.waterfall([
        crearVuelos,
        crearPuestos, 
        crearPuestosPorVuelo
        
    ], function (err) {
            if(err) return handleError(res, err);
            console.log('Termino de crear');
            return res.status(200).json({data:'Termino de crear'});
        }
    );
    
}



function crearPuestos(callback) {
    console.log("crear Puestos");
    async.waterfall([
        puestosAvion1,
        puestosAvion2
        
    ], function (err) {
            if(err) return callback(err);
            console.log('Termino de crear');
            callback(null);
        }
    );
}


/**
 *  numero:{type:String, required:true},
    tipo:{type:String, required:true},
    avion:{type:Schema.Types.ObjectId, ref:'Aviones'}
    */
function puestosAvion1(callback) {
    
    Avion.findOne({codigo:'a380'}, function (error, avion) {
        var puesto1 = new Puesto({numero:'A1', tipo:'PC' , avion:avion});
        var puesto2 = new Puesto({numero:'A2', tipo:'PC' , avion:avion});
        var puesto3 = new Puesto({numero:'B1', tipo:'G' , avion:avion});
        var puesto4 = new Puesto({numero:'B2', tipo:'G' , avion:avion});
        
        puesto1.save(function (error) {
            if(error) callback(error);
            puesto2.save(function (error) {
                if(error) callback(error);
                puesto3.save(function (error) {
                    if(error) callback(error);
                    puesto4.save(function (error) {
                        if(error) callback(error);
                        callback(null);
                    });
                });
            });
            
        });
    });
    
}

function puestosAvion2(callback) {
    Avion.findOne({codigo:'a320'}, function (error, avion) {
        var puesto1 = new Puesto({numero:'A1', tipo:'PC' , avion:avion});
        var puesto2 = new Puesto({numero:'A2', tipo:'PC' , avion:avion});
        var puesto3 = new Puesto({numero:'B1', tipo:'G' , avion:avion});
        var puesto4 = new Puesto({numero:'B2', tipo:'G' , avion:avion});
        
        puesto1.save(function (error) {
            if(error) callback(error);
            puesto2.save(function (error) {
                if(error) callback(error);
                puesto3.save(function (error) {
                    if(error) callback(error);
                    puesto4.save(function (error) {
                        if(error) callback(error);
                        callback(null);
                    });
                });
            });
            
        });
        
    });
}

/**
 * async.each(items,
  // 2nd param is the function that each item is passed to
  function(item, callback){
    // Call an asynchronous function, often a save() to DB
    item.someAsyncCall(function (){
      // Async call is done, alert via callback
      callback();
    });
  },
  // 3rd param is the function to call when everything's done
  function(err){
    // All tasks are done now
    doSomethingOnceAllAreDone();
  }
);
*/


function crearPuestosPorVuelo(callback) {
    
    console.log("Cear Puestos por vuelo");


    
    async.waterfall([
        
        crearPuestosPorVueloAvion1,
        crearPuestosPorVueloAvion2
        
    ], function (err) {
            if(err) return callback(err);
            console.log('Termino de crear puestos por vuelo');
            callback(null);
        }
    );
    
    
    
}


function crearPuestosPorVueloAvion1(callback){
    
    Avion.findOne({codigo:'a380'}, function (error, avion) {
        if(error)return callback(error);
        Puesto.find({avion:avion}, function (error, puestos) {
            if(error)return callback(error);
            Vuelo.find({avion:avion}, function (error, vuelos) {
                if(error)return callback(error);
                async.each(vuelos, function (vuelo, call) {
                    async.each(puestos, function (puesto, call) {
                        var puestoPorVuelo = new PuestoPorVuelo({puesto:puesto, vuelo:vuelo, diponible:true});
                        puestoPorVuelo.save(function (error) {
                            if(error)(call(error));
                            call();
                        });
                       
                    }, function (error) {
                        if(error){console.log("errorrrrr "); call(error);} 
                    });
                    call();
                },function (error) {
                    if(error){console.log("errorrrrr ");callback(error);} 
                    callback(null);
                })
                
            })
            
        });
    });
}

function crearPuestosPorVueloAvion2(callback){
    
    Avion.findOne({codigo:'a320'}, function (error, avion) {
        if(error)return callback(error);
        Puesto.find({avion:avion}, function (error, puestos) {
            if(error)return callback(error);
            Vuelo.find({avion:avion}, function (error, vuelos) {
                if(error)return callback(error);
                async.each(vuelos, function (vuelo, call) {
                    async.each(puestos, function (puesto, call) {
                        var puestoPorVuelo = new PuestoPorVuelo({puesto:puesto, vuelo:vuelo, diponible:true});
                        puestoPorVuelo.save(function (error) {
                            if(error)(call(error));
                            call();
                        });
                       
                    }, function (error) {
                        if(error){console.log("errorrrrr "); call(error);} 
                    });
                    call();
                },function (error) {
                    if(error){console.log("errorrrrr ");callback(error);} 
                    callback(null);
                })
                
            })
            
        });
    });
}


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


    
    async.waterfall([
        
        vuelo1,
        vuelo2,
        vuelo3,
        vuelo4
        //crearVuelos
        
    ], function (err) {
            if(err) return callback(err);
            console.log('Termino de crear');
            callback(null);
        }
    );
    
    
    
}

function vuelo1(callback) {
    Aeropuerto.findOne({codigo:'SKRG'}, function (error, aeropuerto) {
        if(error){
            console.log("aeropuerto medellin no encontrado");
            callback(error);
        }  
        var aeropuertoOrigen = aeropuerto;
        Aeropuerto.findOne({codigo:'BOG'}, function (error, aeropuerto) {
            if(error){
                callback(error);
                console.log("aeropuerto bogota no encontrado");    
            } 
            var aeropuertoDestino = aeropuerto;
            Temporada.findOne({codigo:'Baja'}, function (error, temporada) {
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
    });
}

function vuelo2(callback) {
    Aeropuerto.findOne({codigo:'BOG'}, function (error, aeropuerto) {
        if(error){
            console.log("aeropuerto bogota no encontrado");
            callback(error);
        }  
        var aeropuertoOrigen = aeropuerto;
        Aeropuerto.findOne({codigo:'SKRG'}, function (error, aeropuerto) {
            if(error){
                callback(error);
                console.log("aeropuerto medellin no encontrado");    
            } 
            var aeropuertoDestino = aeropuerto;
            Temporada.findOne({codigo:'Alta'}, function (error, temporada) {
                if(error){ 
                    console.log("error buscando temporada alta" );
                    callback(error);
                }
                var temporadaAlta = temporada;
                var dt = new Date(2018, 12, 1);
                Avion.findOne({codigo:'a380'}, function (error, avion) {
                    var vuelo = new Vuelo({temporada: temporadaAlta, avion:avion, aeropuertoOrigen: aeropuertoOrigen,aeropuertoDestino:aeropuertoDestino , fecha: dt, precioBase: 2000000 }); 
                    vuelo.save();
                    callback(null);
                });
            });
        });
    });
}

function vuelo3(callback) {
    Aeropuerto.findOne({codigo:'BOG'}, function (error, aeropuerto) {
        if(error){
            console.log("aeropuerto bogota no encontrado");
            callback(error);
        }  
        var aeropuertoOrigen = aeropuerto;
        Aeropuerto.findOne({codigo:'SKRG'}, function (error, aeropuerto) {
            if(error){
                callback(error);
                console.log("aeropuerto medellin no encontrado");    
            } 
            var aeropuertoDestino = aeropuerto;
            Temporada.findOne({codigo:'Alta'}, function (error, temporada) {
                if(error){ 
                    console.log("error buscando temporada alta" );
                    callback(error);
                }
                var temporadaAlta = temporada;
                var dt = new Date(2017, 12, 1);
                Avion.findOne({codigo:'a320'}, function (error, avion) {
                    var vuelo = new Vuelo({temporada: temporadaAlta, avion:avion, aeropuertoOrigen: aeropuertoOrigen,aeropuertoDestino:aeropuertoDestino , fecha: dt, precioBase: 2000000 }); 
                    vuelo.save();
                    callback(null);
                });
            });
        });
    });
}

function vuelo4(callback) {
    Aeropuerto.findOne({codigo:'BOG'}, function (error, aeropuerto) {
        if(error){
            console.log("aeropuerto bogota no encontrado");
            callback(error);
        }  
        var aeropuertoOrigen = aeropuerto;
        Aeropuerto.findOne({codigo:'SKRG'}, function (error, aeropuerto) {
            if(error){
                callback(error);
                console.log("aeropuerto medellin no encontrado");    
            } 
            var aeropuertoDestino = aeropuerto;
            Temporada.findOne({codigo:'Baja'}, function (error, temporada) {
                if(error){ 
                    console.log("error buscando temporada alta" );
                    callback(error);
                }
                var temporadaAlta = temporada;
                var dt = new Date(2018, 8, 1);
                Avion.findOne({codigo:'a320'}, function (error, avion) {
                    var vuelo = new Vuelo({temporada: temporadaAlta, avion:avion, aeropuertoOrigen: aeropuertoOrigen,aeropuertoDestino:aeropuertoDestino , fecha: dt, precioBase: 1000000 }); 
                    vuelo.save();
                    callback(null);
                });
            });
        });
    });
}




function handleError(res, err) {
    return res.status(500).json(err);
};