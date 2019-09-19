const express = require('express');

const controller = require('../controllers/messages-controller');

const router = express.Router();

router.get('/:username',controller.getMessages);

router.post('/send',controller.sendMessage);

module.exports = router;
