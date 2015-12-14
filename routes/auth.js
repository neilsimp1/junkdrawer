var bcrypt = require('bcryptjs')
	,express = require('express')
	,passport = require('passport')
	,GoogleStrategy = require('passport-google-oauth2').Strategy
	,FacebookStrategy = require('passport-facebook').Strategy
	,TwitterStrategy = require('passport-twitter').Strategy
	,GithubStrategy = require('passport-github2').Strategy;

var models = require('../models')
	,utils = require('../utils')
	,config = require('../../protected/jd-config');

var router = express.Router();

function oauthLoginReg(provider, req, res, next){
	passport.authenticate(provider, function(err, profile, info){
		if(err){return res.redirect('/?_=' + err);}
		else if(!profile){return res.redirect('/?_=u');}//TODO: something here, maybe???
		else{
			req.flash('action', 'register');

			models.User.findOne({oauthID: profile.oauthID}, function(err, user){
				if(err){
					var origin = 'o';
					var message = 'Something bad happened! Please try again';
					console.log(message);
					req.flash('action', null);
					req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
					res.redirect('/');
				}
				else if(!err && user !== null){//login
					req.user = user;
					req.flash('action');
					req.flash('action', 'login');				
					utils.getFolders(req, res, function(folders){
						req.user._doc.folders = folders;
						req.login(user, function(err){
							if(err){
								var origin = 'unknown';
								var message = 'Something bad happened! Please try again';
								console.log(message);
								req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
								res.redirect('/');
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
							req.user = user;
							utils.createFolder(req, res, 'Home', function(folders){
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
					});
				}
			});
		}
		
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
	if(error) res.status(500).json({error: error}).end();
	else{
		models.User.findOne({username: req.body.username}, function(err, user){//check for user
			if(err){//error
				var error = new utils.Error('login', origin, 'Something bad happened! Please try again');
				res.status(500).json({error: error}).end();
			}
			else if(!user){//error username
				var error = new utils.Error('login', 'up', 'Invalid username or password');
				res.status(403).json({error: error}).end();
			}
			else{//password
				if(!bcrypt.compareSync(req.body.password, user.password)){//error password
					var error = new utils.Error('login', 'up', 'Invalid username or password');
					res.status(403).json({error: error});
				}
				else{
					req.user = user;
					utils.getFolders(req, res, function(folders){
						req.user._doc.folders = folders;
						req.user = utils.sanitizeUser(req.user);
						req.login(user, function(err){
							if(err){
								var origin = 'u';
								var message = 'Something bad happened! Please try again';
								console.log(message);
								var error = new utils.Error('login', origin, message);
								res.status(500).json({error: error}).end();
							}
							res.render('main.ejs', {user: user, _csrf: req._csrf}
								,function(err, html){
									var ret = {
										html: html
										,user: user
										,_csrf: req._csrf
									}

									res.setHeader('Content-Type', 'application/json');
									res.status(200).send(ret);
								}
							);
						});
					});
				}
			}
		});
	}
});

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
	if(error) res.status(500).json({error: error}).end();
	else{
		var salt = bcrypt.genSaltSync(10);
		var hash = bcrypt.hashSync(req.body.password, salt);

		var user = new models.User({
			username: req.body.username
			,password: hash
			,email: req.body.email
			,settings: {}//TODO: Get default settings json doc here
		});

		user.save(function(err, user){
			if(err){
				var origin = 'unknown';
				var errMess = 'Something bad happened! Please try again';
				if(err.code === 11000){//error un or email taken
					origin = 'ue';
					message = 'Username or email is already taken, please try another';
				}
				var error = new utils.Error('register', origin, message);
				res.status(500).json({error: error}).end();
			}
			req.user = user;
			utils.createFolder(req, res, 'Home', function(folders){
				req.user._doc.folders = folders;
				req.user = utils.sanitizeUser(req.user);
				req.login(user, function(err){
					if(err){
						var origin = 'unknown';
						var message = 'Something bad happened! Please try again';
						console.log(message);
						var error = new utils.Error('register', origin, message);
						res.status(500).json({error: error}).end();
					}
					res.render('main.ejs', {user: user, _csrf: req._csrf}
						,function(err, html){
							var ret = {
								html: html
								,user: user
								,_csrf: req._csrf
							}

							res.setHeader('Content-Type', 'application/json');
							res.status(200).send(ret).end();
						}
					);
				});
			});
		});
	}
});


//GET /logout
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


module.exports = router;