import React from 'react/addons';
import api from 'utils/Api.js';
import { Link } from 'react-router';

var StreamPoll = React.createClass({

  render: function() {

    return (
      <div className="stream-poll">

        <header>
          <Link to={"/"} ></Link>
        </header>

        <div className="content">

          { this.props.children }

        </div>

      </div>
    );
  }

});

export default StreamPoll;
