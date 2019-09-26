const Auction = require('./../models/auctions');
const Category = require('./../models/categories');
const Users = require('./../models/users');
const Message = require('./../models/messages');
const ObjectID = require('mongodb').ObjectID;
const Lsh = require('@agtabesh/lsh')

const cron = require('node-cron');

function sendAuctionMessages(auction, highestBidder) {
  console.log('About to send messages......');
  Users.findById(auction.sellerId).then(seller => {
    // Send a message to the seller with auction information and the bidder details.
    const sellerUsername = seller.username;
    if (highestBidder) {
      Users.findById(highestBidder).then(user => {
        const bidderUsername = user.username;
        const sellerMessage = new Message ({
          title: 'Your auction with id: '+ auction.id +' has been completed.',
          content: 'You can now communicate with the winner of the auction.',
          fromId: highestBidder,
          from: bidderUsername,
          to: sellerUsername,
          toId: auction.sellerId,
          rating: 'bidder'
        });
        // Save the message in the database
        sellerMessage.save().then(() => {
          console.log('Auction with id: '+ auction.id+' has ended.');
        })
        // Send a message to the winner too
        const bidderMessage = new Message ({
          title: 'You have won the auction with id: '+ auction.id +'.',
          content: 'You can now communicate with the seller.',
          from: sellerUsername,
          fromId: auction.sellerId,
          to: bidderUsername,
          toId: highestBidder,
          rating: 'seller'
        });
        bidderMessage.save().then(() => {
          console.log('Auction with id: '+ auction.id+' has ended.');
        })

      });
    } else {
      const sellerMessage = new Message ({
        title: 'Your auction with id: '+ auction.id +' has been completed.',
        content: 'Unfortunately there were no bids for your item.',
        from: null,
        fromId: null,
        to: sellerUsername,
        toId: auction.sellerId,
        senderDeleted: true
      });
      sellerMessage.save().then(() => {
        console.log('Auction with id: '+ auction.id+' has ended.');
      })
    }
  });
  return true;
}



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
    return sendAuctionMessages(auction, highestBidder);
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

/*
// This function updates the null image to a default image.
cron.schedule("* * * * *", () => {
  shicabalas = 15;
  console.log('About to add the default image to all auctions that havent got one');
  const url = 'http://localhost:3000';
  Auction.find().then(documents => {
    console.log('Documents size: ', documents.length);
    for (let index = 0; index < documents.length; index++) {
      if (documents[index].image === null) {
        documents[index].image = url + '/images/default-image.jpg';
        documents[index].save();
        console.log('Auction %', index, ' saved.');
      }
    }
  });
  console.log('Finished updating null images.');
})
*/

stopwords = ['amount','bid','Paypal','seller','information','contact','ebay','Ebay','i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']
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

