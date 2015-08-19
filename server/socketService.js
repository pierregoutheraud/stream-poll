class Poll {

  constructor(socket, id) {
    this.socket = socket;
    this.id = id;
  }

}


class socketService {

  constructor() {
    this.polls = [];
  }

  start(server) {
    let io = require('socket.io')(server);
    io.on('connection', (socket) => {
      socket.on('poll', (data) => {
        let poll_id = data.id;
        console.log('new socket for poll', poll_id);
        let poll = new Poll(socket, poll_id);
        this.polls.push(poll);
      });
    });
  }

  newVote(poll_id, option_id, votes) {

    console.log('socketService newVote');

    for (let i=0,l=this.polls.length;i<l;i++) {

      let poll = this.polls[i];

      if (poll.id == poll_id) {
        // console.log('FIND POLL !');
        let data = {
          option_id: option_id,
          votes: votes
        };
        poll.socket.emit('vote:new', data);
      }

    }

  }

}

module.exports = new socketService();
