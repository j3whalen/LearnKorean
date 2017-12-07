var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();
var Word = require('../models/word');
mongoose.connect('mongodb://localhost/koreanwebsite');

var db = mongoose.connection;

console.log('index.js');
// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
	db.collection("users").findOne({
		username: req.user.username
	}, function (err, result){
		if(result.listOfCorrectWords.length !== 0){
			var incorrectwords = JSON.parse(result.listOfIncorrectWords);
			var correctwords = JSON.parse(result.listOfCorrectWords);
			console.log(incorrectwords.length);
			console.log(correctwords.length);
			var overall = (correctwords.length/incorrectwords.length)
			res.render('index', {
				overallStat: overall,
				//implement the rest of stats here No way of testing until tests are implemented
				isAdmin: function () {
					return res.locals.user.username == 'admin';
				}
			});
		}
		else{
			res.render('index', {
				overallStat: 0,
				greetingstat: 0,
				conversationstat: 0,
				foodstat: 0,
				sportsstat: 0,
				colorsstat: 0,
				houseitemsstat: 0,
				isAdmin: function () {
					return res.locals.user.username == 'admin';
				}
			});

		}
	});

});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

router.get('/angular', ensureAuthenticated, function (req, res) {
	res.render('angular', {
		isAdmin: function () {
			return res.locals.user.username == 'admin';
		}
	});
});

//Functionality for getting database objects to angular
router.get('/flashcards.angular', function (req, res) {
	var user = req.user.username;
	db.collection("users").findOne({
			username: user
		},
		function (err, result) {
			if (err) {
				throw err;
			} else {
				//Grab ALL of the users incorrectwords
				var incorrectwords = JSON.parse(result.listOfIncorrectWords);
				var i;
				//Now grab ALL of the words that match the category the user wants to learn
				var listOfDesiredWords = getWordsByCategory(incorrectwords, req.user.desiredcategory);
				//Shuffle the words
				listOfDesiredWords = shuffle(listOfDesiredWords);
				//Grab 10 of those words
				if(listOfDesiredWords.length > 10){
					listOfDesiredWords = listOfDesiredWords.slice(0,10);
				}
				//Add those words to users "wordstolearn" field
				updateUsersWordsToLearn(listOfDesiredWords, user);
				res.send({
					cards: listOfDesiredWords
				});
			}
		});
	/*
				Save the string as JSON, like this:

				var myArr = [{x1:0,x2:2000,y:300},{x1:50,x2:250,y:500}];
				myArrString = JSON.stringify(myArr);
				Later, when you get the JSON string back from MySQL, you can turn it back into an array with JSON.parse(), like this:

				var myArr = JSON.parse(myArrString)
				And yes, if you're wondering, JSON functionality has been added to Javascript's standard codebase: that's how popular it is.
				*/

	//end 

});

function updateUsersWordsToLearn(listOfDesiredWords, user){
	db.collection('users').updateOne({
		username: user
	}, {
		$set: {
			"wordstolearn": listOfDesiredWords
		},
		$currentDate: {
			lastModified: true
		}
	})
	.then(function (result) {
		console.log("Updated words to learn");
	});

}
//the Fisher-Yates (aka Knuth) Shuffle
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
  
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
  
	  // Pick a remaining element...
	  randomIndex = Math.floor(Math.random() * currentIndex);
	  currentIndex -= 1;
  
	  // And swap it with the current element.
	  temporaryValue = array[currentIndex];
	  array[currentIndex] = array[randomIndex];
	  array[randomIndex] = temporaryValue;
	}
  
	return array;
  }

function getWordsByCategory(allWords, category) {
	var desiredWords = [];
	for (i = 0; i < allWords.length; i++) {
		if (allWords[i].category == category) {
			desiredWords.push(allWords[i]);
		}
	}
	return desiredWords;
}

//post request to learn korean
router.post('/learn', function (req, res) {
	var category = req.body.category;
	var user = req.user.username;
	db.collection('users').updateOne({
			username: user
		}, {
			$set: {
				"desiredcategory": category
			},
			$currentDate: {
				lastModified: true
			}
		})
		.then(function (result) {
			res.render('flashcards', {
				category: category,
				user: req.user
			});
		});
});

module.exports = router;