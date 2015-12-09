//var debug = require('debug')('junkdrawer');
var session = require('client-sessions');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var stylus = require('stylus');
var models = require('./models');

module.exports.session = session;

module.exports.createUserSession = function(req, res, user, callback){
	module.exports.sanitizeUser(user, function(user){
		req.session.user = user;
		req.user = user;
		res.locals.user = user;
		
		typeof callback === 'function' && callback();
	});
};

//module.exports.createApp = function(){
//	mongoose.connect('mongodb://localhost/junkdrawer');

//	var app = express();
	
//	//Settings
//	app.set('view engine', 'ejs');
	
//	//Middleware
//	app.use(bodyParser.urlencoded({extended: true}));
//	app.use(session({
//		cookieName: 'session'
//		,secret: 'keyboard cat'
//		,duration: 30 * 60 * 1000
//		,activeDuration: 5 * 60 * 1000
//	}));
//	app.use(csrf());
//    app.use(middleware.simpleAuth);
//    app.use(express.static(path.join(__dirname, 'public')));
	
//	//Routes
//	app.use(require('./routes/auth'));
//	app.use(require('./routes/index'));
	
//	return app;
//};

module.exports.Error = function(page, origin, message){
	return {
		page: page
		,origin: origin
		,message: message
	};
};

module.exports.isLoggedIn = function(req){return !!req.user;};

module.exports.createFolder = function(req, res, user, folderName, callback){
	var folder = new models.Folder({
		userid: user._id
		,name: folderName
		,posts: []
	});

	folder.save(function(err){
		if(err){//error
			var origin = 'foldercreation';
			var errMess = 'Folder creation error.';
			var error = new module.exports.Error('register', origin, errMess);
			res.render('index.ejs', {csrfToken: req.csrfToken(), error: error});
		}
		else{//folder created
			models.Folder.findOne({userid: user._id, name: folderName})
				.populate('userid')
				.exec(function(err, folder){
					if(err){//error
						var origin = 'folderuserlink';
						var errMess = 'Folder > user link creation error.';
						var error = new module.exports.Error('register', origin, errMess);
						res.render('index.ejs', {csrfToken: req.csrfToken(), error: error})//TODO:change all these error outputs to somethign for ajax
					}
					else typeof callback === 'function' && callback([folder]);//success
				});
		}
	});
}

module.exports.getFolders = function(req, res, user, callback){
	models.Folder.find({userid: req.user._id}, '_id name posts', function(err, folders){
		if(!folders){//error username
			var error = new Error('register', 'finduser', 'Error finding user.');
			res.render('index.ejs', {csrfToken: req.csrfToken(), error: error});
		}
		else typeof callback === 'function' && callback(folders);
	});
}

module.exports.getUser = function(req, res, callback){
	models.User.findOne({username: req.user.username}, '_id username email password settings', function(err, user){
		if(!user){//error username
			var error = new Error('register', 'finduser', 'Error finding user.');
			res.render('index.ejs', {csrfToken: req.csrfToken(), error: error});
		}
		else{
			module.exports.getFolders(req, res, user, function(folders){
				user._doc.folders = folders;
				typeof callback === 'function' && callback(user);
			});
		}
	});
}

module.exports.sanitizeUser = function(user, callback){
	if(user._doc.settings) delete user._doc.settings;
	if(user._doc.password) delete user._doc.password;
	
	typeof callback === 'function' && callback(user);
}

module.exports.getPOSTFiles = function(req){
	
}