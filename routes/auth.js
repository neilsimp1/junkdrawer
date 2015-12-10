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


//oauth
//GET /register/google
router.get('/register/google'
	,passport.authenticate('google', {scope: [
		'https://www.googleapis.com/auth/plus.login'
		,'https://www.googleapis.com/auth/plus.profile.emails.read'
	]})
);
//router.get('/register/google/callback'
//	,passport.authenticate('google', function(err, user, info){
//		res.redirect('/');
//	})
//);
//router.get('/register/google/callback', function(req, res, next){
//	passport.authenticate('google', function(err, user, info){
//		res.redirect('/');
//	});
//});
router.get('/register/google/callback', function(req, res, next){
	passport.authenticate('google', function(err, user, info){
		//if(err){return next(err);}
		//if(!user){return res.redirect('/');}

		//// req / res held in closure
		//req.logIn(user, function(err){
		//	if(err){return next(err);}
		//	return res.send(user);
		//});

		if(err){return next(err);}
		if(!user){return res.redirect('/');}

		user = new models.User(user);

		user.save(function(err){
			if(err){//error
				var origin = 'unknown';
				var errMess = 'Something bad happened! Please try again';
				if(err.code === 11000){//error un or email taken
					origin = 'ue';
					message = 'Username or email is already taken, please try another';
				}
				var error = new utils.Error('register', origin, message);
				//res.status(403).json({error: error});
				res.render('index', {_csrf: req._csrf, error: error});
			}
			else{//user created
				utils.createFolder(req, res, user, 'Home', function(folders){
					user._doc.folders = folders;
					//user = utils.sanitizeUser(user);
					//res.render('index.ejs', {isLoggedIn: true, _csrf: req._csrf, user: user, error: error});
					req.login(user, function(err){
						if(err){
							//mysend(res, 500, 'Ups.');
							var asd = 123;
						}
						else{
							//mysend(res, 200, JSON.stringify(user));
							res.redirect('/');
						}
					});
				});
			}
		});
		
	})(req, res, next);
});

//GET login/google
router.get('/login/google'
	,passport.authenticate('google', {scope: [
		'https://www.googleapis.com/auth/plus.login'
		,'https://www.googleapis.com/auth/plus.profile.emails.read'
	]}
));
router.get('/login/google/callback'
	,passport.authenticate('google', {failureRedirect: '/'})
	,function(req, res){
		res.redirect('/account');
	}
);




/////////////////////////
//app.get('/auth/facebook',
//  passport.authenticate('facebook'),
//  function(req, res){});
//app.get('/auth/facebook/callback',
//  passport.authenticate('facebook', { failureRedirect: '/' }),
//  function(req, res) {
//    res.redirect('/account');
//  });

//app.get('/auth/twitter',
//  passport.authenticate('twitter'),
//  function(req, res){});
//app.get('/auth/twitter/callback',
//  passport.authenticate('twitter', { failureRedirect: '/' }),
//  function(req, res) {
//    res.redirect('/account');
//  });

//app.get('/auth/github',
//  passport.authenticate('github'),
//  function(req, res){});
//app.get('/auth/github/callback',
//  passport.authenticate('github', { failureRedirect: '/' }),
//  function(req, res) {
//    res.redirect('/account');
//  });

//app.get('/logout', function(req, res){
//  req.logout();
//  res.redirect('/');
//});
////////////////


//:GET: /logout
router.get('/logout', function(req, res){
	if(req.session) req.session.reset();
	res.redirect('/');
});

module.exports = router;