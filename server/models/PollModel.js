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
  question: String,
  options: [{type: String, ref: 'Option'}]
}, { versionKey: false });

module.exports = mongoose.model('Poll', PollSchema);
