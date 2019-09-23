const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
 title: { type: String, required: true},
 content: {type: String, required: true},
 from: {type: String, ref: 'User.username'},
 fromId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
 to: {type: String, ref: 'User.username', required: true},
 toId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
 isRead: {type: Boolean, default: false},
 timestamp: {type: Date, default: Date.now},
 senderDeleted: {type: Boolean, default: false},
 receiverDeleted: {type: Boolean, default: false},
 rating: {type: String, default: null }
});

module.exports = mongoose.model('Message',messageSchema);
