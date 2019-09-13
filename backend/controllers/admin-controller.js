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
