const mongoose = require('mongoose');

// npm install --save mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  // unique doesnt validate without unique-validator
  username: {type: String, required: true, unique: true},
  firstname: {type: String },
  lastname: {type: String },
  email: {type: String, required: true, unique: true},
  phone: {type: String},
  longitude: String,
  latitude: String,
  address: String,
  afm: {type: String},
  password: {type: String, required: true},
  sellerRating: {type: Number, default: 0},
  sellerRatingVotes: {type: Number, default: 0},
  buyerRating: {type: Number, default: 0},
  buyerRatingVotes: {type: Number, default: 0},
  verified: {type: Boolean, required: true},
  lastVisitedIds: {type: String, default: ''},
  lastVisited: {type: String, default: ''}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User',userSchema);
