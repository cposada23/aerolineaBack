const mongoose  = require('mongoose');
const crypto = require('crypto');

//Esquema de silla 
const puestoPorVueloSchema = new mongoose.Schema({
    
    puesto:{type:Schema.Types.ObjectId, ref:'Puestos'},
    Vuelo:{type:Schema.Types.ObjectId, ref:'Vuelos'},
    disponible:{type:Boolean, default:true}
   
}, { timestamps: true });



module.exports = mongoose.model('PuestosPorVuelos', puestoPorVueloSchema);