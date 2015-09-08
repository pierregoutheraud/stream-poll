import React from 'react/addons';
import { Link, Router, Navigation } from 'react-router';
// import _twitch_ from 'twitch-sdk/twitch.min.js';
import TwitchSDK from 'utils/TwitchSDK.js';
import user from 'Models/User.js';
import _ from 'underscore';

let ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Home = React.createClass({

  mixins: [ Navigation ],

  getInitialState: function() {

    let polls = [
      {
        question: 'What game should I play next ?',
        options: [
          {
            value: 'League of Legends',
            currentVote: 0,
            votes: 1432
          },
          {
            value: 'Counter Strike',
            currentVote: 0,
            votes: 771
          },
          {
            value: 'Dota 2',
            currentVote: 0,
            votes: 390
          }
        ],
      },
      {
        question: 'Is that guy cheating?',
        options: [
          {
            value: 'Yes',
            currentVote: 0,
            votes: 88
          },
          {
            value: 'No',
            currentVote: 0,
            votes: 7
          }
        ]
      },
      {
        question: 'Which weapon should I use ?',
        options: [
          {
            value: 'Magic hat',
            currentVote: 0,
            votes: 145
          },
          {
            value: 'Sword',
            currentVote: 0,
            votes: 112
          },
          {
            value: 'Rope',
            currentVote: 0,
            votes: 22
          }
        ]
      }
    ];

    return {
      polls: polls,
      current: Math.floor(Math.random()*polls.length)
    };
  },

  componentDidMount: function() {
    this.addVotes();
  },

  nextPoll: function () {

    let current = this.state.current === (this.state.polls.length - 1) ? 0 : this.state.current + 1;

    // reset votes
    let poll = this.state.polls[current];
    poll.options.forEach((option,i)=> {
      option.currentVote = 0;
    });

    this.setState({
      polls: this.state.polls,
      current: current
    });

    this.addVotes();

  },

  addVotes: function() {

    let poll = this.state.polls[this.state.current];

    let winner = _.max(poll.options, function(option){ return option.votes; });
    // console.log(maxVotes);

    poll.options.forEach((option,i)=>{
      if (option.currentVote < option.votes) option.currentVote += Math.floor((Math.random() * (winner.votes/30)) + 5);
    });

    this.setState({
      poll: poll
    });

    if (winner.currentVote >= winner.votes) {
      setTimeout(() => {
        this.nextPoll();
      }, 2000);
    } else {
      setTimeout(() => {
        this.addVotes();
      }, 100);
    }


  },

  signin: function(e) {
    e.preventDefault();
    TwitchSDK.signin();
  },

  watch: function() {
    let streamerUsername = React.findDOMNode(this.refs.streamerUsername).value;
    if (streamerUsername.length) this.transitionTo('/' + streamerUsername);
  },

  render: function() {

    let polls = [];
    for (let i=0;i< this.state.polls.length;i++) {

      if (i === this.state.current) {

        let poll = this.state.polls[i];

        let countVotes = 0;
        poll.options.forEach((option,i) => {
          countVotes += option.currentVote;
        });

        let options = _.sortBy(poll.options, 'currentVote');
        options.reverse();

        options = options.map((option, j) => {
          let percentage = Math.round((option.currentVote * 100) / countVotes);
          return (
            <li key={"option"+j} className="option option--result">
              
              <table>
                <tr>
                  <td className="option__case" >{j+1}</td>
                  <td className="option__value">{option.value}</td>
                </tr>
              </table>

              <div className="option__results" colSpan="2" >
                <div className="option__results__bar">
                  <div className="option__results__bar__progress" style={{width: percentage + "%"}} >
                    <span><strong>{percentage}</strong>%</span>
                  </div>
                </div>
                <div className="option__results__votes"><strong>{ option.currentVote }</strong> { option.currentVote > 1 ? 'votes' : 'vote' }</div>
              </div>

            </li>
          )
        });

        polls.push(
          <div key={"poll"+i} className="widget widget--streampoll widget--iframe widget--open" >
              <div className="widget--streampoll__main" >
                <div className="results" >
                <h1 className="question">{poll.question}</h1>
                  <ul className="options options--visible" >
                      {options}
                  </ul>
                  <div className="total" >
                    <span>Total: </span><strong><span>{countVotes}</span><span> </span><span>votes</span></strong>
                  </div>
                </div>
              </div>
          </div>
        );

        break;
      }
    }

    return (

      <div className="app home">

        <header className="home__header">
          <Link to={"/"} className="logo" ><span>beta</span></Link>
          <p>Ask questions to your viewers and find out what they think</p>
          <div className="home__header__results">
            <ReactCSSTransitionGroup transitionName="widget" transitionAppear={true} >
              { polls }
            </ReactCSSTransitionGroup>
          </div>
        </header>

        <div className="home__content ">

          <div className="home__cols">

              <div className="home__col">
                <div className="home__col__content">
                <h2>You are a streamer</h2>
                <p>Sign-in via Twitch and create polls for your viewers</p>
                <a href="" onClick={this.signin} className="twitch-signin" >
                  <img src='https://camo.githubusercontent.com/e3dadf5d1f371961805e6843fc7d9d611a1d14b5/687474703a2f2f7474762d6170692e73332e616d617a6f6e6177732e636f6d2f6173736574732f636f6e6e6563745f6461726b2e706e67'/>
                </a>
                </div>
              </div>

              <div className="home__col">
                <div className="home__col__content">
                  <h2>You are a viewer</h2>
                  <p>Give your opinion to your favorite streamer</p>

                  <div className="input-group">
                    <input ref="streamerUsername" type="text" className="input" placeholder="streamer username"/>
                    <button type="button" className="btn btn--black" onClick={this.watch}>ok</button>
                  </div>
                </div>
              </div>

          </div>

        </div>


      </div>

    );

  }

});

export default Home;
