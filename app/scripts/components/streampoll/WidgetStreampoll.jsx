import React from 'react/addons';
import { Link } from 'react-router';
import api from 'utils/WebsocketApi.js';
import user from 'Models/User.js';
import TwitchSDK from 'utils/TwitchSDK.js';
import Loading from 'pages/Loading.jsx';

import StreampollCreate from 'components/streampoll/StreampollCreate.jsx';
import StreampollVote from 'components/streampoll/StreampollVote.jsx';
import StreampollResults from 'components/streampoll/StreampollResults.jsx';

var WidgetTwitchLive = React.createClass({

  getInitialState: function() {

    return {
      current: 'create',
      poll: null,
      streamerConnected: null,
      hidePopover: false,
      loading: true
    };

  },

  componentWillMount: function() {

    if (!user.isCurrentStreamer(this.props.streamerUsername)) {

      api.listenToStreamer(user, this.props.params.username, (data) => {

        console.log('listenToStreamer update', data);

        // update about poll
        if (typeof data.poll !== 'undefined' && data.poll) {
          this.gotoVote(data.poll);
        }

        // update about connected
        if (typeof data.connected !== 'undefined') {
          this.setState({
            streamerConnected: data.connected
          });
        }

        this.setState({ loading: false });

      });

    } else {
      this.setState({ loading: false });
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

    if (this.state.loading) {
      return <Loading text="Fetch streamer infos..."/>;
    }

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

      if (this.state.poll === null) {
        content = (
          <div className="stream-poll__waiting">
            <p>The streamer did not create any poll yet.<br/>Let's wait for him!</p>
          </div>
        );
      }

      // if (!this.state.streamerConnected) {
      //
      //   content = (
      //     <div className="stream-poll__waiting">
      //       <p>The streamer is not connected, are you {this.props.streamerUsername} ?</p>
      //       <a href="" onClick={this.props.signin} className="twitch-signin" >
      //         <img src='https://camo.githubusercontent.com/e3dadf5d1f371961805e6843fc7d9d611a1d14b5/687474703a2f2f7474762d6170692e73332e616d617a6f6e6177732e636f6d2f6173736574732f636f6e6e6563745f6461726b2e706e67'/>
      //       </a>
      //     </div>
      //   );
      //
      // } else if (this.state.poll === null) {
      //   content = (
      //     <div className="stream-poll__waiting">
      //       <p>The streamer is connected, but did not create any poll yet.<br/>Let's wait for him!</p>
      //     </div>
      //   );
      // }

    }

    let stylePopoverLogin = {
      display: (this.state.streamerConnected === false && !this.state.hidePopover) ? 'block' : 'none'
    };

    return (
      <div className="widget__content">

        {
          // <pre>{ JSON.stringify(this.state, null, 2) }</pre>
        }

        <div className="popover-login popover" style={stylePopoverLogin}>
          <div className="popover__content">

            <header className="logo-header">
              <Link to={"/"} className="logo" ></Link>
            </header>

            <div className="popover__content__body">

              <a href="" onClick={this.closePopover} className="popover__close" >skip</a>

              <p>The streamer is currently not connected, are you {this.props.streamerUsername} ?</p>
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
