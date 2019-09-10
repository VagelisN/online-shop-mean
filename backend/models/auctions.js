const mongoose = require('mongoose');

const Bidder = {
  userId : String,
  rating: Number,
  location: String,
  country: String
};

const Bid = {
  amount: Number,
  time: String, //This will change to a date data type
  bidder: Bidder
};

const Seller = {
  userId: String,
  sellerRating: Number
};


const auctionSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true},
  category: {type: String, required: true},
  country: {type: String, required: true},
  buyPrice: {type: String},
  firstBid: {type: Bid},
  highestBid: {type: String },
  numberOfBids: {type: Number},
  bids: [{ bid: Bid }],
  latitude: {type: String, required: true},
  longitude: {type: String, required: true},
  image: {type: String},
  startDate: {type: Date},
  endDate: {type: String},
  seller: {type: Seller},
  address: {type: String}
});

module.exports = mongoose.model('Auction', auctionSchema);
