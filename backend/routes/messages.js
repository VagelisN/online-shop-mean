const express = require('express');

const controller = require('../controllers/messages-controller');

const router = express.Router();

router.get('/inbox/:username',controller.getMessages);

router.get('/sent/:username',controller.getSentMessages);

router.get('/count/:username',controller.countUnread);

router.post('/send',controller.sendMessage);

router.patch('/read/:messageId',controller.messageRead);

router.patch('',controller.deleteMessage);

module.exports = router;
