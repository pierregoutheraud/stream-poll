import React from 'react';

import StreamPoll from 'pages/StreamPoll.jsx';
import CreatePoll from 'pages/CreatePoll.jsx';
import Poll from 'pages/Poll.jsx';
import PollResults from 'pages/PollResults.jsx';

import { Router, Route } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

React.render((
  <Router history={history}>
    <Route component={StreamPoll} >
      <Route path="/" component={CreatePoll} ></Route>
      <Route name="poll" path="/:id" component={Poll} ></Route>
      <Route name="pollResults" path="/:id/r" component={PollResults} ></Route>
    </Route>
  </Router>
), document.body);
