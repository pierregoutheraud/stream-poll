var CONFIG = {
  ENV:  window.location.host === 'localhost:9999' ? 'dev' : 'prod',
};

if (CONFIG.ENV === 'dev') {
  CONFIG.SOCKET_ENDPOINT = 'http://127.0.0.1:10000';
  CONFIG.TWITCH_CLIENT_ID = 'px7pb4sktw8jxje799wioymtiyytdam';
} else {
  CONFIG.SOCKET_ENDPOINT = 'https://streampoll.herokuapp.com';
  CONFIG.TWITCH_CLIENT_ID = '8z8ljzqpkn3m7lsc0anv9w3wlouiox0';
}

console.log(CONFIG);

export default CONFIG;
