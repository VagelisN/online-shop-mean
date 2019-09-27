const mongoose = require('mongoose');

const bidSchema = mongoose.Schema({
  amount: Number,
  time: Date, //This will change to a date data type
  bidderId: String,
  bidderUsername: String,
  bidderRating: Number,
  location: String,
  country: String
});


const auctionSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: ''},
  categoriesId: {type: String, required: true},
  categoryNames: {type: [String], required: true},
  country: {type: String, required: true},
  buyPrice: {type: String},
  firstBid: {type: Number, default: 0},
  highestBid: {type: String, default: 0},
  numberOfBids: {type: Number,default: 0},
  bids: [bidSchema],
  latitude: {type: String},
  longitude: {type: String},
  image: {type: String},
  startDate: {type: Date},
  endDate: {type: String},
  sellerId: {type: String},
  sellerUsername: {type: String},
  sellerRating: {type: Number},
  address: {type: String},
  isFinished: {type: Boolean, default: false}
});

module.exports = mongoose.model('Auction', auctionSchema);
