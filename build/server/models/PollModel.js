'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortId = require('shortid');

var PollSchema = new Schema({
  __v: { type: Number, select: false },
  _id: {
    type: String,
    unique: true,
    'default': shortId.generate
  },
  question: String,
  options: [{ type: String, ref: 'Option' }]
}, { versionKey: false });

module.exports = mongoose.model('Poll', PollSchema);