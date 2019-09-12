const mongoose = require('mongoose');

// npm install --save mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');

const categorySchema = mongoose.Schema({
  // unique doesnt validate without unique-validator
  name: { type: String, required: true},
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null}
});

categorySchema.plugin(uniqueValidator);

module.exports = mongoose.model('Category',categorySchema);
