var express = require('express');
var router = express.Router();

/* GET Sign In page. */
router.get('/', function(req, res) {
  res.render('signin');
});

module.exports = router;