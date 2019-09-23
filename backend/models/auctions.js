const mongoose = require('mongoose');

const bidSchema = mongoose.Schema({
  amount: Number,
  time: Date, //This will change to a date data type
  bidder: String
});


const auctionSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true},
  categoriesId: {type: String, required: true},
  categoryNames: {type: [String], required: true},
  country: {type: String, required: true},
  buyPrice: {type: String},
  firstBid: {type: Number},
  highestBid: {type: String },
  numberOfBids: {type: Number},
  bids: [bidSchema],
  latitude: {type: String, required: true},
  longitude: {type: String, required: true},
  image: {type: String},
  startDate: {type: Date},
  endDate: {type: String},
  sellerId: {type: String},
  sellerRating: {type: Number},
  address: {type: String}
});

module.exports = mongoose.model('Auction', auctionSchema);
