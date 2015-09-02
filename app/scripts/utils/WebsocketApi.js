import request from 'superagent';
import CONFIG from 'config/config.js';
import log from 'utils/log.js';
import user from 'Models/User.js';

class Api {

  constructor() {
    this.socket = io.connect(CONFIG.SOCKET_ENDPOINT);
    this.socket.on('connect', () => {
      console.log('Websocket connected !');
    });
  }

  listenToPoll(id, callback) {
    this.socket.on('poll:update', (data) => {
      callback(data);
    });
    this.socket.emit('subscribeTo:poll', {id});
  }

  listenToStreampoll( user, streamerUsername, callback ) {
    // return new Promise((resolve, reject) => {
      if (!user.streamer) {
        this.socket.on('streamer:newPoll', (data) => {
          callback(data.poll);
        });
        this.socket.emit('subscribeTo:streamer', {username:streamerUsername});
      }
    // });
  }

  newUser( streamerUsername ) {
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

  getPoll (poll_id) {
    return this.emit('poll:get', {poll_id});
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
      console.log('WebsocketApi emit', eventName, data);
      this.socket.emit(eventName, data);
      this.socket.on(eventName, function(data) {
        resolve(data);
      })
    });
  }

}

export default new Api();
