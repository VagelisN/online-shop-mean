const express = require('express');

const controller = require('../controllers/admin-controller');

const router = express.Router();

const verifyToken = require('./../verify-token');

router.get('', verifyToken,controller.getUsers);

router.get('/:username', verifyToken,controller.getUserInfo);

router.post('', verifyToken, controller.verifyUser);

module.exports = router;
