import React from 'react/addons';

var WidgetGoogle = React.createClass({

  render: function() {
    return (
      <iframe src="http://www.google.com/custom?q=&btnG=Search"></iframe>
    );
  }

});

export default WidgetGoogle;
