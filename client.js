const net = require('net');

const socket = new net.Socket();

const send = (message) => {
  //console.log('Client >', message);
  socket.write(message);
};

socket.on('data', (data) => {
  console.log('Server >', data.toString(), data);
});

socket.on('drain', () => {
  console.log('Event: 🤷');
});

socket.on('end', () => {
  console.log('Event: 🏁');
  console.dir({
    bytesRead: socket.bytesRead,
    bytesWritten: socket.bytesWritten,
  });
});

socket.on('error', (err) => {
  console.log('Event: 💩');
  console.log(err);
});

socket.on('timeout', () => {
  console.log('Event: ⌛');
});

socket.on('connect', () => {
  console.log('connected');
  send('44444444444');
  send('💩');
  send('666666666666');
  send('777777777');
  send('💩');
});

socket.connect({
  port: 2000,
  host: 'localhost',
});

send('1111111111111');
// send('222222222222222');
// send('💩');
// send('333333333');