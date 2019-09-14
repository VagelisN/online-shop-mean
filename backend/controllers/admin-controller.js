const User = require('./../models/users');

exports.getUsers =  (req, res, next) => {
  User.find().then( async documents => {
    if (documents !== null) {
      res.status(200).json({
        message: 'Users fetched succesfully from database.',
        users: documents
      });
    }
  });
};

exports.getUserInfo = (req, res, next) => {
  User.findOne({ username: req.params.username })
    .then(user => {
      console.log(user);
      res.status(200).json({
        message: 'fetched user',
        user: user
      })
    });
};

exports.verifyUser = (req, res, next) => {
  var query = { username: req.body.username };
  var newValue = { verified: true };
  User.updateOne(query, newValue, (result) => {
    console.log(result,"asdasdasdasd");
    res.status(200).json({
      message: 'user Verified'
    })
  });
};
