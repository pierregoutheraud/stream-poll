import React from 'react/addons';

var Layout = React.createClass({

  getInitialState: function() {
    return {
      open: true
    };
  },

  componentDidMount: function() {
    // console.log(this.props);
    // if (this.props.name === 'twitter-feed') {
      // console.log(this);
      // console.log( React.findDOMNode(this.props.children) );

      // twttr.ready( (twttr) => {
      //   twttr.widgets.createTimeline(
      //     "636662179987525632",
      //     React.findDOMNode(this.props.children),
      //     {
      //       width: 2000,
      //       screenName: this.props.username
      //     }
      //   );
      // });
    // }
  },

  close: function(e) {
    e.preventDefault();
    this.props.close(this.props.i);
  },

  bigger: function(e) {
    e.preventDefault();
    this.props.bigger(this.props.i);
  },
  smaller: function(e) {
    e.preventDefault();
    this.props.smaller(this.props.i);
  },

  moveRight: function(e) {
    e.preventDefault();
    this.props.moveRight(this.props.i);
  },
  moveLeft: function(e) {
    e.preventDefault();
    this.props.moveLeft(this.props.i);
  },

  render: function() {

    console.log(this.props);

    let toggleClass = this.state.open ? 'widget--open' : 'widget--closed';

    let widgetStyle = {
      flex: this.props.flex,
      order: this.props.order
    };

    return (
      <div className={"widget" + " " + this.props.className + " " + toggleClass} style={widgetStyle} >
        <header className="widget__header">
          <p className="widget__header__title">{ this.props.title }</p>
          <div className="widget__header__controls widget__header__controls--right">
              <a href="" onClick={this.moveLeft} className="widget__header__controls__left" ><i className="fa fa-caret-left"></i></a>
              <a href="" onClick={this.moveRight} className="widget__header__controls__right" ><i className="fa fa-caret-right"></i></a>
              <a href="" onClick={this.close} className="widget__header__controls__times" ><i className="fa fa-times"></i></a>
          </div>
          <div className="widget__header__controls widget__header__controls--left">
            <a href="" onClick={this.smaller}><i className="fa fa-minus"></i></a>
            <a href="" onClick={this.bigger} ><i className="fa fa-plus"></i></a>
          </div>
        </header>
        { this.props.children }
      </div>
    );

  }

});

export default Layout;
