const Message = require('../models/messages');

exports.getMessages = (req, res, next) => {
  username = req.params.username;
  Message.find({to: username}).sort('-timestamp').then( documents => {
    if (documents !== null) {
      console.log(documents, username);
      res.status(200).json({
        messages: documents
      });
    }
  });
};

exports.sendMessage = (req, res, next) => {
  message = new Message({
    title: req.body.title,
    content: req.body.content,
    from: req.body.from,
    fromId: req.body.fromId,
    to: req.body.to,
    toId: req.body.toId
  });
  message.save().then(sentMessage =>{
    console.log("peh", sentMessage);
    res.status(200).json({
      message: 'message sent successfuly'
    });
  })
}
