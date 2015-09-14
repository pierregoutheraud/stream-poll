'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var express = require('express'),
    mongoose = require('mongoose'),
    path = require('path'),
    os = require('os'),
    bodyParser = require('body-parser'),
    _ = require('underscore');

var app = express(),
    router = express.Router();

app.use(express['static']('build')); // use build file as statics

// Mongo Models
var PollModel = require('./models/PollModel.js'),
    OptionModel = require('./models/OptionModel.js');

// Classes
var Database = require('./Database.js');

var FILES_PATH = path.normalize(__dirname + '/files');
var TEMP_PATH = path.normalize(__dirname + '/temp');

var os_hostname = os.hostname();

mongoose.connection.on("open", function (ref) {
  console.log("Connected to mongo server.");
});

mongoose.connection.on("error", function (err) {
  console.err("Could not connect to mongo server!", err);
});

var MONGOOSE_CONNECT = 'mongodb://pierre:microst7@apollo.modulusmongo.net:27017/iqYj5uto';
var connection = mongoose.connect(MONGOOSE_CONNECT);

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  return next();
});

app.use(bodyParser.json());

/* Websocket API */

var User = (function () {
  function User(data, socket) {
    _classCallCheck(this, User);

    this.id = data.id;
    this.username = data.username;
    this.streamer = data.streamer;
    this.socket = socket;
    // this.polls = []; // Maybe later ?
  }

  _createClass(User, [{
    key: 'subscribeToStreamer',
    value: function subscribeToStreamer(streamerUsername) {
      // Subscribe to streamer
      this.subscribedToStreamer = streamerUsername;
    }
  }]);

  return User;
})();

var Api = (function () {
  function Api(server, db) {
    _classCallCheck(this, Api);

    this.users = [];
    this.db = db;
    this.start();
  }

  _createClass(Api, [{
    key: 'start',
    value: function start() {
      var _this = this;

      var io = require('socket.io')(server);
      io.on('connection', function (socket) {

        console.log('Socket connected!');

        var user = undefined;

        socket.on('user:new', function (data) {
          console.log('new user', data);
          user = new User(data, socket);
          _this.users.push(user);
          socket.emit('user:new', data);
          _this.notifySubscribersOf(user, { connected: true });
        });

        /* New POLL */
        socket.on('poll:new', function (data) {
          var question = data.question;
          var options = data.options;
          var username = data.username;

          var poll = new PollModel({
            question: question,
            username: username
          });

          _this.db.saveOptions(options, poll, function () {
            _this.db.savePoll(poll).then(function (poll) {

              // user.polls.push(poll); // Save poll of streamer
              socket.emit('poll:new', poll);
              _this.notifySubscribersOf(user, { poll: poll });
            });
          });
        });

        /* Get Poll */
        socket.on('poll:get', function (data) {

          console.log('poll:get', data);

          _this.db.findLastPollByUsername(data.username).then(function (poll) {
            console.log('poll:get', poll);
            socket.emit('poll:get', poll);
          });
        });

        /* Vote */
        socket.on('vote:new', function (data) {
          var option_id = data.option_id;
          var poll_id = data.poll_id;
          var value = data.value;

          if (typeof poll_id === 'undefined') {
            res.json({ error: 'Missing parameters.' });
            return false;
          }

          if (typeof value !== 'undefined') {

            console.log('Create new option and save it to poll');

            var query = PollModel.findOne().where('_id').equals(poll_id);
            query.exec().addBack(function (err, poll) {
              var options = [value];
              _this.db.saveOptions(options, poll, function (options) {
                // Save option and vote at same time with last param at true
                var option = options[0]; // Since we only saved 1 new option
                _this.db.savePoll(poll).then(function (poll) {
                  socket.emit('vote:new', option);
                  _this.newVote(poll_id, option);
                });
              }, true);
            });
          } else {

            console.log('Existing option, we vote for it');

            _this.db.vote(option_id, function (option) {
              socket.emit('vote:new', option);
              _this.newVote(poll_id, option);
            });
          }
        });

        socket.on('subscribeTo:poll', function (data) {
          user.poll_id = data.id;
          console.log('user subscribed to poll', data);
        });

        socket.on('subscribeTo:streamer', function (streamer) {

          /*
          // Check if streamer is connected
          if (this.getUserByUsername(streamer.username)) {
            user.socket.emit('streamer:connected', true);
          } else {
            user.socket.emit('streamer:connected', false);
          }
          */

          user.subscribeToStreamer(streamer.username);
          _this.notifySubscriber(user);
          console.log('user subscribed to streamer', streamer.username);
        });

        socket.on('disconnect', function () {
          console.log('Socket disconnected.');
          _this.removeUser(user);
        });
      });
    }
  }, {
    key: 'getUserByUsername',
    value: function getUserByUsername(username) {
      return _.findWhere(this.users, { username: username });
    }
  }, {
    key: 'notifySubscriber',
    value: function notifySubscriber(user) {
      // console.log(this.users);
      var streamer = this.getUserByUsername(user.subscribedToStreamer);

      this.db.findLastPollByUsername(user.subscribedToStreamer).then(function (poll) {

        var data = {
          poll: poll,
          connected: streamer ? true : false
        };

        console.log('streamer:update', data);

        user.socket.emit('streamer:update', data);
      });
    }
  }, {
    key: 'notifySubscribersOf',
    value: function notifySubscribersOf(streamer, data) {
      var subscribers = _.where(this.users, { subscribedToStreamer: streamer.username });
      subscribers.forEach(function (subscriber, i) {
        console.log('subscriber ' + subscriber.socket.id + ' has been notified about', data);
        subscriber.socket.emit('streamer:update', data);
      });
    }
  }, {
    key: 'newVote',
    value: function newVote(poll_id, option) {
      console.log('new vote !');
      for (var i = 0, l = this.users.length; i < l; i++) {
        var user = this.users[i];
        // console.log(user, this.users);
        console.log(user.id);
        if (user.poll_id == poll_id) {
          console.log('poll:update to ', user.id);
          user.socket.emit('poll:update', option);
        }
      }
    }
  }, {
    key: 'removeUser',
    value: function removeUser(user) {
      if (typeof user === 'undefined') return false;
      for (var i = 0, l = this.users.length; i < l; i++) {
        if (user.socket.id == this.users[i].socket.id) {
          console.log('remove user !', i);
          this.users.splice(i, 1);
          this.notifySubscribersOf(user, { connected: false });
          break;
        }
      }
    }
  }]);

  return Api;
})();

var server_port = process.env.PORT || 10000;
// let server_host = process.env.YOUR_HOST || '0.0.0.0';
var server = app.listen(server_port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at ' + host + ':' + port);
});

// Every routes to index.html
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// socketService.start(server);
var db = new Database();
var api = new Api(server, db);