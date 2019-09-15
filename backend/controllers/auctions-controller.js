const Auction = require('./../models/auctions');
const Category = require('./../models/categories');
const Users = require('./../models/users');


function updateRatings(documents) {
  return new Promise( async resolve =>  {
    for (let index = 0; index < documents.length; index++) {
      await updateSingleRating(documents[index]);
    }
    resolve();
  })
}

async function updateSingleRating(auction) {
  return new Promise( resolve => {
    Users.findById(auction.sellerId)
    .then(user => {
      console.log("Sellerrating = ", auction.sellerRating);
      auction.sellerRating = user.sellerRating;
      console.log("New sellerRating = ",auction.sellerRating);
      resolve();
    })
    .catch(() => {
      console.log("SellerId was not found in user's collection.");
      resolve();
    })
  })

}


exports.createAuction =  (req, res, next) => {
  console.log("SellerId in backend: ",req.body.sellerId);
  const url = req.protocol + '://' + req.get('host');
  const auction = new Auction({
    name: req.body.name,
    description: req.body.description,
    country: req.body.country,
    category: req.body.category,
    latitude: req.body.latitude,
    longitude:req.body.longitude,
    buyPrice: req.body.buyPrice,
    highestBid: 0,
    firstBid: null,
    numberOfBids: 0,
    bids: null,
    image: url + '/images/' + req.file.filename,
    startDate: null,
    endDate: req.body.endDate,
    address: req.body.address,
    sellerId: req.body.sellerId,
    sellerRating: '0'
  });
  Users.findById(req.body.sellerId).then(user => {
    auction.sellerRating = user.sellerRating;
  });
  auction.save().then( createdAuction => {
    res.status(201).json({
      message: 'Auction added succesfully',
      auctionId: createdAuction._id,
      imagePath: createdAuction.imagePath,
      sellerRating: createdAuction.sellerRating
    });
  })
};


// Prepei na kanw search sthn bash twn users kai na kanw fetch to seller rating tou seller prin epistrepsw ta auctions

exports.getAuctions = (req, res, next) => {
  console.log("Reached the backend");
  Auction.find().then( async documents => {
    if (documents !== null) {
      // Update sellerRating from the users database
      await updateRatings(documents);
    }
    // Send back the auctions as json.
    res.status(200).json({
      message: 'Auctions fetched succesfully from database.',
      auctions: documents
    });
  });
};


exports.getSingleAuction = (req, res, next) => {
  console.log("In edit method. reached the right backend function");
  Auction.findById(req.params.id).then(auction => {
    if (auction) {

      // Update the sellerRating from the user's database
      Users.findById(auction.sellerId).then(user => {
        auction.sellerRating = user.sellerRating;
      });
      // Send the auction as json.
      res.status(200).json(auction);
    } else {
      res.status(404).json({
        message: "Auction was not found."
      })
    }
  })
};

exports.deleteAuction =  (req, res, next) => {
  Auction.deleteOne({ _id: req.params.id })
  .then(result => {
    console.log(result);
    res.status(200).json({
      message: "Auction deleted!"
    })
  })
};

exports.startAuction = (req, res, next) => {
  console.log("in router.patch!");
  Auction.findById(req.params.id).then(auction => {
    if (auction.startDate === null) {

      // Check whether the endDate has passed
      const tempEndDate = auction.endDate.split('-');
      const endDate = new Date(auction.endDate);
      var today = new Date();
      if (today < endDate) {
        var query = { _id: req.params.id };
        var newValue = { $set: { startDate: today } };
        // Mporei na allaksei se auction.save()  <==========================
        Auction.updateOne(query, newValue, () => {
          console.log("Started an auction");
          res.status(201).json({
            message: "Auction started succesfully."
          });
        })
      } else {
        console.log("endDate has passed. Cannot start auction now.");
        // I should delete the auction now.
        res.status(500).json({
          message: "Auction cannot be started now. endDate has passed."
        });
      }

    } else {
      console.log("StartDate is not null.");
      // If the auction has already started return a corresponding message
      res.starus(404).json({
        message: "Auction has already been started."
      });
    }
  })
};

exports.bidAuction = (req, res, next) => {

  // First of all, get the auction from the database.
  Auction.findById(req.params.id).then(auction => {
    // Check if there are any bids
    if (auction.bids === null) {
      // Create a bid schema and push the new bid
      auction.bids = {
        amount: req.body.bid,
        time: new Date(),
        bidder: req.body.id
      }
      // Update the highest bid, the first bid and the number of bids.
      auction.highestBid = req.body.bid;
      auction.firstBid = auction.bids[0];
      auction.numberOfBids = 1;
    } else {
      // Check if the bid is valid and update the bids in the schema
      if (req.body.bid > auction.highestBid) {
        auction.bids.push({
          amount: req.body.bid,
          time: new Date(),
          bidder: req.body.id
        });
        // Then update the number of bids and the highestBid
        auction.highestBid = req.body.bid;
        auction.numberOfBids ++;

      } else {
        res.status(500).json({
          message: 'Bid is lower than the current highest.'
        });
      }
    }
    auction.save().then(() => {
      res.status(200).json({
        message: 'Bid submitted succesfully'
      });
    })
  })
  .catch(() => {
    console.log('Could not find auction.');
    res.status(404).json({
      message: 'Couldn\'t find auction.'
    })
  })

};

exports.getCategories = (req, res, next) => {
  let parentId = req.params.parentId;
  if (req.params.parentId == "null") {parentId = null;}
  Category.find({parentId: parentId}).then( async documents => {
    if (documents !== null) {

    }
    // Send back the auctions as json.
    res.status(200).json({
      message: 'Categories fetched succesfully from database.',
      categories: documents
    });
  });
};
