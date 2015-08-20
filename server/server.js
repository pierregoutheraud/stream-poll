let express =    require('express'),
    mongoose =   require('mongoose'),
    path =       require('path'),
    os =         require('os'),
    bodyParser = require('body-parser'),
    socketService = require('./socketService');

let app = express(),
    router = express.Router();

// Models
let PollModel = require('./models/PollModel.js');
let OptionModel = require('./models/OptionModel.js');

const FILES_PATH = path.normalize(__dirname + '/files');
const TEMP_PATH = path.normalize(__dirname + '/temp');

let os_hostname = os.hostname();

const MONGOOSE_CONNECT = 'mongodb://pierre:microst7@apollo.modulusmongo.net:27017/iqYj5uto';
var connection = mongoose.connect(MONGOOSE_CONNECT);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  return next();
});

app.use(bodyParser.json())

let savePoll = function(poll) {
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
};

// Save options from array and push them to poll
let saveOptionsAndPoll = function(optionsToSave, poll, callback, vote=false, optionsSaved=[]) {
  console.log(`saveOptionsAndPoll [${optionsSaved.length}]`);
  let optionValue = optionsToSave[optionsSaved.length]; // we get first option value of queue
  let option = new OptionModel({
    value: optionValue,
    votes: vote ? 1 : 0
  });
  console.log('Saving option '+optionValue+'...');
  option.save(function(err, option){
    console.log('option '+optionValue+' saved.');
    optionsSaved.push(option);
    poll.options.push(option._id);
    if (optionsToSave[optionsSaved.length]) {
      saveOptionsAndPoll(optionsToSave, poll, callback, vote, optionsSaved);
    } else {
      callback(optionsSaved);
    }
  });
}

router.route('/poll')

  .post(function(req,res) {

    let { question, options } = req.body;

    let poll = new PollModel({
      question: question
    });

    saveOptionsAndPoll(options, poll, function(){
      savePoll(poll).then((poll) => {
        res.json(poll);
      });
    });

  });

router.route('/poll/:id')

  .get(function(req, res, next) {

    let poll_id = req.params.id;
    let query = PollModel.findOne().where('_id').equals(poll_id).populate('options')
    query.exec().addBack((err, poll) => {
      if (err) console.error(err)

      if (!poll) {
        res.status(404).json({
          error: 'Poll not found'
        });
      }
      else {
        res.json(poll);
      }
    });

  });

let vote = function ( option_id, callback ) {
  console.log( 'vote for ' + option_id );
  let query = OptionModel.findOne().where('_id').equals(option_id);
  query.exec().addBack((err, option) => {
    console.log(option);
    option.votes++;
    option.save(function(err, option){
      callback(option);
    });
  });
};

router.route('/vote')

  // Vote
  .post(function(req, res, next) {

    let { option_id, poll_id, value } = req.body;

    if (typeof value !== 'undefined') {

      console.log('Create new option and save it to poll');

      let query = PollModel.findOne().where('_id').equals(poll_id);
      query.exec().addBack((err, poll) => {
        let options = [value];
        saveOptionsAndPoll(options, poll, function(options){ // Save option and vote at same time with last param at true
          let option = options[0]; // Since we only saved 1 new option
          savePoll(poll).then((poll) => {
            res.json(option);
            socketService.newVote(poll_id, option_id, option.votes);

          });
        }, true);
      });

    } else {

      console.log('Existing option, we vote for it');

      vote(option_id, function(option){
        res.json(option);
        socketService.newVote(poll_id, option_id, option.votes);
      });

    }

  });

app.use('/api', router);

let server = app.listen(10000, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log(`Listening at http://127.0.0.1:${port}/api`);
});

socketService.start(server);
