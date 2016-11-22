const mongoose  = require('mongoose');
var Schema = mongoose.Schema;
//Esquema de aeropuerto 
const temporadaSchema = new Schema({
   
  codigo:{type:String, requires:true}, //ALTA, BAJA
  fechaInicio:{type:Date, required:true},
  fechaFin:{type:Date, required:true},
  precioA:Number
  
  
}, { timestamps: true });



module.exports = mongoose.model('Temporadas', temporadaSchema);