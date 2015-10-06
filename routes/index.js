var bcrypt = require('bcryptjs');
var express = require('express');
var ejs = require('ejs');

var models = require('../models');
var utils = require('../utils');

var router = express.Router();

//GET: /
router.get('/', function (req, res){
	var isLoggedIn = utils.isLoggedIn(req);
	if(!isLoggedIn) res.render('index', {_csrf: req._csrf, error: req.error});
	else{
		utils.getUser(req, res, function(user){
			var asd = 123;
			utils.sanitizeUser(user, function(user){
				res.render('index', {isLoggedIn: true, _csrf: req._csrf, user: user, error: req.error});
			});
		});	
	}
});

module.exports = router;