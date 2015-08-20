class User {

  constructor(socket, id) {
    this.id = socket.id;
    this.socket = socket;
    this.poll_id = id;
  }

}


class socketService {

  constructor() {
    this.users = [];
  }

  start(server) {
    let io = require('socket.io')(server);
    io.on('connection', (socket) => {

      let user;

      socket.on('poll', (data) => {
        let poll_id = data.id;
        console.log('new socket for poll', poll_id);
        user = new User(socket, poll_id);
        this.users.push(user);
      });
      socket.on('disconnect', () => {
        console.log('disconnect');
        this.removeUser(user);
      });

    });
  }

  removeUser (user) {
    for (let i=0,l=this.users.length;i<l;i++) {

      console.log(user.id, this.users[i].id);

      if (user.id == this.users[i].id) {
        console.log('remove poll !', i);
        this.users.splice(i,1);
        break;
      }
    }
  }

  newVote(poll_id, option_id, votes) {
    console.log('new vote !');
    for (let i=0,l=this.users.length;i<l;i++) {
      let user = this.users[i];
      if (user.poll_id == poll_id) {
        let data = {
          option_id: option_id,
          votes: votes
        };
        user.socket.emit('vote:new', data);
      }
    }
  }

}

module.exports = new socketService();
