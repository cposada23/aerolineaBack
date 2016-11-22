const mongoose  = require('mongoose');
var Schema = mongoose.Schema;
//Esquema de silla 
const puestoPorVueloSchema = new Schema({
    
    puesto:{type:Schema.Types.ObjectId, ref:'Puestos'},
    Vuelo:{type:Schema.Types.ObjectId, ref:'Vuelos'},
    disponible:{type:Boolean, default:true}
   
}, { timestamps: true });



module.exports = mongoose.model('PuestosPorVuelos', puestoPorVueloSchema);