'use strict';

let bcrypt = require('bcryptjs')
	,express = require('express')
	,ejs = require('ejs');

let models = require('../models')
	,utils = require('../utils');

let router = express.Router();

//GET /
router.get('/', function (req, res){
	let error = req.error;
	if(res.locals.flash.error) error = res.locals.flash.error;

	if(!req.user) res.render('index', {user: null, error: error, action: null, html: null, csrf: req.csrf});
	else{
		req.user = utils.sanitizeUser(req.user);
		if(res.locals.flash.action === 'login' || res.locals.flash.action === 'register'){
			res.render('main', function(err, html){
				res.render('index', {
					isLoggedIn: true
					,user: req.user
					,error: error
					,html: html
					,csrf: req.csrf
				});
			});
		}
		else{
			res.render('index', {
				isLoggedIn: true
				,user: req.user
				,error: error
				,html: null
				,csrf: req.csrf
			});
		}
	}
});

module.exports = router;