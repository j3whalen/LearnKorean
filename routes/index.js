var express = require('express');
var router = express.Router();

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

module.exports = router;
