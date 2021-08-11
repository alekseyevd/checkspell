import { createServer, IncomingMessage, ServerResponse } from 'http'
import { IErrnoException } from './interfaces/IErrnoException'
import { IRouting } from './interfaces/IRouting'
import { URL } from "url"
import { IRoute } from './interfaces/IRouter'
 
const port = 5000

const routing: IRouting = {
  '/api/v1/': (req, res) => {
    res.end('find')
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