const mongoose  = require('mongoose');
var Schema = mongoose.Schema;
//Esquema de silla 
const puestoSchema = new Schema({
    numero:{type:String, required:true},
    tipo:{type:String, required:true},
    avion:{type:Schema.Types.ObjectId, ref:'Aviones'}
   
}, { timestamps: true });



module.exports = mongoose.model('Puestos', puestoSchema);