import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import IErrnoException from '../../interfaces/IErrnoException'
import IRoute from '../../interfaces/IRoute'
import { Context } from '../../interfaces/IRoute'
import FileServer from './static'
import stream from 'stream'

type HttpServerOptions = {
  port: number,
  routes?: Array<IRoute>,
  static?: { dir: string, cache?: number }
}

export default class HttpServer {
  private _routes: { [key: string]: (context: Context) => Promise<any> } = {}
  private _matching: Array<any> = []
  private _server: Server
  private _static?: FileServer
  private port: number

  constructor(params: HttpServerOptions) {
    if (params.routes) {
      params.routes.forEach(r => {
        const p = r.path.match(/\{[^\s/]+\}/g)?.map(k => k.slice(1, -1)) || []
        if (p.length) {
          this._matching.push({
            path: new RegExp('^' + r.path.replace(/\{[^\s/]+\}/g, '([\\w-]+)') + '$'),
            params: p,
            action: r.action
          })
        } else {
          this._routes[r.path] = r.action
        }
      })
    }

    this.port = params.port

    this._static = params.static ? new FileServer(params.static) : undefined

    this._server = createServer(this._listener.bind(this))
      .on('error', (error: IErrnoException) => {
        if (error.code === 'EACCES') {
          console.log(`No access to port`)
        }
      }).on('clientError', (err, socket) => {
        console.log(socket);
        
        socket.end('HTTP/1.1 400 Bad Request')
      })
  }

  private async _listener(req: IncomingMessage, res: ServerResponse) { 
    // res.on('finish', () => {
    //   console.log('log data');
    // })
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    let path = url.pathname
    let params
    let action = this._routes[path]

    if (!action) {
      const route = this._matching.find(r => {
        return r.path.test(path)
      })

      if (route) {
        action = route.action
        path = route.path
        params = route.params
      } else {
        if (this._static) {
          this._static.serveFiles(req, res)
          return
        }
        
        res.statusCode = 404
        res.end('not found')
        return
      }
    }
  
    try {
      const context = new Context({
        url,
        path,
        params,
        res,
        req,
      })


      const result = await action(context)

      switch (typeof result) {
        case 'string':
          return res.end(result)
      
        case 'number':
          return res.end(result + '')

        case 'object':   
          if (result instanceof stream.Writable) {
            return result.pipe(res)
          } 

          return res.end(JSON.stringify(result))

        default:
          // todo throw error
          res.end()
          break;
      }

    } catch (error) {
        //TODO handle error
        res.statusCode = 500
        console.log(error);

        res.end(JSON.stringify({ message: error.message }))
    }
  }

  public listen(cb: () => void) {
    this._server.listen(this.port, cb)
  }
}
