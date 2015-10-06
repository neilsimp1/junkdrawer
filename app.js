var bodyParser = require('body-parser')
	,mongoose = require('mongoose')
	,csrf = require('csurf')
	,express = require('express')
	,path = require('path')
	,middleware = require('./middleware')
	,utils = require('./utils');

mongoose.connect('mongodb://localhost/junkdrawer');

var app = express();
	
//Settings
app.set('view engine', 'ejs');
	
//Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(utils.session({
	cookieName: 'session'
	,secret: 'keyboard cat'
	,duration: 30 * 60 * 1000
	,activeDuration: 5 * 60 * 1000
}));
app.use(csrf());
app.use(middleware.makeCsrf);
app.use(middleware.csrfError);
app.use(middleware.auth);
app.use(express.static(path.join(__dirname, 'public')));
	
//Routes
app.use(require('./routes/auth'));
app.use(require('./routes/index'));

app.listen(1337);