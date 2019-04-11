var express = require('express');
var router = express.Router();
const { user } = require('../models');

// GET /users
router.get('/', (req, res, next) => {
  user.findAll().then(users => res.json(users));
});

module.exports = router;
