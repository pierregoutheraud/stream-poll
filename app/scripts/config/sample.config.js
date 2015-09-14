var CONFIG = {
  ENV:  window.location.host === 'localhost:9999' ? 'dev' : prod,
};

if (CONFIG.ENV === 'dev') {
  CONFIG.SOCKET_ENDPOINT = 'http://127.0.0.1:10000';
} else {
  CONFIG.SOCKET_ENDPOINT = 'https://streampoll.herokuapp.com';
}

export default CONFIG;
