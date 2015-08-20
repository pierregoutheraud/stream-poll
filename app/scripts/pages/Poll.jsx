import React from 'react/addons';
import { Link, Router, Navigation } from 'react-router';
import api from 'utils/Api.js';
import Loading from 'pages/Loading.jsx';

var Poll = React.createClass({

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

    this.state.newOptions.push({ _id: null, value: '' });

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

    let options = this.state.options.concat( this.state.newOptions ),
        poll_id = this.props.params.id,
        selectedOption = options[this.state.indexOptionChecked],
        option_id = selectedOption._id,
        value = selectedOption.value;

    this.setState({ voting: true });
    api.vote(poll_id, option_id, value).then((option) => {
      this.transitionTo('/'+poll_id+'/r');
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
      return <Loading />;
    }

    let i = -1;

    let options = this.state.options.map((option) => {
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

        <h1 className="question" >{ this.state.question }</h1>

        <ul className="options">
          { options }
          { newOptions }
          { this.state.newOptions.length === 0 ? <li className="options__add" ><a href="" onClick={this.onAddOption} >+</a></li> : null }
        </ul>

        <footer>
          <button type="submit" className="btn btn--green" onClick={onClickVote} >{voteText}</button>
          <Link className="btn btn--black" to={"/"+this.state.id+"/r"} >results</Link>
        </footer>

      </div>

    );
  }

});

export default Poll;
