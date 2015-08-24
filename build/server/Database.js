'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var PollModel = require('./models/PollModel.js'),
    OptionModel = require('./models/OptionModel.js');

var DataBase = (function () {
  function DataBase() {
    _classCallCheck(this, DataBase);
  }

  _createClass(DataBase, [{
    key: 'savePoll',
    value: function savePoll(poll) {
      return new Promise(function (resolve, reject) {
        console.log('saving poll...');
        poll.save(function (err, poll) {
          if (err) reject(err);
          PollModel.populate(poll, { path: "options" }, function (err, poll) {
            if (err) reject(err);
            console.log('poll saved. RESOLVE :O');
            resolve(poll);
          });
        });
      });
    }

    // Save options from array and push them to poll
  }, {
    key: 'saveOptionsAndPoll',
    value: function saveOptionsAndPoll(optionsToSave, poll, callback) {
      var _this = this;

      var vote = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
      var optionsSaved = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];

      console.log('saveOptionsAndPoll [' + optionsSaved.length + ']');
      var optionValue = optionsToSave[optionsSaved.length]; // we get first option value of queue
      var option = new OptionModel({
        value: optionValue,
        votes: vote ? 1 : 0
      });
      console.log('Saving option ' + optionValue + '...');
      option.save(function (err, option) {
        console.log('option ' + optionValue + ' saved.');
        optionsSaved.push(option);
        poll.options.push(option._id);

        console.log('optionsToSave[optionsSaved.length]', optionsToSave[optionsSaved.length], optionsSaved.length);

        if (optionsToSave[optionsSaved.length]) {

          console.log('this.saveOptionsAndPoll');

          _this.saveOptionsAndPoll(optionsToSave, poll, callback, vote, optionsSaved);
        } else {
          callback(optionsSaved);
        }
      });
    }
  }, {
    key: 'vote',
    value: function vote(option_id, callback) {
      console.log('vote for ' + option_id);
      var query = OptionModel.findOne().where('_id').equals(option_id);
      query.exec().addBack(function (err, option) {
        console.log(option);
        option.votes++;
        option.save(function (err, option) {
          callback(option);
        });
      });
    }
  }]);

  return DataBase;
})();

module.exports = DataBase;