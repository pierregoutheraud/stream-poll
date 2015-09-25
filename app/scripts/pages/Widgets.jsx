import React from 'react/addons';
import api from 'utils/WebsocketApi.js';
import { Link, Navigation } from 'react-router';
import Loading from 'pages/Loading.jsx';
import TwitchSDK from 'utils/TwitchSDK.js';
// import dragula from 'react-dragula';
import _ from 'underscore';

// Widgets
import Widget from 'components/Widget.jsx';
import WidgetTwitchLive from 'components/WidgetTwitchLive.jsx';
import WidgetTwitchChat from 'components/WidgetTwitchChat.jsx';
import WidgetStreampoll from 'components/streampoll/WidgetStreampoll.jsx';
import WidgetTwitterFeed from 'components/WidgetTwitterFeed.jsx';
import WidgetGoogle from 'components/WidgetGoogle.jsx';

// https://tmi.twitch.tv/group/user/USERNAMEHERE/chatters

var Layout = React.createClass({

    mixins: [ Navigation ],

  getInitialState: function() {

    let widgets = [
      {
        name: 'twitch-live',
        title: 'twitch live',
        flex: 2,
        order: 1,
        active: false
      },
      {
        name: 'twitch-chat',
        title: 'twitch chat',
        flex: 1,
        order: 2,
        active: false
      },
      {
        name: 'streampoll',
        title: 'streampoll',
        flex: 1,
        order: 3,
        active: true
      },
      // {
      //   name: 'twitter-feed',
      //   title: 'twitter feed',
      //   flex: 1,
      //   order: 4,
      //   active: false
      // },
      // {
      //   name: 'google',
      //   title: 'google',
      //   flex: 1,
      //   order: 5,
      //   active: false
      // }
    ];

    return {
      streamerUsername: this.props.params.username.toLowerCase(),
      widgets: widgets,
      loading: true
    };
  },

  componentWillMount: function() {

    this.dragula = false;

    // Twitch Auth
    TwitchSDK.auth().then((user) => {

      if (user.authenticated) {

        api.newUser( this.state.streamerUsername ).then((user) => {
          this.setState({ loading: false });
        });

      } else {

        // Create temporary user
        api.newUser( this.state.streamerUsername ).then((user) => {
          this.setState({
            loading: false
          });
        });

      }

    });


  },

  componentDidUpdate: function() {

    // if (!this.dragula) {
    //   this.initDragula();
    //   this.dragula = true;
    // }

  },

  initDragula: function() {
    let widgets = React.findDOMNode(this.refs.widgets);
    dragula([widgets]);
  },

  getWidgetByOrder: function(i) {
    return _.findWhere(this.state.widgets,{order:i, active:true});
  },
  getActives: function() {
    return _.find(this.state.widgets, {active:true});
  },

  signin: function(e) {
    if (e) e.preventDefault();
    TwitchSDK.signin();
  },

  moveRight: function(i) {
    let w1 = this.state.widgets[i],
        w2 = this.getWidgetByOrder(w1.order + 1);
    if (w1.order < this.state.widgets.length) {
      w1.order++; w2.order--;
      this.setState({ widgets: this.state.widgets });
    }
  },
  moveLeft: function(i) {
    let w1 = this.state.widgets[i],
        w0 = this.getWidgetByOrder(w1.order - 1);
    if (w1.order > 1 && w0) {
      w1.order--;
      w0.order++;
      this.setState({ widgets: this.state.widgets });
    }
  },

  bigger: function(i) {
    let widget = this.state.widgets[i];
    if (widget.flex < 5) widget.flex++;
    this.setState({ widgets: this.state.widgets });
  },

  smaller: function(i) {
    let widget = this.state.widgets[i];
    if (widget.flex < 2) {
      // We increase the size of the others by 1
      this.state.widgets.forEach((widget,j) => {
        if (i !== j) widget.flex++;
      });
    } else {
      widget.flex--;
    }
    this.setState({ widgets: this.state.widgets });
  },

  activateWidget: function(widget, e=null) {
    if(e) e.preventDefault();
    widget.active = true;
    this.setState({ widgets: this.state.widgets });
  },

  close: function(i) {
    let widget = this.state.widgets[i];
    widget.active = false;
    this.setState({ widgets: this.state.widgets });
  },

  render: function() {

    if (this.state.loading) {
      return <Loading text="Loading..." />;
    }

    let widgetsFunctions = {
      'bigger':this.bigger,
      'smaller':this.smaller,
      'moveRight':this.moveRight,
      'moveLeft':this.moveLeft,
      'close':this.close
    };

    let inactiveWidgets = [];
    let widgets = this.state.widgets.map((widget,i) => {

      if (!widget.active) {
        inactiveWidgets.push(widget);
        return;
      }

      let widgetComponent, loading = false;
      switch (widget.name) {

        case 'twitch-live':
          widgetComponent = <WidgetTwitchLive streamerUsername={this.state.streamerUsername} />;
          loading = true;
          break;

        case 'twitch-chat':
          widgetComponent = <WidgetTwitchChat streamerUsername={this.state.streamerUsername} />;
          loading = true;
          break;

        case 'streampoll':
          widgetComponent = <WidgetStreampoll signin={this.signin} streamerUsername={this.state.streamerUsername} />;
          break;

        case 'twitter-feed':
          widgetComponent = <WidgetTwitterFeed streamerUsername={this.state.streamerUsername} />;
          break;

        case 'google':
          widgetComponent = <WidgetGoogle />;
          break;

      }

      return (

        <Widget
          className={"widget--"+widget.name+" widget--iframe"}
          key={"widget"+i}
          i={i}
          loading={loading}
          streamerUsername={this.state.streamerUsername}
          {...widgetsFunctions}
          {...widget}
        >
          { widgetComponent }
        </Widget>

      );

    });

    // if (!widgets.length) {
    //   widgets = (
    //     <p>Nope!</p>
    //   );
    // }

    inactiveWidgets = inactiveWidgets.map((widget,i) => {
      return (
        <a
          href=""
          key={"inactive-widget"+i}
          className={"inactive-widgets__widget inactive-widgets__widget--" + widget.name + " bgi bgi--" + widget.name}
          onClick={this.activateWidget.bind(this, widget)}
        ></a>
      );
    });


    let leftBar = null;
    if (inactiveWidgets.length) {
      leftBar = (
        <div className="app__leftBar">
          <div className="inactive-widgets" >
            { inactiveWidgets }
          </div>
        </div>
      );
    }

    return (

      <div className="app ">

        <div className="app__content">

          { leftBar }

          <div className="app__widgets" ref="widgets">
            { widgets }
          </div>

        </div>

      </div>
    );
  }

});

export default Layout;
