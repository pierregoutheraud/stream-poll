let mongoose = require('mongoose'),
    { Schema } = mongoose,
    shortId = require('shortid');

let PollSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortId.generate
  },
  question: String,
  options: [{type: String, ref: 'Option'}]
});

module.exports = mongoose.model('Poll', PollSchema);
