import React from 'react/addons';
import api from 'utils/WebsocketApi.js';
import CONFIG from 'config/config.js';
import _ from 'underscore';
import Loading from 'pages/Loading.jsx';
import user from 'Models/User.js';

var StreampollResults = React.createClass({

  getInitialState: function() {
    return {
      id: null,
      question: null,
      options: null
    };
  },

  componentWillMount: function() {

    api.getPoll( this.props.poll._id ).then((poll) => {

      this.connectSocket();
      this.setState({
        id: poll._id,
        question: poll.question,
        options: poll.options
      });

    });

  },

  connectSocket: function() {

    api.subscribeToPoll(this.props.params.id, (dataOption) => {

      console.log( dataOption );

      let option = _.findWhere(this.state.options, {_id:dataOption._id});

      // New option
      if (typeof option === 'undefined') {
        this.state.options.push(dataOption);
      } else {
        option.votes = dataOption.votes;
      }

      this.setState({
        options: this.state.options
      });

    })
  },

  gotoCreate: function(e) {
    e.preventDefault();
    this.props.gotoCreate();
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
        <li key={i} className="option option--result" >

          <table>
            <tr>
              <td className="option__case" >{i+1}</td>
              <td className="option__value" >{ option.value }</td>
            </tr>
            <tr >
              <td className="option__results" colSpan="2" >
                <div className="option__results__bar">
                  <div className="option__results__bar__progress" style={styleProgressbar} ></div>
                </div>
                <div className="option__results__votes"><strong>{ option.votes } { option.votes > 1 ? 'votes' : 'vote' }</strong> ({percentage}%)</div>
              </td>
            </tr>
          </table>

          {
          /*
          <div className="option__case">{i+1}</div>
          <span className="option__value">{ option.value }</span>
          <div className="option__results">
            <div className="option__results__bar">
              <div className="option__results__bar__progress" style={styleProgressbar} ></div>
            </div>
            <div className="option__results__votes"><strong>{ option.votes } { option.votes > 1 ? 'votes' : 'vote' }</strong> ({percentage}%)</div>
          </div>
          */
          }
        </li>
      );
    });

    let footer = null;
    if (user.streamer) {
      footer = (
        <footer>
          <a href="" className="btn btn--black" onClick={this.gotoCreate} >create new poll</a>
        </footer>
      );
    }


    return (
      <div className="results">

        <h1 className="question" >{ this.state.question }</h1>

        <ul className="options">
          {options}
        </ul>

        <div className="total">Total: <strong>{totalVotes} {totalVotes > 1 ? "votes" : "vote"}</strong></div>

        { footer }

      </div>
    );
  }

});

export default StreampollResults;
