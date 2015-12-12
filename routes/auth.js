var bcrypt = require('bcryptjs');
var express = require('express');
var passport = require('passport')
	,LocalStrategy = require('passport-local').Strategy
	,GoogleStrategy = require('passport-google-oauth2').Strategy
	,FacebookStrategy = require('passport-facebook').Strategy
	,TwitterStrategy = require('passport-twitter').Strategy
	,GithubStrategy = require('passport-github2').Strategy;

var models = require('../models');
var utils = require('../utils');
var config = require('../../protected/jd-config');

var router = express.Router();

//POST /register
router.post('/register', function(req, res){
	function validateRegister(){
		if(req.body.username === ''){
			var error = {
				'page': 'register'
				,'origin': 'u'
				,'message': 'Please enter a username'
			};
			return error;
		}
		else if(req.body.email === ''){
			var error = {
				'page': 'register'
				,'origin': 'e'
				,'message': 'Please enter an email'
			};
			return error;
		}
		else if(req.body.password !== req.body.confirmpassword){
			var error = {
				'page': 'register'
				,'origin': 'pw'
				,'message': 'Please confirm your password'
			};
			return error;
		}
		
		return false;
	}
	
	var error = validateRegister();
	if(error) res.status(403).json({error: error});
	else{
		var salt = bcrypt.genSaltSync(10);
		var hash = bcrypt.hashSync(req.body.password, salt);

		var user = new models.User({
			username: req.body.username
			,email: req.body.email
			,password: hash
			,settings: {}//TODO: Get default settings json doc here
		});

		user.save(function(err){
			if(err){//error
				var origin = 'unknown';
				var errMess = 'Something bad happened! Please try again';
				if(err.code === 11000){//error un or email taken
					origin = 'ue';
					message = 'Username or email is already taken, please try another';
				}
				var error = new utils.Error('register', origin, message);
				res.status(403).json({error: error});
			}
			else{//user created
				utils.createFolder(req, res, user, 'Home', function(folders){
					user._doc.folders = folders;
					utils.createUserSession(req, res, user, function(){
						utils.sanitizeUser(user, function(user){
							res.render('main.ejs', {isLoggedIn: true, _csrf: req._csrf, user: user, renderJSON: true}
								,function(err, html){
									var ret = {
										html: html
										,user: user
									}

									res.setHeader('Content-Type', 'application/json');
									res.status(200).send(ret);
								}
							);
						});
					});
				});
			}
		});
	}
});

//POST /login
router.post('/login', function(req, res){
	function validateLogin(){
		if(req.body.username === ''){
			var error = {
				'page': 'login'
				,'origin': 'u'
				,'message': 'Please enter a username'
			};
			return error;
		}
		else if(req.body.password === ''){
			var error = {
				'page': 'login'
				,'origin': 'pw'
				,'message': 'Please enter a password'
			};
			return error;
		}

		return false;
	}

	var error = validateLogin();
	if(error) res.status(403).json({error: error});
	else{
		models.User.findOne({username: req.body.username}, '_id password', function(err, user){//check for user
			if(!user){//error username
				var error = new utils.Error('login', 'up', 'Invalid username or password');
					res.status(403).json({error: error});
			}
			else{//password
				if(!req.user) req.user = {};
				req.user._id = user._doc._id;
				req.user.username = req.body.username;
				if(bcrypt.compareSync(req.body.password, user.password)){
					utils.getUser(req, res, function(user){
						utils.createUserSession(req, res, user, function(){
							utils.sanitizeUser(user, function(user){
								res.render('main.ejs', {isLoggedIn: true, _csrf: req._csrf, user: user, renderJSON: true},
									function(err, html){
										var ret = {
											html: html
											,user: user
										}

										res.setHeader('Content-Type', 'application/json');
										res.status(200).send(ret);
									}
								);
							});
						});
					});
				}
				else{//error password
					var error = new utils.Error('login', 'up', 'Invalid username or password');
					res.status(403).json({error: error});
				}
			}
		});
	}
});

function oauthLoginReg(provider, req, res, next){
	passport.authenticate(provider, function(err, profile, info){
		if(err){return res.redirect('/?_=' + err);}
		if(!profile){return res.redirect('/?_=u');}//TODO: something here, maybe???
		
		req.flash('action', 'register');

		models.User.findOne({oauthID: profile.oauthID}, function(err, user) {
			if(err){
				var origin = 'o';
				var message = 'Something bad happened! Please try again';
				console.log(message);
				req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
			}
			if(!err && user !== null){//login
				req.user = user;
				utils.getFolders(req, res, function(folders){
					req.user._doc.folders = folders;
					req.login(user, function(err){
						if(err){
							var origin = 'unknown';
							var message = 'Something bad happened! Please try again';
							console.log(message);
							req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
						}
						res.redirect('/');
					});
				});
			}
			else{//register
				user = new models.User(profile);
				user.save(function(err){
					if(err){//error
						var origin = 'unknown';
						var message = 'Something bad happened! Please try again';
						if(err.code === 11000){//Account already registered, login??? right now, just give error
							origin = 'o';
							message = 'You have already signed up using this ' + provider + ' account';
						}
						console.log(message);
						req.flash('error', new utils.Error('register', origin, message));
						res.redirect('/#register');
					}
					else{//user created
						utils.createFolder(req, res, user, 'Home', function(folders){
							user._doc.folders = folders;
							req.login(user, function(err){
								if(err){
									var origin = 'unknown';
									var message = 'Something bad happened! Please try again';
									console.log(message);
									req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
								}
								res.redirect('/');
							});
						});
					}
				});
			}
		});
		
	})(req, res, next);
}

