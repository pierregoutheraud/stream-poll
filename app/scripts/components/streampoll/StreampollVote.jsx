import React from 'react/addons';
import { Link, Router, Navigation } from 'react-router';
import api from 'utils/WebsocketApi.js';
import Loading from 'pages/Loading.jsx';
import user from 'Models/User.js';
import _ from 'underscore';
import store from 'store';

let StreampollVote = React.createClass({

  mixins: [ Navigation ],

  getInitialState: function() {
    return {
      id: null,
      question: null,
      options: null,
      indexOptionChecked: null,
      newOptions: [],
      voting: false
    };
  },

  componentWillMount: function() {
    this.checkIfAlreadyVoted();
  },

  checkIfAlreadyVoted: function() {
    let ids = store.get('streampoll_votes') || null;
    if (ids && ids.indexOf(this.props.poll._id) !== -1) {
      this.gotoResults();
    }
  },

  onAddOption: function(e) {
    e.preventDefault();

    this.state.newOptions.push({ _id: null, value: '' });

    this.setState({
      newOptions: this.state.newOptions,
      indexOptionChecked: this.props.poll.options.length // index of new option
    });
  },

  onRemoveOption: function(i,e) {
    e.preventDefault();
    this.setState({
      newOptions: []
    });
  },

  onChangeOption: function() {
    let input = React.findDOMNode(this.refs.newOption);
    this.state.newOptions[0].value = input.value;
    this.setState({
      newOptions: this.state.newOptions
    });
  },

  vote: function() {

    if (this.state.indexOptionChecked === null) {
      alert('Please select an option.');
      return;
    }

    this.setState({ voting: true }); // voting...

    let options = this.props.poll.options.concat( this.state.newOptions ),
        selectedOption = options[this.state.indexOptionChecked],
        option_id = selectedOption._id,
        value = selectedOption.value;

    api.vote(this.props.poll._id, option_id, value).then((poll) => {
      // let poll = this.props.poll;
      // let o = _.findWhere(poll.options, {_id:option._id});
      // o.votes = option.votes;
      this.savePollId();
      this.props.gotoResults();
    });
  },

  savePollId: function() {
    let ids = store.get('streampoll_votes') || [];
    ids.push( this.props.poll._id )
    store.set('streampoll_votes', ids);
  },

  onCheckOption: function(i) {
    let index = i;
    if (this.state.indexOptionChecked === i)
      index = null;
    else
      index = i;

    this.setState({
      indexOptionChecked: index
    });
  },

  gotoResults: function(e) {
    if (e) e.preventDefault();
    this.props.gotoResults();
  },

  render: function() {

    if (this.props.poll.id === null) {
      return <Loading />;
    }

    let i = -1;

    let options = this.props.poll.options.map((option) => {
      i++;
      let checked = this.state.indexOptionChecked === i;
      return (
        <li key={i} className="option home__option" >
          <div className="option__case"><input type="checkbox" checked={checked} onChange={this.onCheckOption.bind(this,i)} /></div> <span className="option__value">{option.value}</span>
        </li>
      );
    });

    let newOptions = this.state.newOptions.map((option) => {
      i++;
      let checked = this.state.indexOptionChecked === i;
      return (
        <li key={i} className="option home__option" >
          <div className="option__case"><input type="checkbox" checked={checked} onChange={this.onCheckOption.bind(this,i)} /></div>
          <input className="option__input input" ref="newOption" placeholder="Type an option here" onChange={this.onChangeOption} type="text" value={option.value} />
          <a className="option__remove" href="" onClick={this.onRemoveOption}>(-)</a>
        </li>
      );
    });

    let voteText = 'vote', onClickVote = this.vote;
    if (this.state.voting) {
      voteText = 'voting...'
      onClickVote = null;
    }

    return (

      <div className="poll">

        <h1 className="question" >{ this.props.poll.question }</h1>

        <ul className="options">
          { options }
          { newOptions }
          { this.state.newOptions.length === 0 ? <li className="options__add" ><a href="" onClick={this.onAddOption} >+</a></li> : null }
        </ul>

        <footer>
          <button type="submit" className="btn btn--green" onClick={onClickVote} >{voteText}</button>
          <a href="" className="btn btn--black" onClick={this.gotoResults} >results</a>
        </footer>

      </div>

    );
  }

});

export default StreampollVote;
