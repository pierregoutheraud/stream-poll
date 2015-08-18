let mongoose = require('mongoose'),
    { Schema } = mongoose,
    shortId = require('shortid');

let OptionSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortId.generate
  },
  vote: Number
});

module.exports = mongoose.model('Option', OptionSchema);
