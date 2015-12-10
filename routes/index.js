var bcrypt = require('bcryptjs');
var express = require('express');
var ejs = require('ejs');

var models = require('../models');
var utils = require('../utils');

var router = express.Router();

//GET: /
router.get('/', function (req, res){
	if(!req.user) res.render('index', {_csrf: req._csrf, error: req.error});
	else{
		utils.getFolders(req, res, function(folders){
			req.user._doc.folders = folders;
			req.user = utils.sanitizeUser(req.user);
			res.render('index', {isLoggedIn: true, _csrf: req._csrf, user: req.user, error: req.error});
		});
	}
});

module.exports = router;