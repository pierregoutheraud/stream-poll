let mongoose = require('mongoose'),
    { Schema } = mongoose,
    shortId = require('shortid');

let PollSchema = new Schema({
  __v: { type: Number, select: false },
  _id: {
    type: String,
    unique: true,
    'default': shortId.generate
  },
  created_at : {
    type: Date,
    default: Date.now
  },
  question: String,
  options: [{type: String, ref: 'Option'}],
  username: String
}, { versionKey: false });

module.exports = mongoose.model('Poll', PollSchema);
