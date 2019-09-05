const express = require('express');

const controller = require('../controllers/auctions-controller');

const router = express.Router();

router.post('/create',controller.createAuction);

module.exports = router;
