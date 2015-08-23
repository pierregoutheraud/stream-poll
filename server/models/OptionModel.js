'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortId = require('shortid');

var OptionSchema = new Schema({
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