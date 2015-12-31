'use strict';

let bcrypt = require('bcryptjs')
	,express = require('express')
	,passport = require('passport')
	,GoogleStrategy = require('passport-google-oauth2').Strategy
	,FacebookStrategy = require('passport-facebook').Strategy
	,TwitterStrategy = require('passport-twitter').Strategy
	,GithubStrategy = require('passport-github2').Strategy;

let models = require('../models')
	,utils = require('../utils')
	,config = require('../../protected/jd-config');

let router = express.Router();

function oauthLoginReg(provider, req, res, next){
	let auth = new Promise(function(resolve, reject){
		passport.authenticate(provider, function(err, profile, info){
			if(err) reject(err);
			else if(!profile) reject('No profile found');
			else resolve(profile);
		})(req, res, next);
	});

	auth.then(function(profile){
		req.flash('action', 'register');

		let findUser = new Promise(function(resolve, reject){
			models.User.findOne({oauthID: profile.oauthID}, function(err, user){
				if(err){
					let origin = 'o';
					let message = 'Something bad happened! Please try again';
					req.flash('action', null);
					req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
					reject();
				}
				else resolve(user);
			});
		});

		findUser.then(function(user){
			if(user){//login
				req.user = user;
				req.flash('action');
				req.flash('action', 'login');

				let getFolders = new Promise(function(resolve, reject){
					models.Folder.find({userid: user._id}, '_id name active', function(err, folders){
						if(err){
							let origin = 'f';
							let message = 'Error finding folders';
							req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
							reject('login');
						}
						else if(!folders){
							let origin = 'f';
							let message = 'No folders found';
							req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
							reject('login');
						}
						else resolve(folders);
					});
				});

				getFolders.then(function(folders){
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
				})
				.catch(function(){
					res.redirect('/');
				});

				//models.Folder.find({userid: user._id}, '_id name active', function(err, folders){//get folders
				//	req.user._doc.folders = folders;
				//	req.login(user, function(err){
				//		if(err){
				//			var origin = 'unknown';
				//			var message = 'Something bad happened! Please try again';
				//			console.log(message);
				//			req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
				//			res.redirect('/');
				//		}
				//		res.redirect('/');
				//	});
				//});
			}
			else{//register
				user = new models.User(profile);

				let insertUser = new Promise(function(resolve, reject){
					user.save(function(err, user){
						if(err){//error
							var origin = 'unknown';
							var message = 'Something bad happened! Please try again';
							if(err.code === 11000){//Account already registered, login??? right now, just give error
								origin = 'o';
								message = 'You have already signed up using this ' + provider + ' account';
							}
							console.log(message);
							req.flash('error', new utils.Error('register', origin, message));
							reject('register');
						}
						else resolve(user);
					});
				});

				let insertFolder = new Promise(function(resolve, reject){
					let defaultFolderName = 'Home';
					req.user = user;
					let folder = new models.Folder({
						userid: user._id
						,name: defaultFolderName
					});

					folder.save(function(err, folder){//create default folder
						if(err){//error
							let origin = 'foldercreation';
							let errMess = 'Folder creation error';
							console.log(message);
							req.flash('error', new utils.Error('register', origin, message));
							reject('register');
						}
						else resolve(folder);
					});
				});

				Promise.all([insertUser, insertFolder])
				.then(function(data){
					//let [user, folder] = data; TODO: this won't work here for some reason
					let user = data[0], folder = data[1];
					req.user._doc.folders = [folder];
					req.user = utils.sanitizeUser(req.user);
					req.login(user, function(err){
						if(err){
							let origin = 'unknown';
							let message = 'Something bad happened! Please try again';
							console.log(message);
							req.flash('error', JSON.stringify(new utils.Error('login', origin, message)));
						}
						res.redirect('/');
					});
				})
				.catch(function(action){
					res.redirect('/#' + action);
				});
			}
		})
		.catch(function(action){
			res.redirect('/#' + action);
		});
	})
	.catch(function(err){
		console.log(err);
		res.redirect('/?_=u');//TODO: something here, maybe???
	});
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
			let error = {
				'page': 'login'
				,'origin': 'u'
				,'message': 'Please enter a username'
			};
			return error;
		}
		else if(req.body.password === ''){
			let error = {
				'page': 'login'
				,'origin': 'pw'
				,'message': 'Please enter a password'
			};
			return error;
		}

		return false;
	}

	let error = validateLogin();
	if(error) res.status(500).json({error: error}).end();
	else{
		let getUser = new Promise(function(resolve, reject){
			models.User.findOne({username: req.body.username}, function(err, user){//check for user
				if(err){
					let error = new utils.Error('login', origin, 'Something bad happened! Please try again');
					error.status = 500;
					reject(error);
				}
				else if(!user){//error username
					let error = new utils.Error('login', 'up', 'Invalid username or password');
					error.status = 403;
					reject(error);
				}
				else if(!bcrypt.compareSync(req.body.password, user.password)){//error password
					var error = new utils.Error('login', 'up', 'Invalid username or password');
					error.status = 403;
					reject(error);
				}
				else resolve(user);
			});
		});

		getUser.then(function(user){
			req.user = user;
			let getFolders = new Promise(function(resolve, reject){
				models.Folder.find({userid: req.user._id}, '_id name active', function(err, folders){
					if(err){
						let error = new utils.Error('login', origin, 'Error finding folders');
						error.status = 500;
						reject(error);
					}
					else if(!folders){//no folders found
						let error = new utils.Error('login', 'up', 'No folders found');
						error.status = 403;
						reject(error);
					}
					else resolve(folders);
				});
			});

			getFolders.then(function(folders){
				req.user._doc.folders = folders;
				req.user = utils.sanitizeUser(req.user);
				req.login(user, function(err){
					if(err){
						let origin = 'u';
						let message = 'Something bad happened! Please try again';
						console.log(message);
						let error = new utils.Error('login', origin, message);
						res.status(500).json({error: error}).end();
					}
					else{
						res.render('main.ejs', {user: user, _csrf: req._csrf}
							,function(err, html){
								let ret = {
									html: html
									,user: req.user
									,_csrf: req._csrf
								}

								res.setHeader('Content-Type', 'application/json');
								res.status(200).send(ret);
							}
						);
					}
				});
			})
			.catch(function(error){
				res.status(error.status).json({error: error});
			});
		})
		.catch(function(error){
			res.status(error.status).json({error: error});
		});
	}
});

