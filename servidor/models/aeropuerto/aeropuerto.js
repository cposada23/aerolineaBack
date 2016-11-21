const mongoose  = require('mongoose');
const crypto = require('crypto');

//Esquema de aeropuerto 
const aeropuertoSchema = new mongoose.Schema({
   
   nombre:String,
   codigo:String,
   ciudad:String
   
}, { timestamps: true });



module.exports = mongoose.model('Aeropuertos', aeropuertoSchema);