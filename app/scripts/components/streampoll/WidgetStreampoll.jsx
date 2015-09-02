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
      poll: null
    };

  },

  componentWillMount: function() {

    if (!user.streamer) {
      api.listenToStreampoll(user, this.props.params.username, (poll) => {
        console.log('update from streamer ', poll);
        this.gotoVote(poll);
      });
    }

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

  gotoResults: function(poll) {
    this.setState({
      current: 'results',
      poll: poll
    });
  },

  render: function() {

    let waiting = (
      <div className="stream-poll__waiting">
        <p>No poll created by the streamer yet.</p>
        <p>Are you the streamer of this live ?</p>
        <a href="" onClick={this.signin} className="twitch-signin" >
          <img src='https://camo.githubusercontent.com/e3dadf5d1f371961805e6843fc7d9d611a1d14b5/687474703a2f2f7474762d6170692e73332e616d617a6f6e6177732e636f6d2f6173736574732f636f6e6e6563745f6461726b2e706e67'/>
        </a>
      </div>
    );

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
