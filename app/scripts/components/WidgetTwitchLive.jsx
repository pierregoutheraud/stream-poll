import React from 'react/addons';

var WidgetTwitchLive = React.createClass({

  render: function() {
    return (
      <iframe src={"http://www.twitch.tv/" + this.props.streamerUsername + "/embed"} frameBorder="0" scrolling="no" ></iframe>
    );
  }

});

export default WidgetTwitchLive;
