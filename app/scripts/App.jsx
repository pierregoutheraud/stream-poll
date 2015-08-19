import React from 'react';

import Home from 'pages/Home.jsx';
import Poll from 'pages/Poll.jsx';
import PollResults from 'pages/PollResults.jsx';

import { Router, Route } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

React.render((
  <Router history={history}>
    <Route path="/" component={Home} ></Route>
    <Route path="/:id" component={Poll} ></Route>
    <Route name="pollResults" path="/:id/r" component={PollResults} ></Route>
  </Router>
), document.body);
