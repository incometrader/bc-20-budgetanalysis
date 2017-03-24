const express = require('express');
const router = express.Router();

/* GET Sign In page. */
router.get('/', (req, res) => {
  res.render('signin', { title: 'Sign In' });
});

module.exports = router;
