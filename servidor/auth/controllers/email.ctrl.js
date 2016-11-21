
const nodemailer    = require('nodemailer');
var   sgTransport   = require('nodemailer-sendgrid-transport');


var from_address = "passalo@suport.com";


// SUBJECT
var subject = "Recuperar contraseña";

// TEXT BODY
var text_body = "Hello,\n\nThis is a test message from SendGrid.    We have sent this to you because you requested a test message be sent from your account.\n\nThis is a link to google.com: http://www.google.com\nThis is a link to apple.com: http://www.apple.com\nThis is a link to sendgrid.com: http://www.sendgrid.com\n\nThank you for reading this test message.\n\nLove,\nYour friends at SendGrid";

var options = {
    auth: {
        api_user: process.env.SENDGRID_USERNAME,
        api_key: process.env.SENDGRID_PASSWORD
    }
};


module.exports={
    sendEmail
};

function sendEmail(data, cb) {


    var transporter = nodemailer.createTransport(sgTransport(options));
    var link = 'http://'+data.host+'#/reset/'+data.token;
    var html_body = "<table style=\"border: solid 1px #000; background-color: #2e2e2e; font-family: verdana, tahoma, sans-serif; color: #fff;\"><tr> <td> <h2>Hola,</h2> <p>Has recibido este e-mail porque has solicitado recuperar la contraseña. Para continuar con el proceso da clic en el siguiente link:  <br/> </p> <a href="+link+ ">Recuperar Contraseña</a> <p>Estamos para servir</p> <p>Tus amigos de passalo</p> <p> <img src=\"http://cdn1.sendgrid.com/images/sendgrid-logo.png\" alt=\"SendGrid!\" /> </p></td> </tr> </table>";
    //var to_s = "cposadaa@gmail.com";
    var to_s = data.email;
    var email = {
        to:         to_s,
        from:       from_address,
        subject:    subject,
        text:       text_body ,
        html:       html_body
    };
    transporter.sendMail(email, function (err) {
        if(err){
            console.log("error en transportersendmail " + err);
            return cb(err);
            //return res.status(400).send([{"param": "transporter", "msg":"Algo salio mal, intente de nuevo mas tarde"}]);
        }
        return cb(null);
        //return res.status(200).send([{"param": "trasnporter", "msg":"Se envio un email a " +user.email+" con instrucciones sobre como recuperar su contraseña"}]);
    });
}

