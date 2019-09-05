const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const UserModel = require('../models/users');

exports.newUser =  (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new UserModel({
        username: req.body.username,
        email: req.body.email,
        password: hash
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
//   let fetchedUser;

//   // first check if the email exists
//   User.findOne({ email: req.body.email })
//     .then(user => {
//       if( !user ) {
//         return res.status(401).json({
//           message: "Auth Failed"
//         })
//       }
//       fetchedUser = user;
//       // returns a promise
//       return bcrypt.compare(req.body.password, user.password)
//     })
//     .then(result => {
//       if ( !result ) {
//         return res.status(401).json({
//           message: "Invalid Authentication Creds"
//         })
//       }
//       const token = jwt.sign(
//         { email: fetchedUser.email, userId: fetchedUser._id },
//         process.env.JWT_KEY,
//         { expiresIn: '1h' }
//       );
//       console.log(token);
//       // no need to return cause nothing else will be executed
//       res.status(200).json({
//         token: token,
//         expiresIn: 3600,
//         // decoding the token at the frontend is slow so pass it here
//         userId: fetchedUser._id
//       });
//     })
//     .catch(err => {
//       res.status(500).json({
//         error: err
//       });
//     });
}
