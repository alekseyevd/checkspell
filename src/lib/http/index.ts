import { createServer, IncomingMessage, RequestListener, Server, ServerResponse } from 'http'
import formidable from 'formidable'
import IErrnoException from '../../interfaces/IErrnoException'
import IRoute from '../../interfaces/IRoute'


export default class HttpServer {
  private _routes: Array<any>
  private _server: Server

  constructor(routes: Array<IRoute>) {
    this._routes = routes.map(route => {
      return { 
        ...route,
        path: new RegExp("^" + route.path.replace(/\{[^\s/]+\}/g, '([\\w-]+)') + "$"),
        params: route.path.match(/\{[^\s/]+\}/g)?.map(k => k.slice(1, -1)) || []
      }
    })
    this._server = createServer(this._listener.bind(this))
      .on('error', (error: IErrnoException) => {
        if (error.code === 'EACCES') {
          console.log(`No access to port`)
        }
      }).on('clientError', (err, socket) => {
        console.log(socket);
        
        //socket.end('HTTP/1.1 400 Bad Request')
      })
  }

  private _listener(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    const path = url.pathname
    const method = req.method ? req.method.toLowerCase() : 'get'
  
    const route = this._routes.find(r => {   
      return r.method === method && r.path.test(path)
    })
  
    if (!route) {
      res.statusCode = 404
      res.end('not found')
      return
    } 

    const form = formidable()
    form.parse(req, async (error, fields, files) => {
      if (error) {  
        res.statusCode = 400
        res.end(JSON.stringify({ result: false, message: error.message}))
      }
      const values = path.match(route.path)?.slice(1) || []
    
      const params : { [key: string]: string | number; } = {}
      for (let i = 0; i < route.params.length; i++) {
        //params[route.params[i]] = isNaN(+values[i]) ? values[i] : +values[i]
        params[route.params[i]] = values[i]
      }
      
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
      
      const context = {
        body: fields,
        files,
        params,
        queryParams,
        headers: req.headers
      }

      // to-do validate context
      const result = await route.action(context)
      res.end(JSON.stringify(result))
    })
  }

  public listen(...args: any) {
    this._server.listen(...args)
  }
}
