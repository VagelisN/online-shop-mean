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
  location: {type: [Number] },
  afm: {type: Number},
  password: {type: String, required: true}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User',userSchema);
