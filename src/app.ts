import { createServer, IncomingMessage, ServerResponse } from 'http'
import IErrnoException from './interfaces/IErrnoException'
import { URL } from 'url'
import routes from './routes'
import { PORT } from './config'
 
const app = createServer((req: IncomingMessage, res: ServerResponse) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)

    const path = url.pathname
    const method = req.method ? req.method.toLowerCase() : 'get'
  
    const route = routes.find(r => {    
      return r.method === method && r.path.test(path)
    })
  
    if (!route) {
      res.statusCode = 404
      res.end('not found')
      return
    } 
    
    const values = path.match(route.path)?.slice(1) || []

    const params : { [key: string]: string | number; } = {}
    for (let i = 0; i < route.params.length; i++) {
      params[route.params[i]] = isNaN(+values[i]) ? values[i] : +values[i]
    }
    
    //to-do validate params, payload, query
    const queryParams: { [key: string]: any } = {}
    url.searchParams.forEach((value, key) => {
      let decodedKey = decodeURIComponent(key)
      let decodedValue = decodeURIComponent(value)
      if (decodedKey.endsWith('[]')) {
        decodedKey = decodedKey.replace("[]", "");
        queryParams[decodedKey] || (queryParams[decodedKey] = [])
        queryParams[decodedKey].push(decodedValue)
      } else {
        queryParams[decodedKey] = decodedValue
      }
    })
    console.log(queryParams);
    
    
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