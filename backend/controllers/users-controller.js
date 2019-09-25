const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const Users = require('../models/users');

exports.newUser =  (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      console.log('Longitude: ', req.body.longitude);
      const user = new Users({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        address: req.body.address,
        afm: req.body.afm,
        sellerRating: '4.5',
        sellerRatingVotes: 1,
        buyerRating: 0,
        buyerRatingVotes: 0,
        verified: false
      });
      user.save()
        .then(result => {
          res.status(201).json({
            result: result
          });
        })
        .catch(err => {
          let message = "Invalid Email or Username";
          if (err.errors["email"] && err.errors["email"]["kind"] == 'unique'){
            message = "A user with this email adress exists";
          }
          else if (err.errors["username"] && err.errors["username"]["kind"] === 'unique') {
            message = "Username taken";
          }
          res.status(500).json({
            message: message
          });
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
          message: "This Username does not exist"
        })
      }
      fetchedUser = user;
      // returns a promise
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(result => {
      if ( !result ) {
        return res.status(401).json({
          message: "Wrong Password Entered"
        })
      }
      // user in db but not verified
      // if (!fetchedUser.verified) {
      //   return res.status(401).json({
      //     message: "User Pending Verification from Admin"
      //   })
      // }
      const token = jwt.sign(
        { username: fetchedUser.username, userId: fetchedUser._id },
        "this_password_should_be_secret",
      );
      // no need to return cause nothing else will be executed
      res.status(200).json({
        token: token,
        // decoding the token at the frontend is slow so pass it here
        userId: fetchedUser._id,
        username: fetchedUser.username
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
}

exports.userVisited = (req, res, next) => {
  console.log(req.body);
  const userId = req.params.userId;
  let textToAdd = req.body.textToAdd;
  Users.findOne({_id: userId})
    .then(user => {
      if(user) {
        let userVisited = user.lastVisited;
        if(userVisited.length > 10000) {
          let cutAt = userVisited.indexOf('^e^');
          userVisited = userVisited.slice(cutAt + 3);
          console.log('ekopsa erapsa')
        }
        textToAdd = userVisited + textToAdd;
        console.log(textToAdd);
        Users.findOneAndUpdate({_id: userId}, {lastVisited: textToAdd})
          .then(result => {
            // console.log(result);
            res.status(200).json({
              message: 'updated userVisited: ' + textToAdd
            });
          })
      }
    })
}
