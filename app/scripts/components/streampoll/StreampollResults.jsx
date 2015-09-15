import React from 'react/addons';
import api from 'utils/WebsocketApi.js';
import CONFIG from 'config/config.js';
import _ from 'underscore';
import __ from 'utils/i18n.jsx';
import Loading from 'pages/Loading.jsx';
import user from 'Models/User.js';

var StreampollResults = React.createClass({

  getInitialState: function() {
    return {
      poll: null
    };
  },

  componentWillMount: function() {

    // Mise a jour du poll, props --> state
    api.getPoll( this.props.streamerUsername ).then((poll) => {
      if (!poll) {
        this.gotoCreate();
      } else {
        this.listenToPoll(poll);
        this.setState({ poll: poll });
      }
    });

  },

  listenToPoll: function(poll) {

    api.listenToPoll(poll._id, (dataOption) => {

      let option = _.findWhere(this.state.poll.options, {_id:dataOption._id});

      // New option
      if (typeof option === 'undefined') {
        this.state.poll.options.push(dataOption);
      } else {
        option.votes = dataOption.votes;
      }

      this.setState({
        poll: this.state.poll
      });

    })
  },

  gotoCreate: function(e) {
    if (e) e.preventDefault();
    this.props.gotoCreate();
  },

  render: function() {

    if (this.state.poll === null) {
      return <Loading>{ __("Fetching poll...") }</Loading>;
    }

    let totalVotes = 0;
    this.state.poll.options.forEach((option) => { totalVotes += option.votes; });

    // Sort
    let options = _.sortBy(this.state.poll.options, 'votes');
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
          </table>

          <div className="option__results" colSpan="2" >
            <div className="option__results__bar">
              <div className="option__results__bar__progress" style={styleProgressbar} >
                <span><strong>{percentage}</strong>%</span>
              </div>
            </div>
            <div className="option__results__votes"><strong>{ option.votes }</strong> { option.votes > 1 ? 'votes' : 'vote' }</div>
          </div>

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
          <a href="" className="btn btn--black" onClick={this.gotoCreate} >{ __("create new poll") }</a>
        </footer>
      );
    }


    return (
      <div className="results">

        <h1 className="question" >{ this.state.poll.question }</h1>

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
