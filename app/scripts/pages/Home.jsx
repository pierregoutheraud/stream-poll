import React from 'react/addons';
import { Link, Router, Navigation } from 'react-router';
// import _twitch_ from 'twitch-sdk/twitch.min.js';
import TwitchSDK from 'utils/TwitchSDK.js';
import user from 'Models/User.js';

var Home = React.createClass({

  mixins: [ Navigation ],

  getInitialState: function() {
    return {};
  },

  componentWillMount: function() {
  },

  signin: function(e) {
    e.preventDefault();
    TwitchSDK.signin();
  },

  watch: function() {
    let streamerUsername = React.findDOMNode(this.refs.streamerUsername).value;
    if (streamerUsername.length) this.transitionTo('/' + streamerUsername);
  },

  render: function() {

    return (

      <div className="app home">

        <header className="home__header">
          {
            //<Link to={"/"} className="logo" ></Link>
          }
          <div className="home__header__screen"></div>
        </header>

        <div className="home__content ">

          <div className="home__cols">

            <div className="home__cols__container clearfix">

              <div className="home__col">
                <h2>You are a streamer</h2>
                <p>Sign-in via Twitch and create polls for your viewers</p>
                <a href="" onClick={this.signin} className="twitch-signin" >
                  <img src='https://camo.githubusercontent.com/e3dadf5d1f371961805e6843fc7d9d611a1d14b5/687474703a2f2f7474762d6170692e73332e616d617a6f6e6177732e636f6d2f6173736574732f636f6e6e6563745f6461726b2e706e67'/>
                </a>
              </div>

              <div className="home__col">
                <h2>You are a viewer</h2>
                <p>Watch your favorite streamer and give him your opinion</p>

                <div className="input-group">
                  <input ref="streamerUsername" type="text" className="input" placeholder="streamer username"/>
                  <button type="button" className="btn btn--black" onClick={this.watch}>ok</button>
                </div>

              </div>

            </div>

          </div>

        </div>


      </div>

    );

  }

});

export default Home;
