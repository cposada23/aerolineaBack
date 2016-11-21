const mongoose  = require('mongoose');
const crypto = require('crypto');

//Esquema de usuario 
const userSchema = new mongoose.Schema({
    nombre: String,
    cedula: String,
    tel: String,
    apellidos: String,
    email: { type: String, unique: true ,lowercase: true},
    profilePicture: String,
    hashedPassword:String,
    fechaNacimiento: {type:Date, default: Date.now},
    salt: String,
    rol: {type:String, default:'user'},
    resetToken: String,
   
}, { timestamps: true });

//Virtuals
userSchema.virtual('password').set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
}).get(function () {
    return this._password;
});
/**
 * METODOS PARA EL USUARIO
 * */
userSchema.methods = {

    /**
     * Autenticación
     * @param plainText
     * @returns {boolean}
     */
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;
    },
    /**
     *
     * @returns {string|String|*}
     */
    makeSalt : function () {
        return crypto.randomBytes(16).toString('base64');
    },
    /**
     *
     * @param password
     * @returns {string|*|String}
     */

    encryptPassword: function (password) {
        if(!password || !this.salt) return '   ';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt,10000, 64).toString('base64');
    }


};

module.exports = mongoose.model('Usuarios', userSchema);