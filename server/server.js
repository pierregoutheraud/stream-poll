let express =    require('express'),
    mongoose =   require('mongoose'),
    path =       require('path'),
    os =         require('os'),
    bodyParser = require('body-parser'),
    _ = require('underscore');

let app = express(),
    router = express.Router();

app.use(express.static('build')); // use build file as statics

// Mongo Models
let PollModel = require('./models/PollModel.js'),
    OptionModel = require('./models/OptionModel.js');

// Classes
let Database = require('./Database.js');

const FILES_PATH = path.normalize(__dirname + '/files');
const TEMP_PATH = path.normalize(__dirname + '/temp');

let os_hostname = os.hostname();

const MONGOOSE_CONNECT = 'mongodb://pierre:microst7@apollo.modulusmongo.net:27017/iqYj5uto';
let connection = mongoose.connect(MONGOOSE_CONNECT);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  return next();
});

app.use(bodyParser.json())

/* Websocket API */

class User {

  constructor (data, socket) {
    this.id = data.id;
    this.username = data.username;
    this.streamer = data.streamer;
    this.socket = socket;
    this.polls = [];
  }

  subscribeToStreamer (streamerUsername) {
    this.subscribeToStreamer = streamerUsername;
  }

}

class Api {

  constructor(server, db) {
    this.users = [];
    this.db = db;
    this.start();
  }

  start() {

    let io = require('socket.io')(server);
    io.on('connection', (socket) => {

      console.log('Socket connected!');

      let user;

      socket.on('user:new', (data) => {
        console.log('new user', data);
        user = new User(data, socket);
        this.users.push(user);
        socket.emit('user:new', data);
      });

      /* New POLL */
      socket.on('poll:new', (data) => {

        let { question, options } = data;

        console.log( question, options );

        let poll = new PollModel({
          question: question
        });

        this.db.saveOptionsAndPoll(options, poll, () => {
          this.db.savePoll(poll).then((poll) => {

            user.polls.push(poll); // Save poll of streamer
            socket.emit('poll:new', poll);
            this.notifySubscribers(user, poll);

          });
        });

      });

      /* Get Poll */
      socket.on('poll:get', (data) => {

        let poll_id = data.poll_id;

        let query = PollModel.findOne().where('_id').equals(poll_id).populate('options')
        query.exec().addBack((err, poll) => {
          if (err) console.error(err)

          if (!poll) {
            // res.status(404).json({
            //   error: 'Poll not found'
            // });
          }
          else {
            socket.emit('poll:get', poll);
          }
        });

      });

      /* Vote */
      socket.on('vote:new', (data) => {

        let { option_id, poll_id, value } = data;

        if (typeof poll_id === 'undefined') {
          res.json({ error: 'Missing parameters.' });
          return false;
        }

        if (typeof value !== 'undefined') {

          console.log('Create new option and save it to poll');

          let query = PollModel.findOne().where('_id').equals(poll_id);
          query.exec().addBack((err, poll) => {
            let options = [value];
            this.db.saveOptionsAndPoll(options, poll, (options) => { // Save option and vote at same time with last param at true
              let option = options[0]; // Since we only saved 1 new option
              this.db.savePoll(poll).then((poll) => {
                socket.emit('vote:new', option);
                this.newVote(poll_id, option);
              });
            }, true);
          });

        } else {

          console.log('Existing option, we vote for it');

          this.db.vote(option_id, (option) => {
            socket.emit('vote:new', option);
            this.newVote(poll_id, option);
          });

        }

      });

      socket.on('subscribeTo:poll', (data) => {
        user.poll_id = data.id;
        console.log('user subscribed to poll', user.socket.id);
      });

      socket.on('subscribeTo:streamer', (streamer) => {
        user.subscribeToStreamer(streamer.username);
        this.notifySubscriber(user);
        console.log('user subscribed to streamer', streamer.username);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected.');
        this.removeUser(user);
      });

    });

  }

  notifySubscriber (user) {
    console.log(this.users);
    let streamer = _.findWhere(this.users, {username: user.subscribeToStreamer});

    // If streamer is connected
    if (streamer) {

      let lastPoll = streamer.polls[ streamer.polls.length - 1 ]; // get current poll (last one)

      // If at least one poll created
      if (lastPoll) {
        user.socket.emit('streamer:newPoll', {
          _id: lastPoll._id
        });
      }
    }
  }

  notifySubscribers (streamer, poll) {

    let subscribers = _.where(this.users, {subscribeToStreamer: streamer.username});
    subscribers.forEach((subscriber, i) => {
      console.log('subscriber ' + subscriber.socket.id + ' has been notified about new poll ' + poll._id);
      subscriber.socket.emit('streamer:newPoll', {
        poll: poll
      });
    });

  }

  newVote(poll_id, option) {
    console.log('new vote !');
    for (let i=0,l=this.users.length;i<l;i++) {
      let user = this.users[i];
      if (user.poll_id == poll_id) {
        user.socket.emit('poll:update', option);
      }
    }
  }

  removeUser (user) {
    if (typeof user === 'undefined') return false;
    for (let i=0,l=this.users.length;i<l;i++) {
      if (user.socket.id == this.users[i].socket.id) {
        console.log('remove poll !', i);
        this.users.splice(i,1);
        break;
      }
    }
  }

}

let server_port = process.env.PORT || 10000;
// let server_host = process.env.YOUR_HOST || '0.0.0.0';
let server = app.listen(server_port, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log(`Listening at ${host}:${port}`);
});

// Every routes to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'))
});

// socketService.start(server);
let db = new Database();
let api = new Api(server, db);
