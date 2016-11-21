const mongoose  = require('mongoose');
const crypto = require('crypto');

//Esquema de avion 
const avionSchema = new mongoose.Schema({
    codigo:{tyte:String, required:true},
    numeroPuestos:{type:Number, required:true}
   
}, { timestamps: true });



module.exports = mongoose.model('Aviones', avionSchema);