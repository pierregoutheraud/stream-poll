var CONFIG = {
  ENV: 'dev',
  SOCKET_ENDPOINT: 'http://127.0.0.1:10000'
  API_ENDPOINT: 'http://127.0.0.1:10000/api',
};

if( window.location.hostname === 'localhost' ) {
  CONFIG.ENV = 'dev';
}

export default CONFIG;
