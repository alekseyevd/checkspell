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

  let query = []

  socket.on('data', (buffer) => {
    console.log('Event: 📨', buffer);
    console.log('Data:', buffer.toString());
    const data = buffer.toString()

    const parts = data.split('💩')
    if (parts.length > 1) {
      parts.forEach((part, i) => {
        if (i === 0) {
          query.push(part)
          socket.emit('query', query.join())
        } else {
          socket.emit('query', part)
        }
      })
      query = []
    } else {
      console.log('psh');
      query.push(data)
    }

  });

  socket.on('query', (query) => {
    //console.log(paylod);
    socket.write('💋')
    socket.write(query)
  })

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

};

const server = net.createServer();

server.on('connection', connection);

server.listen(2000);