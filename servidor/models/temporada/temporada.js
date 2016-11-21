const mongoose  = require('mongoose');
const crypto = require('crypto');

//Esquema de aeropuerto 
const temporadaSchema = new mongoose.Schema({
   
  fechaInicio:{type:Date, required:true},
  fechaFin:{type:Date, required:true},
  precioA:Number,
  precioB:Number,
  precioC:Number
  
  
}, { timestamps: true });



module.exports = mongoose.model('Temporadas', temporadaSchema);