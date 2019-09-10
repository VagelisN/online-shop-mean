const express = require('express');

const controller = require('../controllers/auctions-controller');

const router = express.Router();

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

router.post('/create', multer({storage: storage}).single('image'), controller.createAuction);

router.get('', controller.getAuctions);

router.get("/:id", controller.getSingleAuction);

router.delete("/:id", controller.deleteAuction);

router.patch("/start/:id", controller.startAuction);



module.exports = router;
