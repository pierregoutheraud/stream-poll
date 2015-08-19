import React from 'react/addons';
import api from 'utils/Api.js';

var Home = React.createClass({

  getInitialState: function() {
    return {
      question: '',
      options: ['', '', '', '']
    };
  },

  onChangeQuestion: function() {
    this.setState({
      question: React.findDOMNode(this.refs.question).value.trim()
    });
  },

  onChangeOption: function(i) {
    let input = React.findDOMNode(this.refs['option'+i]);
    this.state.options[i] = input.value.trim();
    this.setState({
      options: this.state.options
    });
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
    let data = {
      question: this.state.question,
      options: this.state.options.filter(Boolean)
    };
    api.postPoll(data);
  },

  render: function() {

    let options = this.state.options.map((value,i) => {
      return (
        <li key={i} >{i+1}.
          <input ref={"option"+i} onChange={this.onChangeOption.bind(this,i)} placeholder="Type an option here" type="text" value={value} />
          <a href="" onClick={this.onRemoveOption.bind(this,i)}>(-)</a>
        </li>
      );
    });

    return (
      <div className="stream-poll page-home">

        <div>{JSON.stringify(this.state, null, 2)}</div>

        <h1>Stream Poll</h1>

        <input
          placeholder="Type your question here"
          type="text"
          ref="question"
          onChange={this.onChangeQuestion}
        />

        <ul>
          { options }
          <li><a href="" onClick={this.onAddOption} >(+)</a></li>
        </ul>

        <button type="submit" onClick={this.send}>OK</button>

      </div>
    );
  }

});

export default Home;
