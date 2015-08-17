import React, { Component } from 'react';
import RVC from 'components/StreamPoll.jsx';

export default class App extends Component {
  render() {
    return (
      <StreamPoll />
    );
  }
}

React.render(
  <App />,
  document.body
);
