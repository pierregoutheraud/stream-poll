var CONFIG = {
  ENV: 'dev'
};

if( window.location.hostname === 'localhost' ) {
  CONFIG.ENV = 'dev';
}

export default CONFIG;
