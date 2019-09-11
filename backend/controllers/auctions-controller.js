const Auction = require('./../models/auctions');

exports.createAuction =  (req, res, next) => {
  console.log("",req.body.endDate);
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
    seller: null // Edw na vrw pws tha valw to seller id kai to rating
  });
  auction.save().then( createdAuction => {
    res.status(201).json({
      message: 'Auction added succesfully',
      auctionId: createdAuction._id,
      imagePath: createdAuction.imagePath
    });
  })
};

exports.getAuctions = (req, res, next) => {
  console.log("Reached the backend");
  Auction.find().then( documents => {
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
      const endDate = new Date(tempEndDate[2], tempEndDate[0] - 1, tempEndDate[1]);
      var today = Date();
      console.log("endDate: ", endDate);
      console.log("startDate: ", today);
      var query = { _id: req.params.id };
      var newValue = { $set: { startDate: today } };
      Auction.updateOne(query, newValue, () => {
        console.log("Started an auction");
        res.status(201).json({
          message: "Auction started succesfully."
        });
      })
    } else {
      console.log("StartDate is not null.");
      // If the auction has already started return a corresponding message
      res.starus(404).json({
        message: "Auction has already been started."
      });
    }
  })
};
