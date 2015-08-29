import React from 'react/addons';
import { Link } from 'react-router';

import StreampollCreate from 'components/streampoll/StreampollCreate.jsx';
import StreampollVote from 'components/streampoll/StreampollVote.jsx';
import StreampollResults from 'components/streampoll/StreampollResults.jsx';

var WidgetTwitchLive = React.createClass({

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

    console.log(this.props);

    return (
      <div>
        <header className="logo-header" >
          <Link to={"/"} className="logo" ></Link>
        </header>
        <div className="content">

          <StreampollCreate
            params={this.props.params}
          />

          {
            // <StreamPollVote />
            // <StreamPollResults />
          }

        </div>
      </div>
    );
  }

});

export default WidgetTwitchLive;
