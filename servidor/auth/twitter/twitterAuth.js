const requestTokenUrl   = 'https://api.twitter.com/oauth/request_token';
const accessTokenUrl    = 'https://api.twitter.com/oauth/access_token';
const profileUrl        = 'https://api.twitter.com/1.1/users/show.json?screen_name=';
const qs                = require('querystring');

'use strict';
const request           = require('request');

module.exports = {
    twiterAuthentication
};

function twiterAuthentication(req, res, next) {

    if(!req.body.oauth_token || !req.body.oauth_verifier){
        var requestTokenOauth = {
            consumer_key        :process.env.TWITTER_API_KEY,
            consumer_secret     :process.env.TWITTER_API_SECRET,
            callback            : req.body.redirectUri
        };

        request.post({url:requestTokenUrl, oauth: requestTokenOauth}, function (err, response, body) {
            var oauthToken = qs.parse(body);
            res.send(oauthToken);
        });
    }else{
        var accessTokenOauth = {
            consumer_key: process.env.TWITTER_API_KEY,
            consumer_secret:process.env.TWITTER_API_SECRET,
            token:req.body.oauth_token,
            verifier:req.body.oauth_verifier
        };
        request.post({url:accessTokenUrl, oauth:accessTokenOauth}, function (err, response, accessToken) {
            accessToken = qs.parse(accessToken);
            var profileOauth = {
                consumer_key: process.env.TWITTER_API_KEY,
                consumer_secret: process.env.TWITTER_API_SECRET,
                oauth_token: accessToken.oauth_token
            };
            request.get({
                url:profileUrl+accessToken.screen_name,
                oauth: profileOauth,
                json:true
            }, function (err, response, profile) {
                if(err){
                    console.log("Error linea 46 twiterAuth " + JSON.stringify(err));
                    return res.status(500).send(err);
                }
                /*if(response.status!==200){
                    console.log("Error lines 49 twiterAuth " + JSON.stringify(response));
                    return res.status(500).send(response);
                }*/
                console.log("profile de twiter "  + JSON.stringify(profile));
                const user = {
                    profilePicture: profile.profile_image_url.replace('_normal',''),
                    firstName: profile.name,
                    lastName: 'n',
                    profiles:{
                        twitter:profile.id_str
                    },
                    rol:'user',
                    displayName:'',
                    email:'twitter@' + profile.id
                };
                req.authObject = {type:'twitter', user};
                next();
            });
        });


    }
}