//		oauth
//GET /auth/google
router.get('/auth/google', passport.authenticate('google', {scope: 
	['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
}));
//GET /auth/google/callback
router.get('/auth/google/callback', function(req, res, next){
	oauthLoginReg('google', req, res, next);
});


//GET /auth/facebook
router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));
//GET /auth/facebook/callback
router.get('/auth/facebook/callback', function(req, res, next){
	oauthLoginReg('facebook', req, res, next);
});


//GET /auth/twitter
router.get('/auth/twitter', passport.authenticate('twitter'));
//GET /auth/twitter/callback
router.get('/auth/twitter/callback', function(req, res, next){
	oauthLoginReg('twitter', req, res, next);
});


//GET /auth/github
router.get('/auth/github', passport.authenticate('github', {scope: ['user:email']}));
//GET /auth/github/callback
router.get('/auth/github/callback', function(req, res, next){
	oauthLoginReg('github', req, res, next);
});

////GET login/facebook
//router.get('/login/facebook', passport.authenticate('facebook-login'));
//router.get('/login/facebook/callback', function(req, res, next){
//	passport.authenticate('facebook-login', function(err, user, info){
//		if(err){return res.redirect('/?_=' + err);}
//		if(!user){return res.redirect('/?_=u');}//TODO: something here, maybe???

//		req.flash('action', 'login');

//		models.User.findOne({oauthID: user.oauthID}, 'oauthID', function(err, user){//check for user
//			if(!user){//error oauthID
//				origin = 'o';
//				message = 'You have not signed up using this Facebook account';
//				console.log(message);
//				req.flash('error', new utils.Error('login', origin, message));
//				res.redirect('/#login');
//			}
//			else{
//				req.user = user;
//				utils.getUser(req, res, function(user){
//					req.login(user, function(err){
//						if(err){
//							var origin = 'unknown';
//							var message = 'Something bad happened! Please try again';
//							console.log(message);
//							req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
//						}
//						res.redirect('/');
//					});
//				});
//			}
//		});
		
//	})(req, res, next);
//});
////GET /register/facebook
//router.get('/register/facebook', passport.authenticate('facebook-register', { scope: [ 'email' ]}));
//router.get('/register/facebook/callback', function(req, res, next){
//	passport.authenticate('facebook-register', function(err, user, info){
//		if(err){return res.redirect('/?_=' + err);}
//		if(!user){return res.redirect('/?_=u');}//TODO: something here, maybe???

//		req.flash('action', 'register');

//		user = new models.User(user);

//		user.save(function(err){
//			if(err){//error
//				var origin = 'unknown';
//				var message = 'Something bad happened! Please try again';
//				if(err.code === 11000){//Account already registered, login??? right now, just give error
//					origin = 'o';
//					message = 'You have already signed up using this Facebook account';
//				}
//				console.log(message);
//				req.flash('error', new utils.Error('register', origin, message));
//				res.redirect('/#register');
//			}
//			else{//user created
//				utils.createFolder(req, res, user, 'Home', function(folders){
//					user._doc.folders = folders;
//					req.login(user, function(err){
//						if(err){
//							var origin = 'unknown';
//							var message = 'Something bad happened! Please try again';
//							console.log(message);
//							req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
//						}
//						res.redirect('/');
//					});
//				});
//			}
//		});
		
//	})(req, res, next);
//});


////GET login/twitter
//router.get('/login/twitter', passport.authenticate('twitter-login'));
//router.get('/login/twitter/callback', function(req, res, next){
//	passport.authenticate('twitter-login', function(err, user, info){
//		if(err){return res.redirect('/?_=' + err);}
//		if(!user){return res.redirect('/?_=u');}//TODO: something here, maybe???

//		req.flash('action', 'login');

//		models.User.findOne({oauthID: user.oauthID}, 'oauthID', function(err, user){//check for user
//			if(!user){//error oauthID
//				origin = 'o';
//				message = 'You have not signed up using this Twitter account';
//				console.log(message);
//				req.flash('error', new utils.Error('login', origin, message));
//				res.redirect('/#login');
//			}
//			else{
//				req.user = user;
//				utils.getUser(req, res, function(user){
//					req.login(user, function(err){
//						if(err){
//							var origin = 'unknown';
//							var message = 'Something bad happened! Please try again';
//							console.log(message);
//							req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
//						}
//						res.redirect('/');
//					});
//				});
//			}
//		});
		
