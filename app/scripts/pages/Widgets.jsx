import React from 'react/addons';
import api from 'utils/WebsocketApi.js';
import { Link, Navigation } from 'react-router';
import Loading from 'pages/Loading.jsx';
import TwitchSDK from 'utils/TwitchSDK.js';
import Widget from 'components/Widget.jsx';
import dragula from 'react-dragula';
import _ from 'underscore';

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
        active: true
      },
      {
        name: 'streampoll',
        title: 'streampoll',
        flex: 1,
        order: 3,
        active: true
      },
      {
        name: 'twitter-feed',
        title: 'twitter feed',
        flex: 1,
        order: 4,
        active: false
      }
    ];

    return {
      widgets: widgets,
      loading: true,
      loginPopover: false
    };
  },

  componentWillMount: function() {

    this.dragula = false;
    this.twitterFeed = false;

    console.log( this.props.params.username );

    // Twitch Auth
    TwitchSDK.auth( this.props.params.username ).then((user) => {

      console.log(user);

      if (user.authenticated) {

        api.newUser( this.props.params.username ).then((user) => {

          console.log('NEW USER :)', user);

          this.listenToStreamer(user);

          if (typeof this.props.children === 'undefined' && user.streamer) {
            this.replaceWith('/'+this.props.params.username+'/c');
          }

          this.setState({ loading: false });

        });

      } else {

        this.setState({
          loginPopover: true,
          loading: false
        });

        // Create temporary user
        api.newUser( this.props.params.username ).then((user) => {
          this.listenToStreamer(user);
        });

      }

    });


  },

  componentDidUpdate: function() {

    // if (!this.dragula) {
    //   this.initDragula();
    //   this.dragula = true;
    // }

    if (!this.twitterFeed && this.refs.twitterFeed) {
      this.twitterFeed = true;
      this.initTwitterFeed();
    }

  },

  initTwitterFeed: function() {
    twttr.ready( (twttr) => {
      twttr.widgets.createTimeline(
        "636662179987525632",
        React.findDOMNode(this.refs.twitterFeed),
        {
          width: 2000,
          screenName: this.props.params.username
        }
      );
    });
  },

  initDragula: function() {
    let widgets = React.findDOMNode(this.refs.widgets);
    dragula([widgets]);
  },

  listenToStreamer: function(user) {

    console.log('listenToStreamer', user);

    api.listenToStreamer(user, this.props.params.username, (poll) => {
      console.log('update from streamer ', poll._id);
      this.transitionTo('/'+this.props.params.username+'/'+poll._id); // redirect to current streamer poll
    });

  },

  getWidgetByOrder: function(i) {
    return _.findWhere(this.state.widgets,{order:i});
  },
  getActives: function() {
    return _.find(this.state.widgets, {active:true});
  },

  signin: function(e) {
    e.preventDefault();
    TwitchSDK.signin();
  },

  closeSignin: function(e) {
    e.preventDefault();
    this.setState({ loginPopover: false });
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
    if (w1.order > 1) {
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
      return <Loading />
    };

    let waiting = (
      <div className="stream-poll__waiting">
        <p>No poll created by the streamer yet.</p>
        <p>Are you the streamer of this live ?</p>
        <a href="" onClick={this.signin} className="twitch-signin" >
          <img src='https://camo.githubusercontent.com/e3dadf5d1f371961805e6843fc7d9d611a1d14b5/687474703a2f2f7474762d6170692e73332e616d617a6f6e6177732e636f6d2f6173736574732f636f6e6e6563745f6461726b2e706e67'/>
        </a>
      </div>
    );

    let widgetsFunctions = {
      'bigger':this.bigger,
      'smaller':this.smaller,
      'moveRight':this.moveRight,
      'moveLeft':this.moveLeft,
      'close':this.close
    };

    console.log('widgetsFunctions', widgetsFunctions);

    let inactiveWidgets = [];
    let widgets = this.state.widgets.map((widget,i) => {

      if (!widget.active) {
        inactiveWidgets.push(widget);
        return;
      }

      switch (widget.name) {

        case 'twitch-live':
          return (
            <Widget
              className="widget--twitch-video widget--iframe"
              key={"widget"+i}
              i={i}
              {...widgetsFunctions}
              {...widget}
            >
                <iframe src={"http://www.twitch.tv/" + this.props.params.username + "/embed"} frameBorder="0" scrolling="no" ></iframe>
            </Widget>
          );
          break;
        case 'twitch-chat':
          return (
            <Widget
              className="widget--twitch-chat widget--iframe"
              key={"widget"+i}
              i={i}
              {...widgetsFunctions}
              {...widget}
            >
                <iframe src={"http://www.twitch.tv/" + this.props.params.username + "/chat?popout="} frameBorder="0" scrolling="no" ></iframe>
            </Widget>
          );
          break;
        case 'streampoll':
          return (
            <Widget
              className="stream-poll"
              key={"widget"+i}
              i={i}
              {...widgetsFunctions}
              {...widget}
            >
              <header className="logo-header" >
                <Link to={"/"} className="logo" ></Link>
              </header>
              <div className="widget__content">
                { this.props.children || waiting }
              </div>
            </Widget>
          );
          break;

        case 'twitter-feed':
          return (
            <Widget
              className="widget--twitter-feed widget--iframe"
              key={"widget"+i}
              i={i}
              username={this.props.username}
              {...widgetsFunctions}
              {...widget}
              ref="twitterWidget"
            >
              <div ref="twitterFeed"></div>
            </Widget>
          );
          break;

      }

    });

    inactiveWidgets = inactiveWidgets.map((widget,i) => {
      return (
        <a href="" className="inactive-widgets__widget" onClick={this.activateWidget.bind(this, widget)}>+ {widget.title}</a>
      );
    });


    let leftBar = null;
    if (inactiveWidgets.length) {
      leftBar = (
        <div className="inactive-widgets" >
          { inactiveWidgets }
        </div>
      );
    }

    let stylePopoverLogin = {
      display: this.state.loginPopover ? 'block' : 'none'
    };

    return (

      <div className="app ">

        <div className="popover-login popover" style={stylePopoverLogin}>
          <div className="popover__content">

            <header className="logo-header">
              <Link to={"/"} className="logo" ></Link>
            </header>

            <div className="popover__content__body">

              <a href="" onClick={this.closeSignin} className="popover__close" >skip</a>

              <p>Sign-in via Twitch<br/>and create polls for your viewers</p>
              <a href="" onClick={this.signin} className="twitch-signin" >
                <img src='https://camo.githubusercontent.com/e3dadf5d1f371961805e6843fc7d9d611a1d14b5/687474703a2f2f7474762d6170692e73332e616d617a6f6e6177732e636f6d2f6173736574732f636f6e6e6563745f6461726b2e706e67'/>
              </a>

            </div>

          </div>
          <div className="popover__background" onClick={this.closeSignin} ></div>
        </div>

        <div className="app__content">

          {leftBar}

          <div className="widgets" ref="widgets">
            { widgets }
          </div>

        </div>

      </div>
    );
  }

});

export default Layout;
