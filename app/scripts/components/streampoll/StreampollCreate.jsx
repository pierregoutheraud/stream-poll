import React from 'react/addons';
import api from 'utils/WebsocketApi.js';
import CONFIG from 'config/config.js';
import { Link, Router, Navigation } from 'react-router';
import user from 'Models/User.js';
import __ from 'utils/i18n.jsx';

var Home = React.createClass({

  mixins: [ Navigation ],

  getInitialState: function() {

    let defaultOptionsNumber = 4;
    let options = [];
    for(let i=0;i< defaultOptionsNumber;i++) {
      options.push('');
    }

    return {
      question: '',
      options: options,
      creating: false
    };
  },

  onChangeQuestion: function() {
    this.setState({
      question: React.findDOMNode(this.refs.question).value
    });
  },

  onChangeOption: function(i) {
    let input = React.findDOMNode(this.refs['option'+i]);
    this.state.options[i] = input.value;
    this.setState({
      options: this.state.options
    });
  },

  onKeyUp: function(e) {
    if (e.keyCode == 13) {
      this.send();
    }
  },

  onAddOption: function(e) {
    e.preventDefault();
    this.state.options.push('');
    this.setState({
      options: this.state.options
    });
  },

  onRemoveOption: function(i, e) {
    e.preventDefault();
    this.state.options.splice(i,1);
    this.setState({
      options: this.state.options
    })
  },

  send: function() {

    // filter(Boolen) = remove empty elements from array
    // + trim every options
    let options = this.state.options.filter(Boolean).map(function(e){
      return e.trim();
    });

    let data = {
      question: this.state.question.trim(),
      options: options,
      username: user.username
    };

    if (!data.question.length) {
      alert('Please, type a question.');
    } else if (data.options.length <= 1) {
      alert('Please, type more than one option.')
    } else {

      this.setState({ creating: true });
      api.postPoll(data).then((poll) => {
        // this.transitionTo('/' + this.props.streamerUsername + '/' + poll._id);
        this.props.gotoVote( poll );
      });

    }

  },

  render: function() {

    let options = this.state.options.map((value,i) => {
      return (
        <li key={i} className="option home__option" >
          <div className="option__case">{i+1}</div>
          <input
            className="option__input input"
            ref={"option"+i}
            placeholder={__("Type an option here", true)}
            type="text"
            value={value}
            onChange={this.onChangeOption.bind(this,i)}
            onKeyUp={this.onKeyUp}
          />
          <a className="option__remove" href="" onClick={this.onRemoveOption.bind(this,i)}>(-)</a>
        </li>
      );
    });

    let submitText = __('create poll'), onClickSubmit = this.send;
    if (this.state.creating) {
      submitText = __('creating poll...')
      onClickSubmit = null;
    }

    console.log(this.props);

    let currentURL = window.location.origin + "/" + this.props.streamerUsername;

    return (

      <div className="create">

        <h1>{ __("Ask a question to your viewers<br/>and find out what they think.") }</h1>
        <p className="advice" >
          { __("This poll and your next ones are available here:") } <a href={currentURL} className="link link--green" >{currentURL}</a>
        <br/>{ __("Share it with your viewers!") }
        </p>

          <textarea
            placeholder={__("Type your question here", true)}
            type="text"
            ref="question"
            onChange={this.onChangeQuestion}
            className="home__question input"
          ></textarea>

          <ul className="options home__options" >
            { options }
            <li className="options__add"><a href="" onClick={this.onAddOption} >+</a></li>
          </ul>

        <footer>
          <button type="submit" className="btn btn--green" onClick={onClickSubmit} >{submitText}</button>
        </footer>

      </div>

    );
  }

});

export default Home;
