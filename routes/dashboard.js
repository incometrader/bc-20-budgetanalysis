const express = require('express');

const router = express.Router();

/* GET Dashboard page. */
router.get('/', (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
});

module.exports = router;
