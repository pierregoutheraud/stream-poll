import React from 'react';

var Loading = React.createClass({
  render: function() {
    return (
      <div className="loading">
        <p>{ this.props.text || "Loading..." }</p>
      </div>
    );
  }
});

export default Loading;
