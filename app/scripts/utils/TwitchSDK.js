import _twitch_ from 'twitch-sdk/twitch.min.js';
import user from 'Models/User.js';
import store from 'store';
import CONFIG from 'config/config.js';

class TwitchSDK {

  constructor () {

    // Get token localStorage and set in sessionStorage for twitch js sdk
    let twitch_oauth_session = store.get('twitch_oauth_session');
    if (twitch_oauth_session && !window.sessionStorage.getItem('twitch_oauth_session')) {
      window.sessionStorage.setItem('twitch_oauth_session', JSON.stringify(twitch_oauth_session));
    }

    Twitch.init({
      clientId: CONFIG.TWITCH_CLIENT_ID
    }, (error, status) => {
      if (error) console.error( error );
    });

  }

  auth (streamerUsername) {

    return new Promise((resolve, reject) => {

      Twitch.getStatus((error, status) => {
        if (error) console.error( error );

        // Old
        // resolve( this.checkIfLogged(status, streamerUsername) );

        if (status.authenticated) {

          // Get token in sessionStorage and stock in localStorage
          let twitch_oauth_session = window.sessionStorage.getItem('twitch_oauth_session');
          store.set('twitch_oauth_session', JSON.parse(twitch_oauth_session));

          resolve(this.getUserInfos(streamerUsername));
        } else {
          resolve(user);
        }

      });

    });

  }

  getUserInfos (streamerUsername) {
    return new Promise((resolve, reject) => {
      user.authenticated = true;
      Twitch.api({method: '/user', verb: 'GET' }, (error, res) => {
        if (error) console.error( error );
        let { _id, display_name, logo } = res;
        user.streamer = display_name === streamerUsername;
        user.username = display_name;
        user.logo = logo;
        user.id = _id;
        resolve(user);
      });
    });
  }

  signin (login_redirect=null) {

    if (login_redirect === null) login_redirect = window.location.pathname;
    store.set('login_redirect', login_redirect);
    Twitch.login({
      // scope: ['user_read', 'channel_read']
      redirect_uri: window.location.origin + '/login',
      popup: false,
      scope: ['user_read']
    });

  }

  checkIfLogged (status, streamerUsername) {
    return new Promise((resolve, reject) => {
      // Twitch.events.addListener('auth.login', function() {
      //   resolve();
      // });

      if (status.authenticated) {

        // if (user.authenticated) // Coming from home, we already did that
          // resolve(user);
        // else {
          resolve(this.getUserInfos(streamerUsername));
        // }

      } else {

        resolve(user);

      }

    });
  }

}

export default new TwitchSDK();
