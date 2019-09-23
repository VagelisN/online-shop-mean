const User = require('./../models/users');
const Auction = require('./../models/auctions');

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
  var newValue = {$set: { verified: true } };
  User.findOneAndUpdate(query, newValue, {new: true},(err,doc) => {
    if(!err) {
      res.status(200).json({
        message: 'user Verified'
      })
    } else {
      console.log(err);
    }
  });
};

var builder = require('xmlbuilder');

exports.extractAuction = (req, res, next) => {
  type = req.body.type;
  auctionId = req.body.auctionId;
  console.log(auctionId);
  Auction.findOne( { _id: auctionId }, (err,auction) => {
    categories=['cat1', 'cat2'];
    var xml = builder.create('Items')
      .ele('Item').att('ItemID', auctionId)
        .ele('Name').txt(auction.name).up();

    for ( let cat in categories) {
      let item = xml.ele('Category');
      item.txt(categories[cat]);
    }
    console.log(xml.toString({pretty: true}));
  })
}
