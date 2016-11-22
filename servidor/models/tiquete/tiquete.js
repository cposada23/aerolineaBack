const mongoose  = require('mongoose');
var Schema = mongoose.Schema;
//Esquema de tikete 
const tiketeSchema = new Schema({
   
   vuelo:{type:Schema.Types.ObjectId, ref:'Vuelos'},
   compra:{type:Schema.Types.ObjectId, ref:'Compras'},
   estado: {type:Boolean, default:false}, //False significa que es en estado reserva, no lo han pagado
   puestoPorVuelo:{type:Schema.Types.ObjectId, ref:'PuestosPorVuelos'},
   precio:{type:Number},
   
   
}, { timestamps: true });



module.exports = mongoose.model('Tiketes', tiketeSchema);