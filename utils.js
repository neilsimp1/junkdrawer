//var debug = require('debug')('junkdrawer');
//var session = require('client-sessions');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var stylus = require('stylus');
var passport = require('passport')
	,LocalStrategy = require('passport-local').Strategy
	,GoogleStrategy = require('passport-google-oauth2').Strategy
	,FacebookStrategy = require('passport-facebook').Strategy
	,TwitterStrategy = require('passport-twitter').Strategy
	,GithubStrategy = require('passport-github2').Strategy;

var models = require('./models')
	,config = require('../protected/jd-config');

//module.exports.session = session;

module.exports.createUserSession = function(req, res, user, callback){
	module.exports.sanitizeUser(user, function(user){
		req.session.user = user;
		req.user = user;
		res.locals.user = user;
		
		typeof callback === 'function' && callback();
	});
};

//module.exports.oauthInit = function(passport, config){
//	passport.serializeUser(function(user, done){
//		console.log('serializeUser: ' + user._id);
//		done(null, user._id);
//	});
//	passport.deserializeUser(function(id, done){
//		models.User.findById(id, function(err, user){
//			console.log(user);
//			if(!err) done(null, user);
//			else done(err, null);
//		});
//	});

//	passport.use(new GoogleStrategy({
//			clientID: config.oauth.google.clientID,
//			clientSecret: config.oauth.google.clientSecret,
//			callbackURL: config.oauth.google.callbackURL
//		}
//		,function(request, accessToken, refreshToken, profile, done){
//			var user = {
//				oauthID: profile.id
//				,username: profile.emails[0].value
//				,email: profile.emails[0].value
//				,password: null
//				,settings: {}//TODO: Get default settings json doc here
//			};
//			done(null, user);
//			//User.findOne({ oauthID: profile.id }, function(err, user){
//			//	if(err){
//			//		console.log(err);  // handle errors!
//			//	}
//			//	if(!err && user !== null){
//			//		done(null, user);
//			//	}
//			//	else{
//			//	user = new User({
//			//		oauthID: profile.id,
//			//		name: profile.displayName,
//			//		created: Date.now()
//			//	});
						
//			//		user.save(function(err) {
//			//	if(err) {
//			//	console.log(err);  // handle errors!
//			//	} else {
//			//	console.log("saving user ...");
//			//	done(null, user);
//			//	}
//			//	});
//			//	}
//			//});

//			//var user = new models.User({
//			//	oauthID: profile.id
//			//	,username: profile.emails[0].value
//			//	,email: profile.emails[0].value
//			//	,password: null
//			//	,settings: {}//TODO: Get default settings json doc here
//			//});

//			//user.save(function(err){
//			//	if(err){//error
//			//		var origin = 'unknown';
//			//		var errMess = 'Something bad happened! Please try again';
//			//		if(err.code === 11000){//error un or email taken
//			//			origin = 'ue';
//			//			message = 'Username or email is already taken, please try another';
//			//		}
//			//		var error = new utils.Error('register', origin, message);
//			//		//res.status(403).json({error: error});
//			//		done(err, null);
//			//	}
//			//	else{//user created
//			//		//done(null, user);
//			//		module.exports.createFolder(req, null, user, 'Home', function(folders){
//			//			user._doc.folders = folders;
//			//			resizeBy.redirect('/',);
//			//			//module.exports.createUserSession(req, res, user, function(){
//			//			//	utils.sanitizeUser(user, function(user){
//			//			//		res.render('main.ejs', {isLoggedIn: true, _csrf: req._csrf, user: user, renderJSON: true}
//			//			//			,function(err, html){
//			//			//				var ret = {
//			//			//					html: html
//			//			//					,user: user
//			//			//				}

//			//			//				res.setHeader('Content-Type', 'application/json');
//			//			//				res.status(200).send(ret);
//			//			//			}
//			//			//		);
//			//			//	});
//			//			//});
//			//		});
//			//	}
//			//});
//		}
//	));
//};

module.exports.Error = function(page, origin, message){
	return {
		page: page
		,origin: origin
		,message: message
	};
};

module.exports.isLoggedIn = function(req){return !!req.user;};

module.exports.createFolder = function(req, res, user, folderName, callback){
	var folder = new models.Folder({
		userid: user._id
		,name: folderName
		,posts: []
	});

	folder.save(function(err){
		if(err){//error
			var origin = 'foldercreation';
			var errMess = 'Folder creation error.';
			var error = new module.exports.Error('register', origin, errMess);
			//res.render('index.ejs', {csrfToken: req.csrfToken(), error: error});
			callback(error, null);
		}
		else{//folder created
			models.Folder.findOne({userid: user._id, name: folderName})
				.populate('userid')
				.exec(function(err, folder){
					if(err){//error
						var origin = 'folderuserlink';
						var errMess = 'Folder > user link creation error.';
						var error = new module.exports.Error('register', origin, errMess);
						//res.render('index.ejs', {csrfToken: req.csrfToken(), error: error})
						callback(error, null);
					}
					else typeof callback === 'function' && callback([folder]);//success
				});
		}
	});
}

module.exports.getFolders = function(req, res, callback){
	models.Folder.find({userid: req.user._id}, '_id name', function(err, folders){
		if(!folders){//error username
			var error = new Error('register', 'finduser', 'Error finding user.');
			res.render('index.ejs', {csrfToken: req.csrfToken(), error: error});
		}
		else typeof callback === 'function' && callback(folders);
	});
}

module.exports.getUser = function(req, res, callback){
	models.User.findOne({username: req.user.username}, '_id username email password settings', function(err, user){
		if(!user){//error username
			var error = new Error('register', 'finduser', 'Error finding user.');
			res.render('index.ejs', {csrfToken: req.csrfToken(), error: error});
		}
		else{
			module.exports.getFolders(req, res, user, function(folders){
				user._doc.folders = folders;
				typeof callback === 'function' && callback(user);
			});
		}
	});
}

//module.exports.sanitizeUser = function(user, callback){
//	if(user._doc.settings) delete user._doc.settings;
//	if(user._doc.password) delete user._doc.password;
	
//	typeof callback === 'function' && callback(user);
//}
module.exports.sanitizeUser = function(user){
	if(user._doc.settings) delete user._doc.settings;
	if(user._doc.password) delete user._doc.password;

	return user;
}

module.exports.getPOSTFiles = function(req){
	
}