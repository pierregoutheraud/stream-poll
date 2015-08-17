// ES5 shims for Function.prototype.bind, Object.prototype.keys, etc.
require('core-js/es5');
var context = require.context('./app/scripts', true, /.+\.test\.jsx?$/);
context.keys().forEach(context);