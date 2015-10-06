var models = require('./models');
var utils = require('./utils');

module.exports.auth = function(req, res, next){
	if(req.session && req.session.user){
		models.User.findOne({
			username: req.session.user.username} 
			,'username data'
			,function(err, user){
				if(user) utils.createUserSession(req, res, user);
				next();
			});
	}
	else next();
};

module.exports.makeCsrf = function(req, res, next){
	req._csrf = req.csrfToken();
	next();
};