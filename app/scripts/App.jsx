import React from 'react';

import Home from 'pages/Home.jsx';
import Poll from 'pages/Poll.jsx';
import Results from 'pages/Results.jsx';

import { Router, Route } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

React.render((
  <Router history={history}>
    <Route path="/" component={Home} ></Route>
    <Route path="/poll/:id" component={Poll} ></Route>
  </Router>
), document.body);
