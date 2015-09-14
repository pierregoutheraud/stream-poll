import React from 'react';

var Loading = React.createClass({
  render: function() {

    let classNameAbsolute = this.props.absolute ? ' loading--absolute' : '';

    return (
      <div className={"loading" + classNameAbsolute}>
        <p>{ this.props.text || this.props.children || "Loading..." }</p>
        <span className="loader">
          <span className="loader__inner"></span>
        </span>
      </div>
    );

  }
});

export default Loading;
