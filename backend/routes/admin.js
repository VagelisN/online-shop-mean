const express = require('express');

const controller = require('../controllers/admin-controller');

const router = express.Router();

router.get('',controller.getUsers);

module.exports = router;
