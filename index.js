const crypto = require('crypto')
crypto.randomBytes(32, function(err, buffer) {
  var token = buffer.toString('base64');
  console.log(token);
});
//console.log((new Date()).getTime().toString(16))