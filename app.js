var bodyParser = require('body-parser')
	,mongoose = require('mongoose')
	,csrf = require('csurf')
	,express = require('express')
	,flash = require('connect-flash')
	,path = require('path')
	,session = require('client-sessions')
	,passport = require('passport');

var middleware = require('./middleware/middleware')
	,oauth = require('./middleware/oauth')
	,utils = require('./utils')
	,config = require('../protected/jd-config');

mongoose.connect(config.db.dev.url);

var app = express();


//settings and middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	cookieName: 'session'
	,secret: 'this is a secret'
	,duration: 30 * 60 * 1000
	,activeDuration: 5 * 60 * 1000
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf());
app.use(middleware.makeCsrf);
app.use(middleware.csrfError);
app.use(middleware.setFlash);
app.use(express.static(path.join(__dirname, 'public')));


//routes
//app.use(require('./routes/http'));
app.use(require('./routes/auth'));
app.use(require('./routes/index'));
app.use(require('./routes/post'));
app.use(require('./routes/folder'));


app.listen(1337);