import request from 'superagent';
import CONFIG from 'config/config.js';
import log from 'utils/log.js';

class Api {

  postPoll (data) {
    return this.post('/poll', data);
  }

  getPoll (poll_id) {
    return this.get('/poll/' + poll_id);
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
    return this.post('/vote', data);
  }

  get(url) {
    url = CONFIG.API_ENDPOINT + url;
    // log('TITI GET', url)
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .accept('application/json')
        .end(function(err, res) {
          if( err ) {
            // this.catchError(res.body.error);
            reject(err);
          } else {
            resolve(res.body);
          }
        });
    });
  }

  post(url, data=[]) {
    url = CONFIG.API_ENDPOINT + url;
    log('api POST', url)
    return new Promise((resolve, reject) => {
      request
        .post(url)
        // .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Content-Type', 'application/json')
        .send(data)
        .end( (err, res) => {
          if( err ) {
            // this.catchError(res.body.error);
            reject(res.body.error);
          } else {
            resolve(res.body);
          }
        });
    });
  }

  delete(url) {
    url = CONFIG.API_ENDPOINT + url;
    // log('TITI DELETE', url)
    return new Promise((resolve, reject) => {
      request
        .del(url)
        // .set('Content-Type', 'application/x-www-form-urlencoded')
        .end( (err, res) => {
          if( err ) {
            // this.catchError(res.body.error);
            reject(res.body.error);
          } else {
            resolve(res.body);
          }
        });
    });
  }

}

export default new Api();
