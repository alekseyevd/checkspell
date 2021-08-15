import { createServer, IncomingMessage, ServerResponse } from 'http'
import IErrnoException from './interfaces/IErrnoException'
import { URL } from 'url'
import { routes } from './routes'
import { PORT } from './config'
 
const app = createServer((req: IncomingMessage, res: ServerResponse) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)

    const path = url.pathname
    const method = req.method ? req.method.toLowerCase() : 'get'
    const route = routes.find(r => r.path === path && r.method === method)
  
    if (!route) {
      res.statusCode = 404
      res.end('not found')
      return
    } 
    route.action(req, res)
  } catch (error) {
    res.statusCode = 500
    res.end(JSON.stringify({ message: error.message }))
  }
})

app.on('error', (error: IErrnoException) => {
  if (error.code === 'EACCES') {
    console.log(`No access to port: ${PORT}`)
  }
})

app.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request')
})

export default app