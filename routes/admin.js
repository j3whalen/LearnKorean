var express = require('express');
var router = express.Router();

var Word = require('../models/word');


// Get Admin Page
console.log('admin.js');
router.get('/admin', function(req, res){
	res.render('admin');
});

module.exports = router;
