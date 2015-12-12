var bcrypt = require('bcryptjs');
var express = require('express');
var ejs = require('ejs');

var models = require('../models');
var utils = require('../utils');

var router = express.Router();

//GET /
router.get('/', function (req, res){
	var error = req.error;
	if(res.locals.flash.error) error = res.locals.flash.error;

	if(!req.user) res.render('index', {_csrf: req._csrf, error: error});
	else{
		utils.getFolders(req, res, function(folders){
			req.user._doc.folders = folders;
			req.user = utils.sanitizeUser(req.user);
			
			if(res.locals.flash.action === 'login' || res.locals.flash.action === 'register'){
				res.render('main', function(err, html){
					res.render('index', {
						isLoggedIn: true
						,html: html
						,user: req.user
						,error: error
						,_csrf: req._csrf
					});
				});
			}
			else{
				res.render('index', {
					isLoggedIn: true
					,user: req.user
					,error: error
					,_csrf: req._csrf
				});
			}
		});
	}
});

module.exports = router;