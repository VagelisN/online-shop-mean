const User = require('./../models/users');
const Auction = require('./../models/auctions');
const parser = require('xml2json');
const builder = require('xmlbuilder');

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

exports.extractAuction = (req, res, next) => {
  type = req.body.type;
  auctionId = req.body.auctionId;
  console.log(auctionId);
  Auction.findOne( { _id: auctionId }, (err,auction) => {
    var xml = builder.create('Items');
        xml.ele('Item').att('ItemID', auctionId)
        .ele('Name').txt(auction.name).up();

    for ( let cat in auction.categoryNames) {
      item = xml.ele('Category');
      item = item.txt(auction.categoryNames[cat]).up();
    }

    xml
    .ele('Currently').txt('$'+auction.highestBid).up()
    .ele('First_Bid').txt('$'+ String(auction.firstBid)).up()
    .ele('Number_of_Bids').txt(auction.numberOfBids).up();
    item = xml.ele('Bids');
      if(auction.numberOfBids > 0) {
        for(let i=0; i < auction.bids.length; i++){
          item=item.
          ele('Bid')
          .ele('Bidder',{'Rating': '22', 'UserId': auction.bids[i].bidder})
          .ele('Location').txt('location').up()
          .ele('Country').txt('USA').up().up();
        }
      }
    xml
    .ele('Location',{'Latitude': String(auction.latitude), 'Longtitude': String(auction.longitude) }).up()
    .ele('Country').txt(auction.country).up()
    .ele('Started').txt(String(auction.startDate)).up()
    .ele('Ends').txt(String(auction.endDate)).up()
    .ele('Seler',{'Rating': auction.sellerRating, 'UserID': auction.sellerId}).up()
    .ele('Description',auction.description);

    if(type=='XML') {
      res.status(200).json({message: 'ok', extractedAuction: xml.toString({pretty: true}) });
    }
    else {
      jsonAuction = parser.toJson(xml.toString({pretty: true}));
      console.log(jsonAuction)
      jsonAuction = String(jsonAuction);
      res.status(200).json({message: 'ok', extractedAuction: jsonAuction });
    }
  })
};

exports.extractAllAuctions = (req, res, next) => {
  username = req.body.username;
  type = req.body.type;
  User.findOne({ username: username })
    .then(user => {
      if(user) {
        Auction.find({sellerId: user._id})
        .then(documents => {
          var xml = builder.create('Items');
          for (let i =0; i < documents.length; i++) {
            auction = documents[i];
            first = xml.ele('Item').att('ItemID', auction._id)
              .ele('Name').txt(auction.name).up();

            for ( let cat in auction.categoryNames) {
              item = first.ele('Category');
              item = item.txt(auction.categoryNames[cat]).up();
            }

            first
            .ele('Currently').txt('$'+auction.highestBid).up()
            .ele('First_Bid').txt('$'+ String(auction.firstBid)).up()
            .ele('Number_of_Bids').txt(auction.numberOfBids).up();
            item = first.ele('Bids');
            if(auction.numberOfBids > 0) {
              for(let i=0; i < auction.bids.length; i++){
                item=item.
                ele('Bid')
                .ele('Bidder',{'Rating': '22', 'UserId': auction.bids[i].bidder})
                .ele('Location').txt('location').up()
                .ele('Country').txt('USA').up().up();
              }
            }
            first
            .ele('Location',{'Latitude': String(auction.latitude), 'Longtitude': String(auction.longitude) }).up()
            .ele('Country').txt(auction.country).up()
            .ele('Started').txt(String(auction.startDate)).up()
            .ele('Ends').txt(String(auction.endDate)).up()
            .ele('Seler',{'Rating': auction.sellerRating, 'UserID': auction.sellerId}).up()
            .ele('Description',auction.description);
          }
          if(type=='XML') {
            res.status(200).json({message: 'ok', extractedAuctions: xml.toString({pretty: true}) });
          }
          else {
            jsonAuctions = parser.toJson(xml.toString({pretty: true}));
            jsonAuctions = String(jsonAuctions);
            res.status(200).json({message: 'ok', extractedAuctions: jsonAuctions });
          }
        });
      }
    });
}
