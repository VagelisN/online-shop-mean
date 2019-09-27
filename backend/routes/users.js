const express = require('express');

const controller = require('../controllers/users-controller');

const verifyToken = require('./../verify-token');

const router = express.Router();

router.post('/signup',controller.newUser);

router.post('/login', controller.loginUser);

router.post('/visited/:userId', verifyToken, controller.userVisited);

router.post('/bidded/:userId', verifyToken, controller.userBidded);

module.exports = router;
