import CONFIG from 'config/config.js'

var log = function(){

  // if( CONFIG.ENV !== 'dev' || !CONFIG.DEBUG ) return false;
  // if( !CONFIG.DEBUG ) return false;
  if (CONFIG.ENV === 'prod') return false;

  var i = 0, type = 'debug', args = [];
  for (var key in arguments) {
    if (arguments.hasOwnProperty(key)) {
      var arg = arguments[key];
      if( i===0 && typeof arg === 'boolean' ) {
        if( arg )
          type = 'error';
        else
          type = 'console'
      } else if ( i==0 && arg === 'time' ) {
        type = 'time';
      } else if ( i==0 && arg === 'timeEnd' ) {
        type = 'timeEnd';
      } else {
        args.push(arg)
      }
      i++;
    }
  }

  switch (type) {
    case 'console':
      console.log.apply(console, args);
      break;
    case 'debug':
      console.debug.apply(console, args);
      break;
    case "error":
      console.error.apply(console, args);
      break;
    case "time":
      console.time.apply(console, args);
      break;
    case "timeEnd":
      console.timeEnd.apply(console, args);
      break;
  }
}

export default log
