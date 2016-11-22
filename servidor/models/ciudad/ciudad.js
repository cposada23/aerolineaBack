const mongoose  = require('mongoose');
var Schema = mongoose.Schema;
//Esquema de tikete 
const ciudadSchema = new Schema({
   
   nombre:{type:String, required:true} //False es resereva
   
   
}, { timestamps: true });



module.exports = mongoose.model('ciudades', ciudadSchema);