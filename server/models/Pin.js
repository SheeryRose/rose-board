const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Pin', pinSchema);