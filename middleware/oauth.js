'use strict';

let passport = require('passport')
	,GoogleStrategy = require('passport-google-oauth2').Strategy
	,FacebookStrategy = require('passport-facebook').Strategy
	,TwitterStrategy = require('passport-twitter').Strategy
	,GithubStrategy = require('passport-github2').Strategy
	,config = require('../../protected/jd-config');

let models = require('../models');

function oauthSuccess(profile, done){
	if(profile.emails){
		var username = profile.emails[0].value;
		var email = profile.emails[0].value;
	}
	else{
		var username = profile.username;
		var email = null;
	}

	let ret = {
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
	done(null, user._id);
});
passport.deserializeUser(function(id, done){
	let getUser = new Promise(function(resolve, reject){
		models.User.findById(id, function(err, user){
			if(err) reject('Error finding user');
			else if(!user) reject();
			else resolve(user);
		});
	});

	getUser.then(function(user){
		let getFolders = new Promise(function(resolve, reject){
			models.Folder.find({userid: id}, '_id, name, active', function(err, folders){
				if(err) reject('Error finding folders');
				else if(!folders) reject();
				else resolve(folders);
			});
		});

		getFolders.then(function(folders){
			user._doc.folders = folders;
			done(null, user);
		})
		.catch(function(err){
			console.error(err);
			done(err, null);
		});
	})
	.catch(function(err){
		console.error(err);
		done(err, null);
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