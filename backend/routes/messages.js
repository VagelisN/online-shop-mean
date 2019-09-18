const express = require('express');

const controller = require('../controllers/messages-controller');

const router = express.Router();

router.get('/:userId',controller.getMessages);

module.exports = router;
