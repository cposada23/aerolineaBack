const mongoose  = require('mongoose');
const crypto = require('crypto');

//Esquema de tikete 
const compraSchema = new mongoose.Schema({
   
   usuario:{type:Schema.Types.ObjectId, ref:'Usuarios'},
   valorTotal:{type:Number},
   fecha:{type:Date, default:Date.now},
   estado:{type:Boolean, default:false} //False es resereva
   
   
}, { timestamps: true });



module.exports = mongoose.model('Compras', compraSchema);