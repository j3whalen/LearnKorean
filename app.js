var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect('mongodb://admin:admin@ds139446.mlab.com:39446/koreanwebsite');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');



//create instance of express
var app = express();

//set up view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// set the static public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator (Taken from express validator on github)
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root   = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//connect flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');//flashs own error message
  res.locals.user = req.user || null;
  next();
});
var hbs = exphbs.create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    eq: function (value) { return value == 'admin'; }
  }
});
app.use('/', routes);
app.use('/users', users);



// Set Port
app.set('port', (process.env.PORT || 3000));

//start server
app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
