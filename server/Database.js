let PollModel = require('./models/PollModel.js'),
    OptionModel = require('./models/OptionModel.js');

class Database {

  findLastPollByUsername (username) {
    return new Promise((resolve, reject) => {

      let query = PollModel.findOne()
                            .sort('-created_at')
                            .where('username')
                            .equals(username)
                            .populate('options');

      query.exec().addBack((err, poll) => {
        if (err) console.error(err)
        resolve(poll);
      });
    });
  }

  savePoll (poll) {
    return new Promise((resolve, reject) => {
      console.log('saving poll...');
      poll.save(function(err, poll){
        if (err) reject(err);
        PollModel.populate(poll, {path:"options"}, function(err, poll) {
          if (err) reject(err);
          console.log('poll saved. RESOLVE :O');
          resolve(poll);
        });
      });
    });
  }

  // Save options from array and push them to poll
  saveOptions (optionsToSave, poll, callback, vote=false, optionsSaved=[]) {
    console.log(`saveOptionsAndPoll [${optionsSaved.length}]`);
    let optionValue = optionsToSave[optionsSaved.length]; // we get first option value of queue
    let option = new OptionModel({
      value: optionValue,
      votes: vote ? 1 : 0
    });
    console.log('Saving option '+optionValue+'...');
    option.save((err, option) => {
      console.log('option '+optionValue+' saved.');
      optionsSaved.push(option);
      poll.options.push(option._id);

      console.log( 'optionsToSave[optionsSaved.length]', optionsToSave[optionsSaved.length], optionsSaved.length );

      if (optionsToSave[optionsSaved.length]) {

        console.log('this.saveOptionsAndPoll');

        this.saveOptions(optionsToSave, poll, callback, vote, optionsSaved);
      } else {
        callback(optionsSaved);
      }
    });
  }

  vote ( option_id, callback ) {
    console.log( 'vote for ' + option_id );
    let query = OptionModel.findOne().where('_id').equals(option_id);
    query.exec().addBack((err, option) => {
      console.log(option);
      option.votes++;
      option.save(function(err, option){
        callback(option);
      });
    });
  }

}

module.exports = Database;
