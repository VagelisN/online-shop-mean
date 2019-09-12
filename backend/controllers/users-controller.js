const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const Users = require('../models/users');

exports.newUser =  (req, res, next) => {
  console.log(req.body.password);
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new Users({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        sellerRating: '4.5',
        sellerRatingVotes: 1,
        buyerRating: 0,
        buyerRatingVotes: 0
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User Created!',
            result: result
          });
        })
        .catch(err => {
          res.status(500).json({
            message: 'Invalid Creds'
          });
          console.log(err);
        });
    });
}

 exports.loginUser = (req, res, next) => {
  let fetchedUser;

  // first check if the email exists
  Users.findOne({ username: req.body.username })
    .then(user => {
      if( !user ) {
        return res.status(401).json({
          message: "Auth Failed"
        })
      }
      fetchedUser = user;
      // returns a promise
      console.log(req.body.password);
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(result => {
      console.log(result);
      if ( !result ) {
        console.log('xaaaaaaaaaaaaaaa');
        return res.status(401).json({
          message: "Invalid Authentication Creds"
        })
      }
      const token = jwt.sign(
        { username: fetchedUser.username, userId: fetchedUser._id },
        "this_password_should_be_secret",
      );
      console.log(token);
      // no need to return cause nothing else will be executed
      res.status(200).json({
        token: token,
        // decoding the token at the frontend is slow so pass it here
        userId: fetchedUser._id
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
}
