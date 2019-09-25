const express = require('express');

const controller = require('../controllers/users-controller');

const router = express.Router();

router.post('/signup',controller.newUser);

router.post('/login', controller.loginUser);

router.post('/visited/:userId', controller.userVisited);

module.exports = router;
