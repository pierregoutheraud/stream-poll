import React from 'react/addons';
import api from 'utils/Api.js';
import CONFIG from 'config/config.js';
import _ from 'underscore';
import { Link } from 'react-router';
import Loading from 'pages/Loading.jsx';

var PollResults = React.createClass({

  getInitialState: function() {
    return {
      id: null,
      question: null,
      options: null
    };
  },

  componentWillMount: function() {

    console.log('poll results componentWillMount');

    api.getPoll( this.props.params.id ).then((poll) => {
      this.connectSocket();
      this.setState({
        id: poll._id,
        question: poll.question,
        options: poll.options
      });
    });

  },

  connectSocket: function() {
    let socket = io.connect(CONFIG.SOCKET_ENDPOINT, {'forceNew': true});
    socket.on('connect', () => {
      console.log('Websocket connected !');
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
      return <Loading />;
    }

    let totalVotes = 0;
    this.state.options.forEach((option) => { totalVotes += option.votes; });

    // Sort
    let options = _.sortBy(this.state.options, 'votes');
    options.reverse();

    options = options.map((option, i) => {
      let percentage = totalVotes === 0 ? 0 : Math.round(option.votes * 100 / totalVotes);
      let styleProgressbar = {
        width: percentage + '%'
      };
      return (
        <li key={i} className="option home__option" >
          <div className="option__case">{i+1}</div>
          <span className="option__value">{ option.value }</span>
          <div className="option__results">
            <div className="option__results__bar">
              <div className="option__results__bar__progress" style={styleProgressbar} ></div>
            </div>
            <div className="option__results__votes"><strong>{ option.votes } { option.votes > 1 ? 'votes' : 'vote' }</strong> ({percentage}%)</div>
          </div>
        </li>
      );
    });

    return (
      <div className="poll-results">

        <h1 className="question" >{ this.state.question }</h1>

        <ul className="options">
          {options}
        </ul>

        <div className="total">Total: <strong>{totalVotes} votes</strong></div>

        <footer>
          <Link className="btn btn--black" to={"/"} >create new poll</Link>
        </footer>

      </div>
    );
  }

});

export default PollResults;
