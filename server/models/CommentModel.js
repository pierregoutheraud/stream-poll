let mongoose = require('mongoose'),
    { Schema } = mongoose,
    shortId = require('shortid');

let CommentSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortId.generate
  },
  video_id: String,
  message: String,
  username: String,
  at: Number,
  time: Number,
  up: Number,
  down: Number,
  score: Number
});

module.exports = mongoose.model('Comment', CommentSchema);
