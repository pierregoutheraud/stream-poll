import request from 'superagent';
import CONFIG from 'config/config.js';
import log from 'utils/log.js';

class Api {

  postPoll (data) {
    return this.post('/poll', data);
  }

  getPoll (poll_id) {
    return {
      question: "Que dois je manger aujourd'hui ?",
      options: ['Pates','Steak','Tarte aux pommes','Kebab']
    };
    // return this.get('/poll/' + poll_id);
  }

  getPollResults (poll_id) {
    return {
      question: "Que dois je manger aujourd'hui ?",
      options: [
        {
          value: 'Pates',
          votes: 23
        },
        {
          value: 'Steak',
          votes: 16
        },
        {
          value: 'Tarte aux pommes',
          votes: 13
        },
        {
          value: 'Kebab',
          votes: 4
        }
      ]
    };
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
            this.catchError(res.body.error);
            reject(err);
          } else {
            resolve(res);
          }
        });
    });
  }

  post(url, data=null) {
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
            this.catchError(res.body.error);
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
            this.catchError(res.body.error);
            reject(res.body.error);
          } else {
            resolve(res.body);
          }
        });
    });
  }

}

export default new Api();
