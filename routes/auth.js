var bcrypt = require('bcryptjs');
var express = require('express');

var models = require('../models');
var utils = require('../utils');

var router = express.Router();

//POST: /register
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

//POST: /login
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

//:GET: /logout
router.get('/logout', function(req, res){
	if(req.session) req.session.reset();
	res.redirect('/');
});

module.exports = router;