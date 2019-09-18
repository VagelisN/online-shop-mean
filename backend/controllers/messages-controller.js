const Message = require('../models/messages');

exports.getMessages = (req, res, next) => {
  userId = req.params.userId;
  Message.find({to: userId}).then( documents => {
    if (documents !== null) {
      res.status(200).json({
        messages: documents
      });
    }
  });
};
