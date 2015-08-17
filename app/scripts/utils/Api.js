import request from 'superagent';
import CONFIG from 'config/config.js';

class Api {

  getComments(video_id) {
    return this.get('/comments/' + video_id);
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
    url = CONFIG.API_ENDPOINT + url + AuthStore.getAccessTokenParam();
    // log('TITI POST', url)
    return new Promise((resolve, reject) => {
      request
        .post(url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
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
    url = CONFIG.API_ENDPOINT + url + AuthStore.getAccessTokenParam();
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
