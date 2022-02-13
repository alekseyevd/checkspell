'use strict';

const net = require('net');

const connection = (socket) => {

  console.dir({
    localAddress: socket.localAddress,
    localPort: socket.localPort,
    remoteAddress: socket.remoteAddress,
    remoteFamily: socket.remoteFamily,
    remotePort: socket.remotePort,
    bufferSize: socket.bufferSize,
  });

  socket.write('💗');

  const buffers = []

  socket.on('data', (data) => {
    buffers.push(data)
  });

  socket.on('drain', () => {
    console.log('Event: 🤷');
  });

  socket.on('end', () => {
    const res = Buffer.concat(buffers)
    console.log(res.toString());
    socket.write(res.toString())
    socket.end()
  });

  socket.on('error', (err) => {
    console.log('Event: 💩');
    console.log(err);
  });

  socket.on('timeout', () => {
    console.log('Event: ⌛');
  });

};

const server = net.createServer({allowHalfOpen:true});

server.on('connection', connection);

server.listen(2000);