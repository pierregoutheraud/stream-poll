import React from 'react/addons';
import api from 'utils/Api.js';
import { Link, Router, Navigation } from 'react-router';
import _twitch_ from 'twitch-sdk/twitch.min.js';
import user from 'Models/User.js';

var Home = React.createClass({

  mixins: [ Navigation ],

  getInitialState: function() {
    return {};
  },

  componentWillMount: function() {

    Twitch.init({clientId: 'px7pb4sktw8jxje799wioymtiyytdam'}, (error, status) => {
      if (error) console.error( error );
      if (status.authenticated) {

        console.log('User logged !', status);
        user.authenticated = true;

        Twitch.api({method: '/user', verb: 'GET' }, (error, res) => {
          if (error) console.error( error );
          let { _id, display_name, logo } = res;
          user.streamer = true;
          user.username = display_name;
          user.logo = logo;
          user.id = _id;
          this.transitionTo('/' + display_name + '/c');
        });

      }
    });

  },

  signinTwitch: function(e) {
    e.preventDefault();
    Twitch.login({
      scope: ['user_read', 'channel_read']
    });
  },

  render: function() {

    return (
      <div className="home">

          <p>you are a</p>

          <div className="streamer">
            <p>streamer</p>
            <a href="" onClick={this.signinTwitch} >
              <img src='https://camo.githubusercontent.com/e3dadf5d1f371961805e6843fc7d9d611a1d14b5/687474703a2f2f7474762d6170692e73332e616d617a6f6e6177732e636f6d2f6173736574732f636f6e6e6563745f6461726b2e706e67'/>
            </a>
          </div>

          <br/><br/><br/><br/>

          <div className="viewer">
            <p>viewer</p>
            <input type="text" placeholder="twitch username" />
          </div>

      </div>
    );

  }

});

export default Home;
