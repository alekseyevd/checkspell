import { createServer, IncomingMessage, ServerResponse } from 'http'
import { IErrnoException } from './interfaces/IErrnoException'
import { IRouting } from './interfaces/IRouting'
import { URL } from "url"
import path  from 'path'
import fs from 'fs'
import formidable from 'formidable'
import {Queue} from './Queue'
 
const port = 5000
const queue = new Queue()
let isBuisy = false


const routing: IRouting = {
  '/': (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="/api/v1/fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  },
  '/queue': (req, res) => {
    res.end('sdf' + queue.size)
  },
  '/api/v1/fileupload': (req, res) => {
    const filePath = path.join(__dirname, `../temp`);
    // const stream = fs.createWriteStream(filePath);
  
    // stream.on('open', () => req.pipe(stream))

    // stream.on('close', () => {
    //   // Send a success response back to the client
    //   const msg = `Data uploaded to ${filePath}`;
    //   console.log('Processing  ...  100%');
    //   console.log(msg);
    //   res.end(JSON.stringify({ status: 'success', msg }));
    //  });
     
    //  stream.on('error', err => {
    //   // Send an error message to the client
    //   console.error(err);
    //   res.end(JSON.stringify({ status: 'error', err }));
    //  });

    // const data: Array<Buffer> = [];
    // req.on('data', chunk => {
    //   data.push(chunk);
    // });
    // req.on('end', () => {
    //   console.log('end :', Buffer.concat(data).toString())
    //   res.end(JSON.stringify({ status: 'success' }));
    // })
    var form = new formidable.IncomingForm({ uploadDir: filePath });
    form.parse(req, function (err, fields, files) {
      //res.write('File uploaded');
      queue.put(files.filetoupload)
      res.end(JSON.stringify(queue, null, 2))
    });
    
  }
}


const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  
  const url = new URL(req.url || '/', `http://${req.headers.host}` )
  
  const f = routing[url.pathname]
  if (!f) {
    res.end('not found')
    return
  } 
  
  f(req, res)
});
 
server.listen(port, () => {
  setInterval(() => {
    if (isBuisy) return

    if (queue.size > 0) {
      isBuisy = true
      setTimeout(() => {
        queue.pick()
        isBuisy = false
      }, 10000)
    }
  }, 1000)
  console.log(`Server listening on port ${port}`)
})

server.on('error', (error: IErrnoException) => {
  if (error.code === 'EACCES') {
    console.log(`No access to port: ${port}`);
  }
});


server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});