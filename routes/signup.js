var express = require('express');
var router = express.Router();

/* GET Sign Up page. */
router.get('/', function(req, res) {
  res.render('signup');
});

module.exports = router;