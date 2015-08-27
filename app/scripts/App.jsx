import React from 'react';

import Widgets from 'pages/Widgets.jsx';
import Home from 'pages/Home.jsx';
import Create from 'pages/Create.jsx';
import Vote from 'pages/Vote.jsx';
import Results from 'pages/Results.jsx';
import Login from 'pages/Login.jsx';

import { Router, Route } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

React.render((

  <Router history={history}>

    <Route path="/" name="home" component={Home} ></Route>

    <Route path="/login" name="login" component={Login} ></Route>

    <Route path="/:username" name="layout" component={Widgets} >
      <Route path="/c" name="create" component={Create} ></Route>
      <Route path="/:id" name="poll" component={Vote} ></Route>
      <Route path="/:id/r" name="results" component={Results} ></Route>
    </Route>


  </Router>

), document.body);
