const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const Users = require('../models/users');

exports.newUser =  (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
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

stopwords = ['information','INFORMATION','contact','CONTACT','PAYPAL','paypal','winner','WINNER','bidder','BIDDER','PAID','EBAY','amount','bid','Paypal','seller','information','contact','ebay','Ebay','i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']
function remove_stopwords(str) {
  res = []
  words = str.split(' ')
  for(i=0;i<words.length;i++) {
      if(!stopwords.includes(words[i])) {
          res.push(words[i])
      }
  }
  return(res.join(' '))
}


exports.userVisited = (req, res, next) => {
  const userId = req.params.userId;
  let textToAdd = req.body.textToAdd;
  let auctionId = req.body.auctionId;
  Users.findOne({_id: userId})
    .then(user => {
      if(user) {
        let userVisited = user.lastVisited;
        let userVisitedIds = user.lastVisitedIds;
        if(userVisited.length > 100000) {
          let cutAt = userVisited.indexOf('^e^');
          userVisited = userVisited.slice(cutAt + 3);
          cutAt = userVisitedIds.indexOf('>');
          userVisitedIds = userVisitedIds.slice(cutAt +1);
        }
        textToAdd = userVisited + textToAdd;
        textToAdd = remove_stopwords(textToAdd);
        userVisitedIds = userVisitedIds+'>'+auctionId;
        Users.findOneAndUpdate({_id: userId}, {lastVisited: textToAdd, lastVisitedIds: userVisitedIds})
          .then(result => {
            res.status(200).json({
              message: 'updated userVisited: ' + textToAdd
            });
          })
      }
    })
}

exports.userBidded = (req, res, next) => {
  const userId = req.params.userId;
  let textToAdd = req.body.textToAdd;
  let auctionId = req.body.auctionId;
  Users.findOne({_id: userId})
    .then(user => {
      if(user) {
        let userBidded = user.lastBidded;
        let userBiddedIds = user.lastBiddedIds;
        if(userBidded.length > 100000) {
          let cutAt = userBidded.indexOf('^e^');
          userBidded = userBidded.slice(cutAt + 3);
          cutAt = userBiddedIds.indexOf('>');
          userBiddedIds = userBiddedIds.slice(cutAt +1);
        }
        textToAdd = userBidded + textToAdd;
        textToAdd = remove_stopwords(textToAdd);
        userBiddedIds = userBiddedIds+'>'+auctionId;
        Users.findOneAndUpdate({_id: userId}, {lastBidded: textToAdd, lastBiddedIds: userBiddedIds})
          .then(result => {
            res.status(200).json({
              message: 'updated userBidded: ' + textToAdd
            });
          })
      }
    })
}
