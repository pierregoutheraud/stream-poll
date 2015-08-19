import React from 'react/addons';
import api from 'utils/Api.js';
import CONFIG from 'config/config.js';
import _ from 'underscore';

var PollResults = React.createClass({

  getInitialState: function() {
    return {
      id: null,
      question: null,
      options: null
    };
  },

  componentWillMount: function() {

    api.getPoll( this.props.params.id ).then((poll) => {
      this.setState({
        id: poll._id,
        question: poll.question,
        options: poll.options
      });
      this.connectSocket();
    });

  },

  connectSocket: function() {
    let socket = io.connect(CONFIG.SOCKET_ENDPOINT);
    socket.on('connect', () => {
      socket.emit('poll', { id: this.props.params.id });
    });
    socket.on('vote:new', (data) => {
      let { option_id, votes } = data;
      let option = _.findWhere(this.state.options, {_id:option_id});
      option.votes = votes;
      this.setState({
        options: this.state.options
      });
    });
  },

  render: function() {

    if (this.state.id === null) {
      return <div>Loading...</div>;
    }

    let options = this.state.options.map((option, i) => {
      return <li key={i}>{i+1}. {option.value} / Votes: {option.votes}</li>;
    });

    return (
      <div className="stream-poll page-poll-results">

        <div>{JSON.stringify(this.state, null, 1)}</div><br/>

        <h2>{this.state.question}</h2>

        <ul>
          {options}
        </ul>

      </div>
    );
  }

});

export default PollResults;
