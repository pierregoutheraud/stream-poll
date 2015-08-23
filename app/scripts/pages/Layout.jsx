import React from 'react/addons';
import api from 'utils/WebsocketApi.js';
import { Link, Navigation } from 'react-router';
import Loading from 'pages/Loading.jsx';
import TwitchSDK from 'utils/TwitchSDK.js';

var Layout = React.createClass({

    mixins: [ Navigation ],

  getInitialState: function() {
    return {
      loading: true,
      loginPopover: false
    };
  },

  componentWillMount: function() {

    console.log( this.props.params.username );

    // Twitch Auth
    TwitchSDK.auth( this.props.params.username ).then((user) => {

      console.log(user);

      this.setState({ loading: false });

      if (user.authenticated) {

        api.newUser( this.props.params.username ).then((user) => {

          console.log('NEW USER :)', user);

          this.listenToStreamer(user);

          if (typeof this.props.children === 'undefined' && user.streamer) {
            this.transitionTo('/'+this.props.params.username+'/c');
          }

        });

      } else {

        this.setState({ loginPopover: true });

        // Create temporary user
        api.newUser( this.props.params.username ).then((user) => {
          this.listenToStreamer(user);
        });

      }

    });


  },

  listenToStreamer: function(user) {

    console.log('listenToStreamer', user);

    api.listenToStreamer(user, this.props.params.username, (poll) => {
      console.log('update from streamer ', poll._id);
      this.transitionTo('/'+this.props.params.username+'/'+poll._id); // redirect to current streamer poll
    });

  },

  signin: function(e) {
    e.preventDefault();
    TwitchSDK.signin();
  },

  closeSignin: function(e) {
    e.preventDefault();
    this.setState({ loginPopover: false });
  },

  render: function() {

    if (this.state.loading) {
      return <Loading />;
    }

    let waiting = <p>No poll were creating by the streamer yet.<br/>Are you the streamer of this live ?<br/><a href="" className="link" onClick={this.signin} >Sign-in via Twitch</a></p>;

    let stylePopoverLogin = {
      display: this.state.loginPopover ? 'block' : 'none'
    };

    return (

      <div className="app ">

        <div className="popover-login popover" style={stylePopoverLogin}>
          <div className="popover__content">

            <header className="logo-header">
              <Link to={"/"} className="logo" ></Link>
            </header>

            <div className="popover__content__body">

              <a href="" onClick={this.closeSignin} className="popover__close" >nope</a>

              <p>Sign-in via Twitch<br/>and create polls for your viewers</p>
              <a href="" onClick={this.signin} className="twitch-signin" >
                <img src='https://camo.githubusercontent.com/e3dadf5d1f371961805e6843fc7d9d611a1d14b5/687474703a2f2f7474762d6170692e73332e616d617a6f6e6177732e636f6d2f6173736574732f636f6e6e6563745f6461726b2e706e67'/>
              </a>

            </div>

          </div>
          <div className="popover__background" onClick={this.closeSignin} ></div>
        </div>

        <div className="app__video">
          {
            <iframe src={"http://www.twitch.tv/" + this.props.params.username + "/embed"} frameBorder="0" scrolling="no" ></iframe>
          }
        </div>

        <div className="app__chat">
          {
            <iframe src={"http://www.twitch.tv/" + this.props.params.username + "/chat?popout="} frameBorder="0" scrolling="no" ></iframe>
          }
        </div>

        <div className="stream-poll">

          <header>
            <Link to={"/"} className="logo" ></Link>
          </header>

          <div className="content">

            { this.props.children || waiting }

          </div>

        </div>

      </div>
    );
  }

});

export default Layout;