//	})(req, res, next);
//});
////GET /register/twitter
//router.get('/register/twitter', passport.authenticate('twitter-register'));
//router.get('/register/twitter/callback', function(req, res, next){
//	passport.authenticate('twitter-register', function(err, user, info){
//		if(err){return res.redirect('/?_=' + err);}
//		if(!user){return res.redirect('/?_=u');}//TODO: something here, maybe???

//		req.flash('action', 'register');

//		user = new models.User(user);

//		user.save(function(err){
//			if(err){//error
//				var origin = 'unknown';
//				var message = 'Something bad happened! Please try again';
//				if(err.code === 11000){//Account already registered, login??? right now, just give error
//					origin = 'o';
//					message = 'You have already signed up using this Twitter account';
//				}
//				console.log(message);
//				req.flash('error', new utils.Error('register', origin, message));
//				res.redirect('/#register');
//			}
//			else{//user created
//				utils.createFolder(req, res, user, 'Home', function(folders){
//					user._doc.folders = folders;
//					req.login(user, function(err){
//						if(err){
//							var origin = 'unknown';
//							var message = 'Something bad happened! Please try again';
//							console.log(message);
//							req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
//						}
//						res.redirect('/');
//					});
//				});
//			}
//		});
		
//	})(req, res, next);
//});


////GET login/github
//router.get('/login/github', function(req, res, next){
//	req.flash('action__', 'login')
//	}, passport.authenticate('github'));
//router.get('/auth/github/callback', function(req, res, next){
//	passport.authenticate('github', function(err, user, info){
//		if(err){return res.redirect('/?_=' + err);}
//		if(!user){return res.redirect('/?_=u');}//TODO: something here, maybe???
//		var asd = req.flash('action__');
//		//req.flash('action', 'login');

//		models.User.findOne({oauthID: user.oauthID}, 'oauthID', function(err, user){//check for user
//			if(!user){//error oauthID
//				origin = 'o';
//				message = 'You have not signed up using this Github account';
//				console.log(message);
//				req.flash('error', new utils.Error('login', origin, message));
//				res.redirect('/#login');
//			}
//			else{
//				req.user = user;
//				utils.getUser(req, res, function(user){
//					req.login(user, function(err){
//						if(err){
//							var origin = 'unknown';
//							var message = 'Something bad happened! Please try again';
//							console.log(message);
//							req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
//						}
//						res.redirect('/');
//					});
//				});
//			}
//		});
		
//	})(req, res, next);
//});

//////GET login/github
////router.get('/login/github', passport.authenticate('github-login'));
////router.get('/login/github/callback', function(req, res, next){
////	passport.authenticate('github-login', function(err, user, info){
////		if(err){return res.redirect('/?_=' + err);}
////		if(!user){return res.redirect('/?_=u');}//TODO: something here, maybe???

////		req.flash('action', 'login');

////		models.User.findOne({oauthID: user.oauthID}, 'oauthID', function(err, user){//check for user
////			if(!user){//error oauthID
////				origin = 'o';
////				message = 'You have not signed up using this Github account';
////				console.log(message);
////				req.flash('error', new utils.Error('login', origin, message));
////				res.redirect('/#login');
////			}
////			else{
////				req.user = user;
////				utils.getUser(req, res, function(user){
////					req.login(user, function(err){
////						if(err){
////							var origin = 'unknown';
////							var message = 'Something bad happened! Please try again';
////							console.log(message);
////							req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
////						}
////						res.redirect('/');
////					});
////				});
////			}
////		});
		
////	})(req, res, next);
////});
//////GET /register/github
////router.get('/register/github', passport.authenticate('github-register'));
////router.get('/register/github/callback', function(req, res, next){
////	passport.authenticate('github-register', function(err, user, info){
////		if(err){return res.redirect('/?_=' + err);}
////		if(!user){return res.redirect('/?_=u');}//TODO: something here, maybe???

////		req.flash('action', 'register');

////		user = new models.User(user);

////		user.save(function(err){
////			if(err){//error
////				var origin = 'unknown';
////				var message = 'Something bad happened! Please try again';
////				if(err.code === 11000){//Account already registered, login??? right now, just give error
////					origin = 'o';
////					message = 'You have already signed up using this Github account';
////				}
////				console.log(message);
////				req.flash('error', new utils.Error('register', origin, message));
////				res.redirect('/#register');
////			}
////			else{//user created
////				utils.createFolder(req, res, user, 'Home', function(folders){
////					user._doc.folders = folders;
////					req.login(user, function(err){
////						if(err){
////							var origin = 'unknown';
////							var message = 'Something bad happened! Please try again';
////							console.log(message);
////							req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
////						}
////						res.redirect('/');
////					});
////				});
////			}
////		});
		
////	})(req, res, next);
////});


//GET /logout
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;