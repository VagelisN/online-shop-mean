const express = require('express');

const controller = require('../controllers/users-controller');

const router = express.Router();

router.post('/signup',controller.newUser);

router.post('/login', controller.loginUser);

module.exports = router;
