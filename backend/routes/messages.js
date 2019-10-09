const express = require('express');

const controller = require('../controllers/messages-controller');

const router = express.Router();

const verifyToken = require('./../verify-token');

router.get('/inbox/:username', verifyToken,controller.getMessages);

router.get('/sent/:username', verifyToken,controller.getSentMessages);

router.get('/count/:username',controller.countUnread);

router.post('/send',controller.sendMessage);

router.patch('/read/:messageId', verifyToken,controller.messageRead);

router.patch('',controller.deleteMessage);

router.patch('/removerating/:messageId',controller.removeRating);



module.exports = router;
