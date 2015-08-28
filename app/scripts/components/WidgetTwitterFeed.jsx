import React from 'react/addons';

var WidgetTwitchLive = React.createClass({

  componentDidMount: function() {

    twttr.ready( (twttr) => {
      twttr.widgets.createTimeline(
        "636662179987525632",
        React.findDOMNode(this.refs.twitterFeed),
        {
          width: 2000,
          screenName: this.props.streamerUsername
        }
      );
    });

  },

  render: function() {
    return (
      <div ref="twitterFeed"></div>
    );
  }

});

export default WidgetTwitchLive;
