'use strict';

let models = require('../models')
	,utils = require('../utils');

module.exports.makeCsrf = function(req, res, next){
	req._csrf = req.csrfToken();
	next();
};

module.exports.csrfError = function(err, req, res, next){
	if(err.code !== 'EBADCSRFTOKEN') return next(err);
	res.status(403);
	res.send('Potential csrf attack');
};

module.exports.setFlash = function(req, res, next){
	res.locals.flash = {
		action: req.flash('action')
		,error: req.flash('error')
	}

	if(res.locals.flash.error.length === 0) res.locals.flash.error = null;
	else res.locals.flash.error = res.locals.flash.error[0];

	if(res.locals.flash.action.length === 0) res.locals.flash.action = null;
	else res.locals.flash.action = res.locals.flash.action[0];

	next();
}