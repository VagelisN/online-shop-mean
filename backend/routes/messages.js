const express = require('express');

const controller = require('../controllers/messages-controller');

const router = express.Router();

router.get('/:username',controller.getMessages);

router.get('/count/:username',controller.countUnread);

router.post('/send',controller.sendMessage);

router.patch('/read/:messageId',controller.messageRead);

module.exports = router;
