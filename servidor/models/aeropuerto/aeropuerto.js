const mongoose  = require('mongoose');
var Schema = mongoose.Schema;
//Esquema de aeropuerto 
const aeropuertoSchema = new Schema({
   
   nombre:String,
   codigo:String,
   ciudad:String
   
}, { timestamps: true });



module.exports = mongoose.model('Aeropuertos', aeropuertoSchema);