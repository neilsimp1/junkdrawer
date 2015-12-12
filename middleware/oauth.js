var passport = require('passport')
	,LocalStrategy = require('passport-local').Strategy
	,GoogleStrategy = require('passport-google-oauth2').Strategy
	,FacebookStrategy = require('passport-facebook').Strategy
	,TwitterStrategy = require('passport-twitter').Strategy
	,GithubStrategy = require('passport-github2').Strategy
	,config = require('../../protected/jd-config');

var models = require('../models');

function oauthSuccess(profile, done){
	if(profile.emails){
		var username = profile.emails[0].value;
		var email = profile.emails[0].value;
	}
	else{
		var username = profile.username;
		var email = null;
	}

	var ret = {
		oauthID: profile.id
		,username: username
		,email: email
		,password: null
		,settings: {}//TODO: Get default settings json doc here
	};
	done(null, ret);
}


//serializers
passport.serializeUser(function(user, done){
	//console.log('serializeUser: ' + user._id);
	done(null, user._id);
});
passport.deserializeUser(function(id, done){
	models.User.findById(id, function(err, user){
		//console.log(user);
		if(!err) done(null, user);
		else done(err, null);
	});
});


//		strategies
//google
passport.use(new GoogleStrategy(config.oauth.google, function(request, accessToken, refreshToken, profile, done){
	oauthSuccess(profile, done);
}));

//facebook
passport.use(new FacebookStrategy(config.oauth.facebook, function(accessToken, refreshToken, profile, done){
	oauthSuccess(profile, done);
}));

//twitter
passport.use(new TwitterStrategy(config.oauth.twitter, function(accessToken, refreshToken, profile, done){
	oauthSuccess(profile, done);
}));

//github
passport.use('github', new GithubStrategy(config.oauth.github, function(accessToken, refreshToken, profile, done){
	oauthSuccess(profile, done);
}));