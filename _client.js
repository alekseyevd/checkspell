'use strict';

const net = require('net');

const socket = new net.Socket();

const send = (message) => {
  socket.write(message);
};

socket.on('data', (data) => {
  console.log('Server >', data.toString());
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
  send('💋');
  send('💋');
  send('💋');
  send('sfdsfgsdfghdfgh sdfhgkhsfdghfdshg sdfgkhdsfhg')
  socket.end()
});

socket.connect({
  port: 2000,
  host: '127.0.0.1',
});