//POST /register
router.post('/register', function(req, res){
	function validateRegister(){
		if(req.body.username === ''){
			let error = {
				'page': 'register'
				,'origin': 'u'
				,'message': 'Please enter a username'
			};
			return error;
		}
		else if(req.body.email === ''){
			let error = {
				'page': 'register'
				,'origin': 'e'
				,'message': 'Please enter an email'
			};
			return error;
		}
		else if(req.body.password !== req.body.confirmpassword){
			let error = {
				'page': 'register'
				,'origin': 'pw'
				,'message': 'Please confirm your password'
			};
			return error;
		}
		
		return false;
	}
	
	let error = validateRegister();
	if(error) res.status(500).json({error: error}).end();
	else{
		let salt = bcrypt.genSaltSync(10);
		let hash = bcrypt.hashSync(req.body.password, salt);

		let user = new models.User({
			username: req.body.username
			,password: hash
			,email: req.body.email
			,settings: {}//TODO: Get default settings json doc here
		});

		let insertUser = new Promise(function(resolve, reject){
			user.save(function(err, user){
			if(err){
				let origin = 'unknown';
				let errMess = 'Something bad happened! Please try again';
				if(err.code === 11000){//error un or email taken
					origin = 'ue';
					message = 'Username or email is already taken, please try another';
				}
				let error = new utils.Error('register', origin, message);
				reject(error);
			}
			else resolve(user);
		});
		
		insertUser.then(function(user){
			let defaultFolderName = 'Home';
			req.user = user;
			let folder = new models.Folder({
				userid: req.user._id
				,name: defaultFolderName
			});

			let insertFolder = new Promise(function(resolve, reject){
				folder.save(function(err, folder){//create default folder
					if(err){
						let origin = 'foldercreation';
						let errMess = 'Folder creation error.';
						let error = new utils.Error('register', origin, message);
						reject(error);
					}
					else resolve(folder);
				});
			});

			insertFolder.then(function(folder){
				req.user._doc.folders = [{
					_id: folder._id
					,name: defaultFolderName
					,active: true
				}];
				req.user = utils.sanitizeUser(req.user);
				req.login(user, function(err){
					res.render('main.ejs', {user: user, _csrf: req._csrf}
						,function(err, html){
							let ret = {
								html: html
								,user: req.user
								,_csrf: req._csrf
							}

							res.status(200).json(ret).end();
						}
					);
				});
			})
			.catch(function(error){
				res.status(500).json(error).end();
			});
		})
		.catch(function(error){
			res.status(500).json({error: error}).end();
		});
	}

	//function validateRegister(){
	//	if(req.body.username === ''){
	//		let error = {
	//			'page': 'register'
	//			,'origin': 'u'
	//			,'message': 'Please enter a username'
	//		};
	//		return error;
	//	}
	//	else if(req.body.email === ''){
	//		let error = {
	//			'page': 'register'
	//			,'origin': 'e'
	//			,'message': 'Please enter an email'
	//		};
	//		return error;
	//	}
	//	else if(req.body.password !== req.body.confirmpassword){
	//		let error = {
	//			'page': 'register'
	//			,'origin': 'pw'
	//			,'message': 'Please confirm your password'
	//		};
	//		return error;
	//	}
		
	//	return false;
	//}
	
	//let error = validateRegister();
	//if(error) res.status(500).json({error: error}).end();
	//else{
	//	let salt = bcrypt.genSaltSync(10);
	//	let hash = bcrypt.hashSync(req.body.password, salt);

	//	let user = new models.User({
	//		username: req.body.username
	//		,password: hash
	//		,email: req.body.email
	//		,settings: {}//TODO: Get default settings json doc here
	//	});

	//	user.save(function(err, user){
	//		if(err){
	//			let origin = 'unknown';
	//			let errMess = 'Something bad happened! Please try again';
	//			if(err.code === 11000){//error un or email taken
	//				origin = 'ue';
	//				message = 'Username or email is already taken, please try another';
	//			}
	//			let error = new utils.Error('register', origin, message);
	//			res.status(500).json({error: error}).end();
	//		}
	//		else{
	//			let defaultFolderName = 'Home';
	//			req.user = user;
	//			let folder = new models.Folder({
	//				userid: req.user._id
	//				,name: defaultFolderName
	//			});
	//			folder.save(function(err, folder){//create default folder
	//				if(err){//error
	//					let origin = 'foldercreation';
	//					let errMess = 'Folder creation error.';
	//					let error = new utils.Error('register', origin, message);
	//					res.status(500).json(error).end();
	//				}
	//				else{//folder created
	//					req.user._doc.folders = [{
	//						_id: folder._id
	//						,name: defaultFolderName
	//						,active: true
	//					}];
	//					req.user = utils.sanitizeUser(req.user);
	//					req.login(user, function(err){
	//						res.render('main.ejs', {user: user, _csrf: req._csrf}
	//							,function(err, html){
	//								let ret = {
	//									html: html
	//									,user: req.user
	//									,_csrf: req._csrf
	//								}

	//								res.status(200).json(ret).end();
	//							}
	//						);
	//					});
	//				}
	//			});
	//		}
	//	});
	//}
});


//GET /logout
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


module.exports = router;