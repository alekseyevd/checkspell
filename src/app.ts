import { createServer, IncomingMessage, ServerResponse } from 'http'
import { IErrnoException } from './interfaces/IErrnoException'
import { IRouting } from './interfaces/IRouting'
import { URL } from "url"
import { queue } from './queue'
import outputRoute from './routes/output'
import fileuploadRoute from './routes/fileupload'
import mainRoute from './routes/main'
 
const port = process.env.NODE_ENV === 'production' ? 80 : 5000

const routing: IRouting = {
  '/': mainRoute,
  '/output/': outputRoute,
  '/api/v1/': fileuploadRoute
}

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}` )
  const route = routing[url.pathname]
  if (!route) {
    res.statusCode = 404
    res.end('not found')
    return
  } 
  route(req, res)
});
 
server.listen(port, () => {
  queue.start()
  console.log(`Server listening on port ${port}`)
})

server.on('error', (error: IErrnoException) => {
  if (error.code === 'EACCES') {
    console.log(`No access to port: ${port}`)
  }
})

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request')
})