// Training lsh
let lsh;
documents= [];
auctions = [];
cron.schedule("23 * * * *", () => {
  console.log("Geia sou")

  Auction.find().then(results => {
    for ( let i = 0; i < results.length/3; i++) {
      auctions.push(results[i]);
      text = '';
      text += results[i].name + ' '+ results[i].description + ' ';
      for (let j =0; j <results[i].categoryNames.length; j ++) {
        text += results[i].categoryNames[j] + ' ';
      }
      text = remove_stopwords(text);
      documents.push(text);
    }

    const config = {
      storage: 'memory',
      shingleSize: 7,
      numberOfHashFunctions: 30
    }
    lsh = Lsh.getInstance(config)

    const numberOfDocuments = results.length/3;

    for (let i = 0; i < numberOfDocuments; i += 1) {
      lsh.addDocument(i, documents[i])
    }
    console.log('scheduler re-trained lsh model');
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

  // Change categoryNames from a single string to an array
  let names = req.body.categoryNames;
  console.log(names);
  names = names.split('>');
  // We need to find the username of the sellerId
  const auction = new Auction({
    name: req.body.name,
    description: req.body.description,
    country: req.body.country,
    categoriesId: req.body.categoriesId,
    categoryNames: names,
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


exports.getUserAuctions = (req, res, next) => {
  const userId = req.params.id;
  // Search the auctions collection with sellerId = userId
  Auction.find({sellerId: userId})
  .then(documents => {
    res.status(200).json({
      message: 'Auctions fetched succesfully.',
      auctions: documents
    });
  })
}

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

exports.getRecommendations = (req, res, next) => {
  console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
  const userId = req.params.userId;

  Users.findOne({_id: userId}). then( user => {
    const q = {
      //id: 1,
      text: user.lastVisited,
      bucketSize: 6
    }
    console.log(user);
    if(user.lastVisited !== '') {
      const result = lsh.query(q)

      // this will print out documents which are candidates to be similar to the one we are looking for
      recommendations = [];
      let s = 0;
      for( let i = 0; i < result.length; i++) {
        if (s == 4) {break;}
        if(!user.lastVisitedIds.includes(auctions[result[i]]._id)) {
          recommendations.push(auctions[result[i]]);
          s++;
        }
      }
      console.log('eeeegw gamhthika gia sena');
     return res.status(200).json({
        message: 'got recommendations',
        recommendations: recommendations
      });
    }

    res.status(200).json({
      message: 'no recomendations'
    })

    })
}

function checkCategory(auction, catId) {
  if (catId !== 'null') {
    if (auction.categoriesId.includes(catId)) {
      console.log('----------------');
      console.log('Auction category: ', auction.categoriesId);
      console.log('catId: ', catId);
      console.log('---------------');
      return true;
    }
    console.log('Returning false');
    return false;
  } else {
    return true;
  }
}

function checkPrice(auction, sliderMinValue, sliderMaxValue, catId) {
  if (auction.buyPrice !== null) {
    if (parseFloat(auction.buyPrice) > sliderMinValue
        && parseFloat(auction.buyPrice) < sliderMaxValue) {
      //console.log('Passed price check' );
      return checkCategory(auction, catId);
    }
    } else {
      return checkCategory(auction, catId);
    }
}

exports.searchAuctions = (req, res, next) => {
  console.log('Lege re');
  console.log(shicabalas);
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.currentPage;
  const minValue = +req.query.minPrice;
  const maxValue = +req.query.maxPrice;
  const searchValue = req.query.searchValue.toLowerCase();
  const catId = req.query.catId;
  console.log('Reached searchAuctions in the backend.',minValue, maxValue, searchValue);
  console.log('Pagesize: ', pageSize, 'currentPage: ', currentPage);
  console.log('Category id: ', catId);
  console.log('Slider values:', minValue, maxValue);
  let auctionQuery = Auction.find();
  if (isNaN(minValue) && isNaN(maxValue)) {
    // Case where price range is max
    if (searchValue === '') {
      if (catId === 'null') {
        // Create a query with only price check
        auctionQuery = Auction.find();
      } else {
        // Create a create with price check and category check
        console.log('Category only check');
        auctionQuery = Auction.find({
          categoriesId: {$regex: catId },
        });
      }
    } else {
      if (catId === 'null') {
        // Create a query with searchValue and price check
        console.log('Kalispera sas.');
        auctionQuery = Auction.find({
          $or: [{ name: {$regex: searchValue, $options: 'i'} , description: {$regex: searchValue, $options: 'i'}, address: {$regex: searchValue, $options: 'i'}}]
        });
      } else {
        // Create a query with all checks
        auctionQuery = Auction.find({
          categoriesId: {$regex: catId },
          $or: [{ name: {$regex: searchValue, $options: 'i'} , description: {$regex: searchValue, $options: i}, address: {$regex: searchValue, $options: i}}]
        });
      }
    }
  } else if (isNaN(minValue)) {
    // Case where the minValue is 0
    if (searchValue === '') {
      if (catId === 'null') {
        // Create a query with only price check
        auctionQuery = Auction.find({
          $or: [{ buyPrice: { $lt: maxValue }}, {buyPrice: null}]
        });
      } else {
        // Create a create with price check and category check
        auctionQuery = Auction.find({
          categoriesId: {$regex: catId },
          $or: [{ buyPrice: { $lt: maxValue }}, {buyPrice: null}]
        });
      }
    } else {
      if (catId === 'null') {
        // Create a query with searchValue and price check
        auctionQuery = Auction.find({
          $or: [{ name: {$regex: searchValue, $options: 'i'} , description: {$regex: searchValue, $options: 'i'}, address: {$regex: searchValue, $options: 'i'}}],
          $or: [{ buyPrice: { $lt: maxValue }}, {buyPrice: null}]
        });
      } else {
        // Create a query with all checks
        auctionQuery = Auction.find({
          categoriesId: {$regex: catId },
          $or: [{ name: {$regex: searchValue, $options: 'i'}, description: {$regex: searchValue, $options: i}, address: {$regex: searchValue, $options: i}}],
          $or: [{ buyPrice: { $lt: maxValue }}, {buyPrice: null}]
        });
      }
    }
  } else {
    // Case where maxValue is max
    if (searchValue === '') {
      if (catId === 'null') {
        // Create a query with only price check
        auctionQuery = Auction.find({
          $or: [{buyPrice: { $gt: minValue }}, {buyPrice: null}]
        });
      } else {
        // Create a create with price check and category check
        auctionQuery = Auction.find({
          categoriesId: {$regex: catId },
          $or: [{buyPrice: { $gt: minValue }}, {buyPrice: null}]
        });
      }
    } else {
      if (catId === 'null') {
        // Create a query with searchValue and price check
        auctionQuery = Auction.find({
          $or: [{ name: {$regex: searchValue, $options: 'i'} , description: {$regex: searchValue, $options: 'i'}, address: {$regex: searchValue, $options: 'i'}}],
          $or: [{ buyPrice: { $gt: minValue }}, {buyPrice: null}]
        });
      } else {
        // Create a query with all checks
        auctionQuery = Auction.find({
          categoriesId: {$regex: catId },
          $or: [{ name: {$regex: searchValue, $options: 'i'} , description: {$regex: searchValue, $options: i}, address: {$regex: searchValue, $options: i}}],
          $or: [{ buyPrice: { $gt: minValue }}, {buyPrice: null}]
        });
      }
    }
  }
  console.log('About to run the query.');
  //console.log(auctionQuery);
  console.log('--------------------------------------');
  auctionQuery.then(documents => {
    console.log('Query was completed. About to slice it.');
    //console.log(documents[0]);
    const count = documents.length;
    const filteredAuctions = documents.slice(pageSize * (currentPage - 1), (pageSize * currentPage));
    console.log('Slicing is completed.');
    //console.log(filteredAuctions);
    res.status(200).json({
      message: 'Search fetched auctions succesfully',
      auctions: filteredAuctions,
      auctionCount: count
    });
  });
}


exports.getSingleAuction = (req, res, next) => {
  console.log("In edit method. reached the right backend function. req.params.id: ",req.params.id);
  Auction.findById(req.params.id).then(auction => {
    if (auction) {
      // Update the sellerRating from the user's database
      Users.findById(auction.sellerId).then(user => {
        if (user) {
          auction.sellerRating = user.sellerRating;
        } else {
          auction.sellerRating = 0;
        }
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


function takeLastWord(address) {
  var n = address.trim().split(' ');
  return n[n.length - 1];
}


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
    // Create a bid schema and add it
    Users.findById(req.body.id).then(user => {
      const tcountry = takeLastWord(user.address);
      console.log(tcountry);
      console.log(user.address);
      const bid = {
        amount: req.body.bid,
        time: new Date(),
        bidderId: req.body.id,
        bidderUsername: user.username,
        bidderRating: user.buyerRating,
        location: user.address,
        country: tcountry
      };
      // Check if there are any bids
      if (auction.bids === null) {
        // Create a bid schema and push the new bid
        auction.bids = bid;
        // Update the highest bid, the first bid and the number of bids.
        auction.highestBid = req.body.bid;
        auction.firstBid = req.body.bid;
        auction.numberOfBids = 1;
      } else {
        // Check if the bid is valid and update the bids in the schema
        if (req.body.bid > auction.highestBid) {
          auction.bids.push(bid);
          // Then update the number of bids and the highestBid
          auction.highestBid = req.body.bid;
          auction.numberOfBids ++;

          // Check if the bid is higher than the buyPrice
          if (auction.buyPrice) {
            if (parseFloat(req.body.bid) >= parseFloat(auction.buyPrice)) {
              sendAuctionMessages(auction, req.body.id);
              res.status(200).json({
                message: 'Your bid has been submitted succesfully. It\'s higher than the buyPrice so you win!'
              })
            }
          }
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
      path.unshift({id: item._id, name: item.name});
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

exports.rateUser = (req, res, next) => {
  const rating = req.body.rating;
  const type = req.body.type;
  let userId = req.params.id;
  // Find the auction
  Users.findById(userId).then(user => {
      // Depending on the type, update the rating
      if (type === 'seller') {
        const totalVotes = user.sellerRatingVotes;
        if (totalVotes <= 0) {
          user.sellerRating = rating;
          user.sellerRatingVotes = 1;
        } else {
          user.sellerRating = user.sellerRating + ((rating - user.sellerRating) / (totalVotes + 1));
          user.sellerRatingVotes ++;
        }
      } else {
        const totalVotes = user.buyerRatingVotes;
        if (totalVotes <= 0) {
          user.buyerRating = rating;
          user.buyerRatingVotes = 1;
        } else {
          user.buyerRating = user.buyerRating +  ((rating - user.buyerRating )/ (totalVotes + 1));
          user.buyerRatingVotes ++;
        }
      }
      // Then save the user and send back a response
      user.save().then(() => {
        res.status(200).json({
          message: 'Rating was updated succesfully.'
        });
      })
  })
  .catch(() => {
    res.status(500).json({
      message: 'User was not found'
    })
  })
}
