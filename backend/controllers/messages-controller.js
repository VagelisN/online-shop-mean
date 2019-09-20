const Message = require('../models/messages');

exports.getMessages = (req, res, next) => {
  username = req.params.username;
  Message.find({to: username, receiverDeleted: false}).sort('-timestamp').then( documents => {
    if (documents !== null) {
      console.log(documents, username);
      res.status(200).json({
        messages: documents
      });
    }
  });
};

exports.getSentMessages  = (req, res, next) => {
  username = req.params.username;
  Message.find({from: username, senderDeleted: false}).sort('-timestamp').then( documents => {
    if (documents !== null) {
      console.log(documents, username);
      res.status(200).json({
        messages: documents
      });
    }
  });
}

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

exports.messageRead = (req, res, next) => {
  messageId = req.params.messageId;
  Message.updateOne({_id: messageId}, {isRead: true})
    .then( preUpdateMessage =>{
      res.status(200).json({
        message: 'isRead set to true'
      });
    })
}

exports.countUnread = (req, res, next) => {
  username = req.params.username;
  Message.countDocuments({to: username, isRead: false})
    .then(count => {
      res.status(200).json({
        message: 'retrieved unread count',
        count: count
      })
    })
}

exports.deleteMessage = (req, res, next) => {
  Message.findOne({_id: req.body.messageId})
    .then(message => {
      let deletedFrom = req.body.username;
      console.log(message, username)
      if( message.from === deletedFrom) {
        Message.updateOne({_id: message._id}, {senderDeleted: true}, {new: true}, (err, doc) => {
          if(doc){
            if(message.receiverDeleted) {
              console.log("mallon egine?")
              Message.deleteOne({_id: message._id}).then(result =>{
                  return res.status(200).json({
                  message: 'message deleted'
                });
              })
            } else {
              return res.status(200).json({
                message: 'message deleted from one part'
              })
            }
          }
        });
      } else if (message.to === deletedFrom) {
        Message.updateOne({_id: message._id}, {receiverDeleted: true}, {new: true}, (err, doc) => {
          if(doc){
            console.log("EDWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",doc);
            if(message.senderDeleted) {
              console.log("mallon egine?")
              Message.deleteOne({_id: message._id}).then(result =>{
                return res.status(200).json({
                  message: 'message deleted'
                });
              })
            } else {
              return res.status(200).json({
                message: 'message deleted from one part'
              })
            }
          }
        });
      }
    });
}
