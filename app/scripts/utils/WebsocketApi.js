import request from 'superagent';
import CONFIG from 'config/config.js';
import log from 'utils/log.js';
import user from 'Models/User.js';

class Api {

  constructor () {
    this.socket = io.connect(CONFIG.SOCKET_ENDPOINT);
    this.socket.on('connect', () => {
      log('Websocket connected !');
    });
  }

  listenToPoll (id, callback) {
    this.socket.on('poll:update', (data) => {
      callback(data);
    });
    this.socket.emit('subscribeTo:poll', {id});
  }

  listenToStreamer ( user, streamerUsername, callback ) {
    // return new Promise((resolve, reject) => {
      if (!user.streamer) {
        this.socket.on('streamer:update', (data) => {
          callback(data);
        });
        this.socket.emit('subscribeTo:streamer', {username:streamerUsername});
      }
    // });
  }

  newUser ( streamerUsername ) {
    user.streamer = streamerUsername === user.username; // Check if user is streamer
    let data = {
      id: user.id,
      username: user.username,
      streamer: user.streamer
    };
    return this.emit('user:new', data);
  }

  postPoll (data) {
    return this.emit('poll:new', data);
  }

  getPoll (username) {
    return this.emit('poll:get', {username});
  }

  vote (poll_id, option_id, value) {
    let data;
    if (option_id) {
      data = {
        poll_id,
        option_id
      };
    } else {
      data = {
        poll_id,
        value
      };
    }
    return this.emit('vote:new', data);
  }

  emit (eventName, data={}) {
    return new Promise((resolve, reject) => {
      log('WebsocketApi emit', eventName, data);
      this.socket.emit(eventName, data);
      this.socket.on(eventName, function(data) {
        resolve(data);
      })
    });
  }

}

export default new Api();
