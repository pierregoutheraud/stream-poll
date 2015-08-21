import request from 'superagent';
import CONFIG from 'config/config.js';
import log from 'utils/log.js';
import user from 'Models/User.js';

class Api {

  constructor() {
    this.socket = io.connect(CONFIG.SOCKET_ENDPOINT, {'forceNew': true});
    this.socket.on('connect', () => {
      console.log('Websocket connected !');
    });
  }

  newUser() {
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

  emit (eventName, data={}) {
    return new Promise((resolve, reject) => {
      console.log('WebsocketApi emit', eventName, data);
      this.socket.emit(eventName, data);
      this.socket.on(eventName, function(data) {
        resolve(data);
      })
    });
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

}

export default new Api();
