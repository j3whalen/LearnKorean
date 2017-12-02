var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();
var Word = require('../models/word');
mongoose.connect('mongodb://localhost/koreanwebsite');

var db = mongoose.connection;

console.log('index.js');
// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	res.render('index', {
		isAdmin: function(){
			return res.locals.user.username == 'admin';
		}
	});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}
//Functionality for getting database objects to angular
router.get('/test.angular', function(req, res) {
	db.collection("words").findOne({english:"I am very happy to meet you"}, function(err, result) {
		if(err){
			throw err;
		}
		else{
			console.log(result);
			console.log(result.category);
			res.send({
				english: result.english,
				korean: result.korean,
				transliteration: result.transliteration,
				category: result.category
			  });
		}
	});

	});	

	//post request to learn korean
router.post('/learn', function(req, res){
	var category = req.body.category;
	var learnmethod = req.body.learnmethod;

	req.checkBody('category', 'Category is required').notEmpty();
	req.checkBody('learnmethod', 'Learning method is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('index', {
			errors:errors
		});
	}
	else{
		res.render('learn');
		
	}
	
	
});

module.exports = router;
