var bcrypt = require('bcryptjs');
var express = require('express');
var ejs = require('ejs');

var models = require('../models');
var utils = require('../utils');

var router = express.Router();

//GET: /
router.get('/', function (req, res){
	//var isLoggedIn = utils.isLoggedIn(req);
	//var csrfToken = req.csrfToken();
	
	//if(isLoggedIn) res.render('index', {isLoggedIn: true, csrfToken: csrfToken, user: utils.getUser(req, res), error: req.error});
	//else res.render('index', {csrfToken: csrfToken, error: req.error});
    
	var isLoggedIn = utils.isLoggedIn(req);
	var csrfToken = req.csrfToken();
	if(!isLoggedIn) res.render('index', {csrfToken: csrfToken, error: req.error});
	else{
		utils.getUser(req, res, function(user){
			var asd = 123;
			utils.sanitizeUser(user, function(user){
				res.render('index', {isLoggedIn: true, csrfToken: csrfToken, user: user, error: req.error});
			});
		});	
	}
});

module.exports = router;