const Auction = require('./../models/auctions');
const Category = require('./../models/categories');
const Users = require('./../models/users');
const Message = require('./../models/messages');

const cron = require('node-cron');


function checkIfEnded(auction) {
  const endDate = new Date(auction.endDate);
  const today = new Date();
  let highestBid = null;
  let highestBidder = null;
  // If we passed the endDate
  if (endDate < today) {
    // Check if there are any valid bids.
    if (auction.bids) {
      highestBid = auction.bids[auction.bids.length - 1];
      // Double check that we got the right bid.
      if (highestBid.amount === auction.highestBid) {
        highestBidder = highestBid.bidder;
      }
    }
    // Send a message to the seller with auction information and the bidder details.
    if (highestBidder) {
      const sellerMessage = new Message ({
        title: 'Your auction with id: '+ auction.id +' has been completed.',
        content: 'You can now communicate with the winner of the auction.',
        from: highestBidder,
        to: auction.sellerId
      });
      sellerMessage.save().then(() => {
        console.log('Auction with id: '+ auction.id+' has ended.');
      })
      // Insert the message to the database
    } else {
      const sellerMessage = new Message ({
        title: 'Your auction with id: '+ auction.id +' has been completed.',
        content: 'Unfortunately there were no bids for your item.',
        from: null,
        to: auction.sellerId
      });
      sellerMessage.save().then(() => {
        console.log('Auction with id: '+ auction.id+' has ended.');
      })
    }
    // Send a message to the highest bidder with information about the seller.
    if (highestBidder) {
      const bidderMessage = new Message ({
        title: 'You have won the auction with id: '+ auction.id +'.',
        content: 'You can now communicate with the seller.',
        from: auction.sellerId,
        to: highestBidder
      });
      sellerMessage.save().then(() => {
        console.log('Auction with id: '+ auction.id+' has ended.');
      })
    }
    return true;
  } else {
    // If the auction hasn't ended return false
    return false;
  }
}

// Here we check if an auction is ended and we inform the winner and the seller.
// This function will run every day at 00:00:01
cron.schedule("00 00 01 * *", () => {
  Auction.find().then(documents => {
    for (let index = 0; index < documents.length; index++) {
      const auction = documents[index];
      checkIfEnded(auction);
    }
  });
})

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
      // console.log("Sellerrating = ", auction.sellerRating);
      auction.sellerRating = user.sellerRating;
      // console.log("New sellerRating = ",auction.sellerRating);
      resolve();
    })
    .catch(() => {
      // console.log("SellerId was not found in user's collection.");
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
  console.log("Reached the backend getAuctions()");
  // Plus sign converts pageSize from string to number
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.currentPage;
  let fetchedAuctions;
  const auctionQuery = Auction.find();
  if (pageSize && currentPage) {
    auctionQuery
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize);
  }
  auctionQuery.then( documents => {
      fetchedAuctions = documents;
      return Auction.countDocuments();
    })
    .then(async count => {
      if (fetchedAuctions !== null) {
        // Update sellerRating from the users database
        await updateRatings(fetchedAuctions);
      }
      // Send back the auctions as json.
      res.status(200).json({
        message: 'Auctions fetched succesfully from database.',
        auctions: fetchedAuctions,
        maxAuctions: count
      });

    });
}

function checkPrice(auction, sliderMinValue, sliderMaxValue) {
  if (auction.buyPrice !== null) {
    if (parseFloat(auction.buyPrice) > sliderMinValue
        && parseFloat(auction.buyPrice) < sliderMaxValue) {
      return true;
    }
  } else {
    return true;
  }
}

exports.searchAuctions = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.currentPage;
  const minValue = +req.query.minPrice;
  const maxValue = +req.query.maxPrice;
  const searchValue = req.query.searchValue.toLowerCase();
  console.log('Reached searchAuctions in the backend.',minValue, maxValue, searchValue);
  console.log('Pagesize: ', pageSize, 'currentPage: ', currentPage);
  let filteredAuctions = [];
  Auction.find().then(documents => {
    console.log(documents);
    console.log('Finished printing documents.');
    if (searchValue === '') {
      filteredAuctions = documents.filter(auction => {
        return checkPrice(auction, minValue, maxValue);
      })
    } else {
      filteredAuctions = documents.filter(auction => {
        // We have to check different fields.
        console.log(auction);
        console.log('-------------');
        // Check if the searchValue is in the name field
        /*
        console.log(String(auction.name).toLowerCase(),'|apoedwkaiperatipota');
        console.log(searchValue,'|apoedwkaiperatipota');
        const result = (auction.name == searchValue);
        console.log('Includes result: ', result);
        */
        if (auction.name.toLowerCase().includes(searchValue)) {
          console.log('Name was found. So its a price issue.');
          return checkPrice(auction, minValue, maxValue);
        }
        // Check if the searchValue is in the description field
        if (auction.description.toLowerCase().includes(searchValue)) {
          return checkPrice(auction, minValue, maxValue);
        }
        // Check if the searchValue is in the location field
        if (auction.address.toLowerCase().includes(searchValue)) {
          return checkPrice(auction, minValue, maxValue);
        }
      })
    }
    const tauctionCount = filteredAuctions.length;
    // Find the indexes we need to send back
    console.log(filteredAuctions);
    filteredAuctions = filteredAuctions.slice(pageSize * (currentPage - 1) , (pageSize * currentPage)  );
    res.status(200).json({
      message: 'Search fetched auctions succesfully.',
      auctions: filteredAuctions,
      auctionCount: tauctionCount
    });
  })



}


exports.getSingleAuction = (req, res, next) => {
  console.log("In edit method. reached the right backend function. req.params.id: ",req.params.id);
  Auction.findById(req.params.id).then(auction => {
    if (auction) {

      // Update the sellerRating from the user's database
      Users.findById(auction.sellerId).then(user => {
        auction.sellerRating = user.sellerRating;
        // Send the auction as json.
        res.status(200).json(auction);
      });
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
        auction.startDate = today;
        auction.save().then(() => {
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
    // We check if the auction has started in the front end.

    // Check if the auction has ended.
    if (checkIfEnded(auction)) {
      // checkIfEnded returns true if the auction has ended.
      res.status(500).json({
        message: 'Cannot bid, because the auction has ended.'
      });
    }

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

function findPath(categoryId,path) {
  return new Promise(resolve =>{
    Category.findOne({ _id: categoryId}, async function (err, item){
      if (err) {
        console.log(err);
        resolve();
        return
      }
      path.unshift(item._id, item.name);
      console.log(path);
      if(item.parentId != null) {
        await findPath(item.parentId, path);
        resolve();
      }
      else {
        resolve();
      }
    });
  })
}

exports.getPath = async (req, res, next) => {
  let path = [];
  await findPath(req.params.id, path);
  res.status(200).json({
    message: 'Found Path',
    path: path
  });
}
