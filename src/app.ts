import { createServer, IncomingMessage, ServerResponse } from 'http'
import IErrnoException from './interfaces/IErrnoException'
import { URL } from 'url'
import { queue } from './Queue'
import outputRoute from './routes/output'
import fileuploadRoute from './routes/fileupload'
import mainRoute from './routes/main'
import IRoute from './interfaces/IRoute'
 
const port = process.env.NODE_ENV === 'production' ? 80 : 5000

const routes: Array<IRoute> = [
  { method: 'get', path: '/', action: mainRoute},
  { method: 'post', path: '/api/v1/', action: fileuploadRoute },
  { method: 'get', path: '/output/', action: outputRoute },
]

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}` )

  const path = url.pathname
  const method = req.method ? req.method.toLowerCase() : 'get'
  const route = routes.find(r => r.path === path && r.method === method)

  if (!route) {
    res.statusCode = 404
    res.end('not found')
    return
  } 
  route.action(req, res)
})
 
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
