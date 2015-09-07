import React from 'react/addons';
import { Link } from 'react-router';
import api from 'utils/WebsocketApi.js';
import user from 'Models/User.js';

import StreampollCreate from 'components/streampoll/StreampollCreate.jsx';
import StreampollVote from 'components/streampoll/StreampollVote.jsx';
import StreampollResults from 'components/streampoll/StreampollResults.jsx';

var WidgetTwitchLive = React.createClass({

  getInitialState: function() {

    return {
      current: 'create',
      poll: null,
      streamerConnected: false
    };

  },

  componentWillMount: function() {

    if (!user.isCurrentStreamer(this.props.streamerUsername)) {

      console.log('listenToStreamer update');

      api.listenToStreamer(user, this.props.params.username, (data) => {

        if (typeof data.poll !== 'undefined') { // update about poll
          console.log('update from streamer ', data.poll);
          this.gotoVote(data.poll);
        } else if (typeof data.connected !== 'undefined') { // update about connected
          this.setState({
            streamerConnected: data.connected
          });
        }

      });

    } /*else {
      // if this is current streamer, it means streamer is connected
      this.setState({
        streamerConnected: true
      });
    }*/

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
      poll: poll,
      streamerConnected: true
    });
  },

  gotoResults: function() {
    this.setState({
      current: 'results'
    });
  },

  render: function() {

    let content;

    switch (this.state.current) {
      case 'create':
        content = (
          <StreampollCreate
            params={this.props.params}
            gotoVote={this.gotoVote}
          />
        );
        break;

      case 'vote':
        content = (
          <StreampollVote
            params={this.props.params}
            poll={this.state.poll}
            gotoResults={this.gotoResults}
          />
        );
        break;

      case 'results':
        content = (
          <StreampollResults
            params={this.props.params}
            poll={this.state.poll}
            gotoCreate={this.gotoCreate}
          />
        );
        break;
    }

    // If not current streamer
    if (!user.isCurrentStreamer(this.props.streamerUsername)) {

      if (!this.state.streamerConnected) {

        content = (
          <div className="stream-poll__waiting">
            <p>The streamer is not connected, are you {this.props.streamerUsername} ?</p>
            <a href="" onClick={this.props.signin} className="twitch-signin" >
              <img src='https://camo.githubusercontent.com/e3dadf5d1f371961805e6843fc7d9d611a1d14b5/687474703a2f2f7474762d6170692e73332e616d617a6f6e6177732e636f6d2f6173736574732f636f6e6e6563745f6461726b2e706e67'/>
            </a>
          </div>
        );

      } else if (this.state.poll === null) {
        content = (
          <div className="stream-poll__waiting">
            <p>The streamer is connected, but did not create any poll yet.<br/>Let's wait for him!</p>
          </div>
        );
      }

    }

    return (
      <div className="widget__content">
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
