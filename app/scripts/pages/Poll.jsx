import React from 'react/addons';
import { Link, Router, Navigation } from 'react-router';
import api from 'utils/Api.js';

var Poll = React.createClass({

  mixins: [ Navigation ],

  getInitialState: function() {
    return {
      id: null,
      question: null,
      options: null,
      indexOptionChecked: null,
      newOptions: []
    };
  },

  componentWillMount: function() {
    api.getPoll( this.props.params.id ).then((poll) => {
      this.setState({
        id: poll._id,
        question: poll.question,
        options: poll.options
      });
    });
  },

  onAddOption: function(e) {
    e.preventDefault();
    this.state.newOptions.push('');

    this.setState({
      newOptions: this.state.newOptions,
      indexOptionChecked: this.state.options.length // index of new option
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
    this.state.newOptions[0] = input.value.trim();
    this.setState({
      newOptions: this.state.newOptions
    });
  },

  vote: function() {
    let options = this.state.options.concat( this.state.newOptions ),
        poll_id = this.props.params.id,
        option_id = options[this.state.indexOptionChecked]._id;

    api.vote(poll_id, option_id).then((option) => {
      // window.location.href = poll._id;
      // Router.transitionTo('/'+poll._id+'/r');
      this.transitionTo('/'+poll_id+'/r');
      // this.transitionTo('pollResults', {id: poll._id});
    });

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

  render: function() {

    if (this.state.id === null) {
      return <div>Loading...</div>;
    }

    let i = -1;

    let options = this.state.options.map((option) => {
      i++;
      let checked = this.state.indexOptionChecked === i;
      return <li key={i}>{i+1}. <input type="checkbox" checked={checked} onChange={this.onCheckOption.bind(this,i)} /> {option.value}</li>;
    });

    let newOptions = this.state.newOptions.map((value) => {
      i++;
      let checked = this.state.indexOptionChecked === i;
      return (
        <li key={i} >
          {i+1}. <input type="checkbox" checked={checked} onChange={this.onCheckOption.bind(this,i)} /><input ref="newOption" placeholder="Type an option here" onChange={this.onChangeOption} type="text" value={value} />
          <a href="" onClick={this.onRemoveOption}>(-)</a>
        </li>
      );
    });

    return (
      <div className="stream-poll page-poll">

        <h1>Stream Poll</h1>

        <div>{JSON.stringify(this.state, null, 2)}</div>

        <h3>{ this.state.question }</h3>

        <ul>
          { options }
          { newOptions }
          { this.state.newOptions.length === 0 ? <li><a href="" onClick={this.onAddOption} >(+)</a></li> : null }
        </ul>

        <button type="submit" onClick={this.vote} >Vote</button>
        <Link to={"/"+this.state.id+"/r"} >Results</Link>

      </div>
    );
  }

});

export default Poll;
