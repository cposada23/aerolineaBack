const mongoose  = require('mongoose');
var Schema = mongoose.Schema;
//Esquema de tikete 
const compraSchema = new Schema({
   
   usuario:{type:Schema.Types.ObjectId, ref:'Usuarios'},
   valorTotal:{type:Number},
   fecha:{type:Date, default:Date.now},
   estado:{type:Boolean, default:false}, //False es resereva
   qr:{type:String}, 
   descripcion: {type:String}, 
   numeroTiquetes: {type:Number}
   
   
}, { timestamps: true });



module.exports = mongoose.model('Compras', compraSchema);