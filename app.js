var bodyParser = require('body-parser')
	//,cookieParser = require('cookie-parser')
	,mongoose = require('mongoose')
	,csrf = require('csurf')
	,express = require('express')
	,path = require('path')
	,session = require('client-sessions')
	,passport = require('passport')
	,LocalStrategy = require('passport-local').Strategy
	,GoogleStrategy = require('passport-google-oauth2').Strategy
	,FacebookStrategy = require('passport-facebook').Strategy
	,TwitterStrategy = require('passport-twitter').Strategy
	,GithubStrategy = require('passport-github2').Strategy;


var middleware = require('./middleware/middleware')
	,oauth = require('./middleware/oauth')
	,utils = require('./utils')
	,config = require('../protected/jd-config')

mongoose.connect(config.db.dev.url);

var app = express();
	
//settings and middleware
//app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.use(cookieParser);
app.use(bodyParser.urlencoded({extended: true}));
//app.use(express.methodOverride());
app.use(session({
	cookieName: 'session'
	,secret: 'this is a secret'
	,duration: 30 * 60 * 1000
	,activeDuration: 5 * 60 * 1000
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf());
app.use(middleware.makeCsrf);
app.use(middleware.csrfError);
//app.use(middleware.auth);
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//utils.oauthInit(passport, config);

//routes
app.use(require('./routes/auth'));
app.use(require('./routes/index'));

app.listen(1337);