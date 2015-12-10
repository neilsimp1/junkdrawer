var passport = require('passport')
	,LocalStrategy = require('passport-local').Strategy
	,GoogleStrategy = require('passport-google-oauth2').Strategy
	,FacebookStrategy = require('passport-facebook').Strategy
	,TwitterStrategy = require('passport-twitter').Strategy
	,GithubStrategy = require('passport-github2').Strategy
	,config = require('../../protected/jd-config');

var models = require('../models');

passport.serializeUser(function(user, done){
	console.log('serializeUser: ' + user._id);
	done(null, user._id);
});
passport.deserializeUser(function(id, done){
	models.User.findById(id, function(err, user){
		console.log(user);
		if(!err) done(null, user);
		else done(err, null);
	});
});

passport.use(new FacebookStrategy({
		clientID: config.oauth.facebook.clientID,
		clientSecret: config.oauth.facebook.clientSecret,
		callbackURL: config.oauth.facebook.callbackURL
	},
	function(accessToken, refreshToken, profile, done) {
    User.findOne({ oauthID: profile.id }, function(err, user) {
      if(err) {
        console.log(err);  // handle errors!
      }
      if (!err && user !== null) {
        done(null, user);
      } else {
        user = new User({
          oauthID: profile.id,
          name: profile.displayName,
          created: Date.now()
        });
        user.save(function(err) {
          if(err) {
            console.log(err);  // handle errors!
          } else {
            console.log("saving user ...");
            done(null, user);
          }
        });
      }
    });
  }
));

passport.use(new TwitterStrategy({
  consumerKey: config.oauth.twitter.consumerKey,
  consumerSecret: config.oauth.twitter.consumerSecret,
  callbackURL: config.oauth.twitter.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ oauthID: profile.id }, function(err, user) {
      if(err) {
        console.log(err);  // handle errors!
      }
      if (!err && user !== null) {
        done(null, user);
      } else {
        user = new User({
          oauthID: profile.id,
          name: profile.displayName,
          created: Date.now()
        });
        user.save(function(err) {
          if(err) {
            console.log(err);  // handle errors!
          } else {
            console.log("saving user ...");
            done(null, user);
          }
        });
      }
    });
  }
));

passport.use(new GithubStrategy({
  clientID: config.oauth.github.clientID,
  clientSecret: config.oauth.github.clientSecret,
  callbackURL: config.oauth.github.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ oauthID: profile.id }, function(err, user) {
      if(err) {
        console.log(err);  // handle errors!
      }
      if (!err && user !== null) {
        done(null, user);
      } else {
        user = new User({
          oauthID: profile.id,
          name: profile.displayName,
          created: Date.now()
        });
        user.save(function(err) {
          if(err) {
            console.log(err);  // handle errors!
          } else {
            console.log("saving user ...");
            done(null, user);
          }
        });
      }
    });
  }
));

passport.use(new GoogleStrategy({
		clientID: config.oauth.google.clientID
		,clientSecret: config.oauth.google.clientSecret
		,callbackURL: config.oauth.google.callbackURL
	}
	,function(request, accessToken, refreshToken, profile, done){
		var user = {
			oauthID: profile.id
			,username: profile.emails[0].value
			,email: profile.emails[0].value
			,password: null
			,settings: {}//TODO: Get default settings json doc here
		};
		done(null, user);
	}
));