var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/koreanwebsite');

var db = mongoose.connection;

//Word schema
var WordSchema = mongoose.Schema({
  english: {
    type: String,
  },
  korean: {
    type: String
  },
  transliteration:{
    type: String
  },
  category: {
    type: String
  }

});

var Word = module.exports = mongoose.model('Word', WordSchema);

module.exports.createWord = function(newWord, callback){
  newWord.save(callback);
};

module.exports.getWordByEnglishWord = function(english, callback){
	var query = {english: english};
	Word.find(query, callback);
};

module.exports.getWordsByCategory = function(category, callback){
	var query = {category: category};
  Word.find(query, callback);
};
