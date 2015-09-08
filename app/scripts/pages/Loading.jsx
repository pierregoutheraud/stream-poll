import React from 'react';

var Loading = React.createClass({
  render: function() {
    /*return (
      <div className="loading">
        <p>{ this.props.text || "Loading..." }</p>
      </div>
    );*/

    return (
      <div className="loading">
        <p>{ this.props.text || "Loading..." }</p>
        <span className="loader">
          <span className="loader__inner"></span>
        </span>
      </div>
    );

  }
});

export default Loading;
