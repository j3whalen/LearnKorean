var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();
var Word = require('../models/word');
mongoose.connect('mongodb://localhost/koreanwebsite');

var db = mongoose.connection;
var QuestionIndex = 0;
var questionsreference = [];
var amountofwords = 10;

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
	db.collection("users").findOne({
		username: req.user.username
	}, function (err, result) {
		if (result.listOfCorrectWords.length !== 0) {
			var incorrectwords = JSON.parse(result.listOfIncorrectWords);
			var correctwords = JSON.parse(result.listOfCorrectWords);
			var overall = (correctwords.length / (incorrectwords.length + correctwords.length));
			overall = overall.toFixed(2);
			res.render('index', {
				overallStat: overall,
				greetingstat: (((getWordsByCategory(correctwords,'greetings')).length/((getWordsByCategory(incorrectwords,'greetings')).length + (getWordsByCategory(correctwords, 'greetings')).length))).toFixed(2),
				conversationstat: (((getWordsByCategory(correctwords,'conversation')).length/((getWordsByCategory(incorrectwords,'conversation')).length + (getWordsByCategory(correctwords, 'conversation')).length))).toFixed(2),
				foodstat: (((getWordsByCategory(correctwords,'food')).length/((getWordsByCategory(incorrectwords,'food')).length + (getWordsByCategory(correctwords, 'food')).length))).toFixed(2),
				sportsstat: (((getWordsByCategory(correctwords,'sports')).length/((getWordsByCategory(incorrectwords,'sports')).length + (getWordsByCategory(correctwords, 'sports')).length))).toFixed(2),
				colorsstat: (((getWordsByCategory(correctwords,'colors')).length/((getWordsByCategory(incorrectwords,'colors')).length + (getWordsByCategory(correctwords, 'colors')).length))).toFixed(2),
				houseitemsstat: (((getWordsByCategory(correctwords,'houseitems')).length/((getWordsByCategory(incorrectwords,'houseitems')).length + (getWordsByCategory(correctwords, 'houseitems')).length))).toFixed(2),
				isAdmin: function () {
					return res.locals.user.username == 'admin';
				}
			});
		} else {
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
				if (listOfDesiredWords.length > amountofwords) {
					listOfDesiredWords = listOfDesiredWords.slice(0, amountofwords);
				}
				questionsreference = listOfDesiredWords;
				//Add those words to users "wordstolearn" field
				updateUsersWordsToLearn(listOfDesiredWords, user);
				res.send({
					cards: listOfDesiredWords
				});
			}
		});

});

function updateUsersWordsToLearn(listOfDesiredWords, user) {
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
	var currentIndex = array.length,
		temporaryValue, randomIndex;

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

//Testing
router.get('/test', ensureAuthenticated, function (req, res) {
	res.render('test', {
		user: req.user,
		category: req.user.desiredcategory
	});
});

router.get('/test.angular', function (req, res) {
	var user = req.user.username;
	console.log(user);
	db.collection("users").findOne({
			username: user
		},
		function (err, result) {
			if (err) {
				throw err;
			} else {
				//Grab ALL of the users incorrectwords
				//console.log(result.wordstolearn);
				var wordstolearn = result.wordstolearn;
				//Shuffle the words
				wordstolearn = shuffle(wordstolearn);
				console.log("words to learn length", wordstolearn.length);
				if (wordstolearn.length == 0) {
					res.send({
						QuestionNumber: "",
						wordstotest: "",
						question: questionsreference[QuestionIndex],
						isCorrect: false,
						isWrong: false,
						showSubmit: false,
						showNext: false,
						showResults: true
					});
				} else {
					var words = grabfourwords(questionsreference[QuestionIndex], questionsreference);

					res.send({
						QuestionNumber: QuestionIndex,
						wordstotest: words,
						question: questionsreference[QuestionIndex], //need to modify how to increment index
						isCorrect: false,
						isWrong: false,
						showSubmit: true,
						showNext: false,
						showResults: false
					});

				}
			}
		});

});

function grabfourwords(word, questionsreference) {
	var array = [];
	for (var i = 0; i < questionsreference.length; i++) {
		if (questionsreference[i] !== word) {
			array.push(questionsreference[i]);
		}
	}
	array = array.slice(0, 3);
	array.push(word);
	array = shuffle(array);
	return array;
}

function AddwordtoCorrectwords(user, word) {
	db.collection("users").findOne({
		username: user
	}, function (err, result) {
		if (err) {
			throw err;
		} else {
			var correctwords = JSON.parse(result.listOfCorrectWords);
			correctwords.push(word);
			var x = JSON.stringify(correctwords);
			db.collection("users").updateOne({
				username: user
			}, {
				$set: {
					listOfCorrectWords: x
				}
			}, function (err, result2) {
				if (err) {
					throw err;
				} else {
					console.log("correct words length", correctwords.length);
				}
			});
		}
	});
}

function removeWordFromWordsToLearn(user, word) {
	db.collection("users").findOne({
		username: user
	}, function (err, result) {
		if (err) {
			throw err;
		} else {
			var wordstolearn = result.wordstolearn;
			wordstolearn = deleteObjectFromJSON(wordstolearn, word.english);
			db.collection("users").updateOne({
				username: user
			}, {
				$set: {
					wordstolearn: wordstolearn
				}
			}, function (err, result2) {
				if (err) {
					throw err;
				} else {

				}
			});
		}
	});
}

function removeWordFromIncorrectWords(user, word) {
	db.collection("users").findOne({
		username: user
	}, function (err, result) {
		if (err) {
			throw err;
		} else {
			var incorrectwords = result.listOfIncorrectWords;
			incorrectwords = deleteObjectFromJSON(incorrectwords, word.english);
			db.collection("users").updateOne({
				username: user
			}, {
				$set: {
					listOfIncorrectWords: incorrectwords
				}
			}, function (err, result2) {
				if (err) {
					throw err;
				} else {

				}
			});
		}
	});
}

function deleteObjectFromJSON(jsonarray, englishWord) {
	for (var i = 0; i < jsonarray.length; i++) {
		if (jsonarray[i].english === englishWord) {
			jsonarray.splice(i, 1);
		}
	}
	return jsonarray;
}
router.post('/learn/checkanswers', function (req, res, next) {
	QuestionIndex = QuestionIndex + 1;
	if (req.body.question.korean == req.body.selectedAnswer.korean) {
		AddwordtoCorrectwords(req.user.username, req.body.question);
		removeWordFromWordsToLearn(req.user.username, req.body.question);
		removeWordFromIncorrectWords(req.user.username, req.body.question);
		console.log("CORRECT");
		res.send({
			isCorrect: true,
			isWrong: false,
			showQuestion: false,
			showNext: true
		});
	} else {
		removeWordFromWordsToLearn(req.user.username, req.body.question); //getting error saying english is not defined but theres one document left
		console.log("WRONG");
		res.send({
			isCorrect: false,
			isWrong: true,
			showQuestion: false,
			showNext: true
		});
	}
});

router.get('/results', ensureAuthenticated, function(req, res){
	res.render('results');
});

module.exports = router;