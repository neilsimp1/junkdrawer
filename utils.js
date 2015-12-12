var favicon = require('serve-favicon');
var logger = require('morgan');
var passport = require('passport')
	,LocalStrategy = require('passport-local').Strategy
	,GoogleStrategy = require('passport-google-oauth2').Strategy
	,FacebookStrategy = require('passport-facebook').Strategy
	,TwitterStrategy = require('passport-twitter').Strategy
	,GithubStrategy = require('passport-github2').Strategy;

var models = require('./models')
	,config = require('../protected/jd-config');

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
	var findBy = req.user.oauthID? {oauthID: req.user.oauthID}: {username: req.user.username};
	models.User.findOne(findBy, '_id username email password settings', function(err, user){
		if(!user){//error username
			var error = new Error('register', 'finduser', 'Error finding user.');
			res.render('index.ejs', {csrfToken: req.csrfToken(), error: error});
		}
		else{
			req.user = user;
			module.exports.getFolders(req, res, function(folders){
				user._doc.folders = folders;
				typeof callback === 'function' && callback(user);
			});
		}
	});
}

module.exports.sanitizeUser = function(user){
	if(user._doc.hasOwnProperty('oauthID')) delete user._doc.oauthID;
	if(user._doc.hasOwnProperty('settings')) delete user._doc.settings;
	if(user._doc.hasOwnProperty('password')) delete user._doc.password;

	return user;
}

module.exports.getPOSTFiles = function(req){
	
}