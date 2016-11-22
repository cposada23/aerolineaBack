const mongoose  = require('mongoose');
var Schema = mongoose.Schema;
//Esquema de avion 
const avionSchema = new Schema({
    codigo:{type:String, required:true},
    numeroPuestos:{type:Number, required:true}
   
}, { timestamps: true });



module.exports = mongoose.model('Aviones', avionSchema);