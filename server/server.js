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

const os_hostname = os.hostname();

mongoose.connection.on("open", function(ref) {
  console.log("Connected to mongo server.");
});

mongoose.connection.on("error", function(err) {
  console.err("Could not connect to mongo server!", err);
});

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
    // this.polls = []; // Maybe later ?
  }

  subscribeToStreamer (streamerUsername) {
    // Subscribe to streamer
    this.subscribedToStreamer = streamerUsername;
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
        this.notifySubscribersOf(user, {connected: true});
      });

      /* New POLL */
      socket.on('poll:new', (data) => {

        let { question, options, username } = data;

        let poll = new PollModel({
          question: question,
          username: username
        });

        this.db.saveOptions(options, poll, () => {
          this.db.savePoll(poll).then((poll) => {

            // user.polls.push(poll); // Save poll of streamer
            socket.emit('poll:new', poll);
            this.notifySubscribersOf(user, {poll});

          });
        });

      });

      /* Get Poll */
      socket.on('poll:get', (data) => {

        console.log('poll:get', data);

        this.db.findLastPollByUsername(data.username).then((poll) => {
          console.log('poll:get', poll);
          socket.emit('poll:get', poll);
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
            this.db.saveOptions(options, poll, (options) => { // Save option and vote at same time with last param at true
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
        console.log('user subscribed to poll', data);
      });

      socket.on('subscribeTo:streamer', (streamer) => {

        /*
        // Check if streamer is connected
        if (this.getUserByUsername(streamer.username)) {
          user.socket.emit('streamer:connected', true);
        } else {
          user.socket.emit('streamer:connected', false);
        }
        */

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

  getUserByUsername (username) {
    return _.findWhere(this.users, {username: username});
  }

  notifySubscriber (user) {
    // console.log(this.users);
    let streamer = this.getUserByUsername(user.subscribedToStreamer);

    this.db.findLastPollByUsername(user.subscribedToStreamer).then((poll,) => {

      let data = {
        poll: poll,
        connected: streamer ? true : false
      };

      console.log('streamer:update', data);

      user.socket.emit('streamer:update', data);

    });

  }

  notifySubscribersOf (streamer, data) {
    let subscribers = _.where(this.users, {subscribedToStreamer: streamer.username});
    subscribers.forEach((subscriber, i) => {
      console.log('subscriber ' + subscriber.socket.id + ' has been notified about', data);
      subscriber.socket.emit('streamer:update', data);
    });
  }

  newVote (poll_id, option) {
    console.log('new vote !');
    for (let i=0,l=this.users.length;i<l;i++) {
      let user = this.users[i];
      // console.log(user, this.users);
      console.log(user.id);
      if (user.poll_id == poll_id) {
        console.log('poll:update to ', user.id);
        user.socket.emit('poll:update', option);
      }
    }
  }

  removeUser (user) {
    if (typeof user === 'undefined') return false;
    for (let i=0,l=this.users.length;i<l;i++) {
      if (user.socket.id == this.users[i].socket.id) {
        console.log('remove user !', i);
        this.users.splice(i,1);
        this.notifySubscribersOf(user, {connected:false});
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
