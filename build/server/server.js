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
    this.polls = [];
  }

  _createClass(User, [{
    key: 'subscribeToStreamer',
    value: function subscribeToStreamer(streamerUsername) {
      this.subscribeToStreamer = streamerUsername;
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
        });

        /* New POLL */
        socket.on('poll:new', function (data) {
          var question = data.question;
          var options = data.options;

          console.log(question, options);

          var poll = new PollModel({
            question: question
          });

          _this.db.saveOptionsAndPoll(options, poll, function () {
            _this.db.savePoll(poll).then(function (poll) {

              user.polls.push(poll); // Save poll of streamer
              socket.emit('poll:new', poll);
              _this.notifySubscribers(user, poll);
            });
          });
        });

        /* Get Poll */
        socket.on('poll:get', function (data) {

          var poll_id = data.poll_id;

          var query = PollModel.findOne().where('_id').equals(poll_id).populate('options');
          query.exec().addBack(function (err, poll) {
            if (err) console.error(err);

            if (!poll) {
              // res.status(404).json({
              //   error: 'Poll not found'
              // });
            } else {
                socket.emit('poll:get', poll);
              }
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
              _this.db.saveOptionsAndPoll(options, poll, function (options) {
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
          console.log('user subscribed to poll', user.socket.id);
        });

        socket.on('subscribeTo:streamer', function (streamer) {
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
    key: 'notifySubscriber',
    value: function notifySubscriber(user) {
      console.log(this.users);
      var streamer = _.findWhere(this.users, { username: user.subscribeToStreamer });

      // If streamer is connected
      if (streamer) {

        var lastPoll = streamer.polls[streamer.polls.length - 1]; // get current poll (last one)

        // If at least one poll created
        if (lastPoll) {
          user.socket.emit('streamer:newPoll', {
            _id: lastPoll._id
          });
        }
      }
    }
  }, {
    key: 'notifySubscribers',
    value: function notifySubscribers(streamer, poll) {

      var subscribers = _.where(this.users, { subscribeToStreamer: streamer.username });
      subscribers.forEach(function (subscriber, i) {
        console.log('subscriber ' + subscriber.socket.id + ' has been notified about new poll ' + poll._id);
        subscriber.socket.emit('streamer:newPoll', {
          _id: poll._id
        });
      });
    }
  }, {
    key: 'newVote',
    value: function newVote(poll_id, option) {
      console.log('new vote !');
      for (var i = 0, l = this.users.length; i < l; i++) {
        var user = this.users[i];
        if (user.poll_id == poll_id) {
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
          console.log('remove poll !', i);
          this.users.splice(i, 1);
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