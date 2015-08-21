import React from 'react/addons';
import api from 'utils/WebsocketApi.js';
import { Link } from 'react-router';

var Layout = React.createClass({

  componentWillMount: function() {
    console.log('Layout componentWillMount, api.newUser()');
    api.newUser();
  },

  render: function() {

    let waiting = <p>No poll at the moment.</p>;

    return (

      <div className="app">

        <div className="app__video">
          {
            // <iframe src="http://www.twitch.tv/{this.props.params.username}/embed" frameBorder="0" scrolling="no" ></iframe>
          }
        </div>

        <div className="app__chat">
          {
            // <iframe src={"http://www.twitch.tv/" + this.props.params.username + "/chat?popout="} frameBorder="0" scrolling="no" ></iframe>
          }
        </div>

        <div className="stream-poll">

          <header>
            <Link to={"/"} ></Link>
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
