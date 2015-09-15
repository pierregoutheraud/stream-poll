import React from 'react/addons';
import { Link } from 'react-router';
import api from 'utils/WebsocketApi.js';
import user from 'Models/User.js';
import TwitchSDK from 'utils/TwitchSDK.js';
import Loading from 'pages/Loading.jsx';
import __ from 'utils/i18n.jsx';

import StreampollCreate from 'components/streampoll/StreampollCreate.jsx';
import StreampollVote from 'components/streampoll/StreampollVote.jsx';
import StreampollResults from 'components/streampoll/StreampollResults.jsx';

var WidgetTwitchLive = React.createClass({

  getInitialState: function() {

    return {
      current: null,
      poll: null,
      streamerConnected: null,
      hidePopover: false,
      loading: true
    };

  },

  componentWillMount: function() {

    if (!user.isCurrentStreamer(this.props.streamerUsername)) {

      api.listenToStreamer(user, this.props.streamerUsername, (data) => {

        // update about poll
        if (typeof data.poll !== 'undefined') {
          if (data.poll) {
            this.gotoVote(data.poll);
          } else {
            this.gotoWaiting();
          }
        }

        // update about connected
        if (typeof data.connected !== 'undefined') {
          this.setState({
            streamerConnected: data.connected
          });
        }

      });

    } else {
      this.gotoResults();
    }

    this.setState({
      loading: false
    });

  },

  gotoWaiting: function() {
    this.setState({
      current: 'waiting',
      poll: null
    });
  },

  gotoCreate: function() {
    this.setState({
      current: 'create',
      poll: null
    });
  },

  gotoVote: function(poll) {
    this.setState({
      current: 'vote',
      poll: poll
    });
  },

  gotoResults: function() {
    this.setState({
      current: 'results'
    });
  },

  signin: function(e) {
    if (e) e.preventDefault();
    TwitchSDK.signin();
  },
  closePopover: function(e) {
    e.preventDefault();
    this.setState({
      hidePopover: true
    });
  },

  render: function() {

    if (this.state.loading || this.state.current === null) {
      return <Loading text={ __("Fetching streamer infos...") } />;
    }

    let content;

    switch (this.state.current) {
      case 'waiting':

        let connect, currentURL = window.location.origin + "/" + this.props.streamerUsername;
        if (this.state.streamerConnected) {
          connect = __("<span>The streamer <strong>is connected</strong> but did not create any poll yet.</span>")
        }
        else {
          connect = __("<span>The streamer <strong>is not connected</strong> and did not create any poll yet.</span>")
        }

        content = (
          <div className="stream-poll__waiting">
            <p>
              {connect} <br/>
            { __("Share this url with him and your friends:") } <a href={currentURL} className="link link--green" >{currentURL}</a>
            </p>
            <p>{ __("Are you") } {this.props.streamerUsername} ?</p>
            <a href="" onClick={this.signin} className="twitch-signin" >
              <img src='https://camo.githubusercontent.com/e3dadf5d1f371961805e6843fc7d9d611a1d14b5/687474703a2f2f7474762d6170692e73332e616d617a6f6e6177732e636f6d2f6173736574732f636f6e6e6563745f6461726b2e706e67'/>
            </a>
          </div>
        );
        break;

      case 'create':
        content = (
          <StreampollCreate
            streamerUsername={this.props.streamerUsername}
            gotoVote={this.gotoVote}
          />
        );
        break;

      case 'vote':
        content = (
          <StreampollVote
            streamerUsername={this.props.streamerUsername}
            poll={this.state.poll}
            gotoResults={this.gotoResults}
          />
        );
        break;

      case 'results':
        content = (
          <StreampollResults
            streamerUsername={this.props.streamerUsername}
            poll={this.state.poll}
            gotoCreate={this.gotoCreate}
          />
        );
        break;
    }

    let stylePopoverLogin = {
      display: (this.state.streamerConnected === false && this.state.poll !== null && !this.state.hidePopover) ? 'block' : 'none'
    };

    return (
      <div className="widget__content">

        {
          // <pre>{ JSON.stringify(this.state, null, 2) }</pre>
        }

        <div className="popover-login popover" style={stylePopoverLogin}>
          <div className="popover__content">

            <div className="popover__content__body">

              <a href="" onClick={this.closePopover} className="popover__close" >{ __("no") }</a>

              <p>{ __("The streamer is currently not connected, are you") } {this.props.streamerUsername} ?</p>
              <a href="" onClick={this.signin} className="twitch-signin" >
                <img src='https://camo.githubusercontent.com/e3dadf5d1f371961805e6843fc7d9d611a1d14b5/687474703a2f2f7474762d6170692e73332e616d617a6f6e6177732e636f6d2f6173736574732f636f6e6e6563745f6461726b2e706e67'/>
              </a>

            </div>

          </div>
          <div className="popover__background" onClick={this.closePopover} ></div>
        </div>


        <header className="logo-header" >
          <Link to={"/"} className="logo" ></Link>
        </header>
        <div className="widget--streampoll__main">
          { content }
        </div>

      </div>
    );
  }

});

export default WidgetTwitchLive;
