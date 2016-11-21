'use strict';
const request = require('request');

module.exports= {
    googleAuthentication
};

function googleAuthentication(options, cb) {
    const accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    const peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    const params = {
        code:options.code,
        client_id:options.clientId,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:options.redirectUri,
        grant_type:'authorization_code'
    };

    request.post(accessTokenUrl,{json:true, form:params},function (err, response, token) {
        if(err){
            console.log("error linea 21 googleAuth");
            return cb(err);
        }if(response.statusCode!== 200){
            console.log("error linea 24 googleauth");
            return cb('error')
        }
        var accessToken = token.access_token;
        console.log("access token "  + token.access_token);
        var headers = {Authorization:'Bearer ' + accessToken};
        request.get({url:peopleApiUrl, headers:headers, json:true}, function (err, response, profile) {
           if(profile.error){
               console.log("error linea 31 googleauth" + JSON.stringify(profile.error));
               return cb('error google');
           }

           const user = {
               firstName: profile.given_name,
               lastName: profile.family_name || 'N',
               email: profile.email,
               profilePicture: profile.picture.replace('sz=50','sz=200'),
               profiles:{
                   google:profile.sub
               },
               displayName:'',
               rol:'user'
           };
           cb(null,{type:'google',user});
        });

    });
}