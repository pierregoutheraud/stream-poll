import React, { Component } from 'react';
import RVC from 'components/StreamPoll.jsx';

import { Router, Route } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

export default class App extends Component {
  render() {
    return (
      <Router history={history}>
        <Route path="/" component={Home} >
          <Route path="Home" component={Home} />
          <Route path="/poll/:id" component={Poll} >
            <Route path="/results" component={Results} />
          </Route>
        </Route>
      </Router>
    );
  }
}

React.render(
  <App />,
  document.body
);
