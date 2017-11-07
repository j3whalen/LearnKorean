var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var User = require('../models/user');

var Word = require('../models/word');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

//log In
router.get('/login', function(req, res){
	res.render('login');
});

//admin
router.get('/admin', function(req, res){
	res.render('admin');
});

// Register
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	// validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();
	if(errors){
		res.render('register', {
			errors:errors
		});
	}
	else{
		var newUser = new User({
					name: name,
					email:email,
					username: username,
					password: password
				});

				User.createUser(newUser, function(err, user){
					if(err) throw err;
					console.log(user);
				});

				req.flash('success_msg', 'You are registered and can now login');

				res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

	passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}));

	//test below
/*
	router.post('/login',
  passport.authenticate('local'),
  function(req, res) {
		var name = req.user.name;
		var listOfCorrectWords = req.user.listOfCorrectWords;
		var listOfIncorrectWords = req.user.listOfIncorrectWords;

		console.log(name);
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
		res.render('index', {
			name:name,
			listOfCorrectWords: listOfCorrectWords,
			listOfIncorrectWords: listOfIncorrectWords
		});
  });
	*/


router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

// Register
router.post('/admin', function(req, res){
	var english = req.body.english;
	var korean = req.body.korean;
	var category = req.body.category;
	var audio = req.body.audio;
	// validation
	req.checkBody('english', 'English word is required').notEmpty();
	req.checkBody('korean', 'korean word is required').notEmpty();
	req.checkBody('category', 'category is required').notEmpty();
	req.checkBody('audio', 'Audio file is required').notEmpty();

	var errors = req.validationErrors();
	if(errors){
		res.render('admin', {
			errors:errors
		});
	}
	else{
		var newWord = new Word({
					english: english,
					korean: korean,
					category: category,
					audio: audio
				});

				Word.createWord(newWord, function(err, word){
					if(err) throw err;
					console.log(word);
				});

				req.flash('success_msg', 'Word was succesfully saved');

				res.redirect('/users/admin');
	}
});

module.exports = router;
