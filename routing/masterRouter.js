const express = require('express');
const router = express.Router();
const path = require('path')
const url = require('url');


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});



module.exports = router;
