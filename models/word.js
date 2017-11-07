var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/koreanwebsite');

var db = mongoose.connection;

//user schema
var WordSchema = mongoose.Schema({
  english: {
    type: String,
    index: true,
    unique: true
  },
  korean: {
    type: String
  },
  category: {
    type: String
  },
  audio:{
    type: Buffer
  }

  //we can compute stats by using the lengths of these arrays
});

var Word = module.exports = mongoose.model('Word', WordSchema);

module.exports.createWord = function(newWord, callback){
  newWord.save(callback);
};

module.exports.getWordByEnglishWord = function(englishWord, callback){
	var query = {englishWord: englishWord};
	Word.findOne(query, callback);
};

module.exports.getWordsByCategory = function(category, callback){
	var query = {category: category};
	Word.find(query, callback);
};
