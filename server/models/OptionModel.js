let mongoose = require('mongoose'),
    { Schema } = mongoose,
    shortId = require('shortid');

let OptionSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortId.generate
  },
  value: String,
  vote: Number
});

module.exports = mongoose.model('Option', OptionSchema);
