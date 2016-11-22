const mongoose  = require('mongoose');
var Schema = mongoose.Schema;
//Esquema de usuario 
const vueloSchema = new Schema({
    
    temporada:          {type: Schema.Types.ObjectId, ref:'Temporadas'},
    aeropuertoOrigen:   {type: Schema.Types.ObjectId, ref:'Aeropuertos'},
    aeropuertoDestino:  {type: Schema.Types.ObjectId, ref:'Aeropuertos'},
    precioBase :        {type: Number, required:true},
    avion:              {type: Schema.Types.ObjectId, ref:'Aviones'},
    temporada:          {type: Schema.Types.ObjectId, ref:'Temporadas'},
    fecha:              {type:Date, default:Date.now}
}, { timestamps: true });



module.exports = mongoose.model('Vuelos', vueloSchema);