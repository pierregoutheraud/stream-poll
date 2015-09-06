class User {

  constructor() {
    this.id = null;
    this.logo = null;
    this.authenticated = false;
    this.streamer = false;
    this.username = null;
  }

  isCurrentStreamer (streamerUsername) {
    return this.streamer && this.username === streamerUsername;
  }

}

export default new User();
