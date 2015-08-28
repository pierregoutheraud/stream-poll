import React from 'react/addons';

var WidgetTwitchChat = React.createClass({

  render: function() {
    return (
      <iframe src={"http://www.twitch.tv/" + this.props.streamerUsername + "/chat?popout="} frameBorder="0" scrolling="no" ></iframe>
    );
  }

});

export default WidgetTwitchChat;
