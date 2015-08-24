import React from 'react/addons';
import api from 'utils/WebsocketApi.js';
import { Link, Navigation } from 'react-router';
import Loading from 'pages/Loading.jsx';
import TwitchSDK from 'utils/TwitchSDK.js';
import store from 'store';

var Layout = React.createClass({

  mixins: [ Navigation ],

  componentWillMount: function() {

    let login_redirect = store.get('login_redirect');

    if (login_redirect === '/') {
      TwitchSDK.auth( this.props.params.username ).then((user) => {
        login_redirect = '/' + user.username;
        this.transitionTo(login_redirect);
      });
    } else {
      this.transitionTo(login_redirect);
    }

  },

  render: function() {

    return (

      <div className="app ">
        <Loading />;
      </div>

    );
  }

});

export default Layout;
