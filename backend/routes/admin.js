const express = require('express');

const controller = require('../controllers/admin-controller');

const router = express.Router();

router.get('',controller.getUsers);

router.get('/:username',controller.getUserInfo);

module.exports = router;
