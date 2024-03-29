const express = require('express');

const controller = require('../controllers/auctions-controller');

const router = express.Router();

const verifyToken = require('./../verify-token');

const multer = require('multer');
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(null, 'backend/images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post('/create', verifyToken, multer({storage: storage}).single('image'), controller.createAuction);

router.get('', controller.getAuctions);

router.get('/rec/:userId', verifyToken,  controller.getRecommendations);

router.get('/user/:id' , verifyToken, controller.getUserAuctions);

router.get('/get/:id', controller.getSingleAuction);

router.get('/search', controller.searchAuctions);

router.delete('/:id', verifyToken, controller.deleteAuction);

router.patch('/start/:id', verifyToken, controller.startAuction);

router.patch('/bid/:id', verifyToken, controller.bidAuction);

router.get('/categories/:parentId', controller.getCategories);

router.get('/categories/path/:id', controller.getPath);

router.patch('/rate/:id', verifyToken, controller.rateUser);

router.get('/user/finished/:id', verifyToken, controller.getUserFinishedAuctions);

router.post('/edit/:id', verifyToken, multer({storage: storage}).single('image'), controller.updateAuction);


module.exports = router;
