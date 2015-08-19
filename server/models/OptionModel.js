let mongoose = require('mongoose'),
    { Schema } = mongoose,
    shortId = require('shortid');

let OptionSchema = new Schema({
  __v: { type: Number, select: false },
  _id: {
    type: String,
    unique: true,
    'default': shortId.generate
  },
  value: String,
  votes: Number
}, { versionKey: false });

module.exports = mongoose.model('Option', OptionSchema);
