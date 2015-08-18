import React from 'react/addons';
import api from 'utils/Api.js';

var PollResults = React.createClass({

  getInitialState: function() {
    let pollResults = api.getPollResults( this.props.params.id );
    return {
      question: pollResults.question,
      options: pollResults.options,
    };
  },

  componentDidMount: function() {
  },

  render: function() {

    let i = -1;
    let options = this.state.options.map((option) => {
      i++;
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
