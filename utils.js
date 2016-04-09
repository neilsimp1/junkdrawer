'use strict';

module.exports.Error = function(page, origin, message){
	return {
		page: page
		,origin: origin
		,message: message
	};
};

module.exports.sanitizeUser = function(user){
	delete user._doc.oauthID;
	delete user._doc.settings;
	delete user._doc.password;
	delete user._doc.__v;
}

module.exports.getPOSTFiles = function(req){
	
}