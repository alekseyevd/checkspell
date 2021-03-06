import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import IErrnoException from '../../interfaces/IErrnoException'
import IRoute from '../../interfaces/IRoute'
import { Context } from './Context'
import FileServer from './static'
import stream from 'stream'
import { IContext } from './Context'
import HttpError from './HttpError'

type HttpServerOptions = {
  routes?: Array<IRoute>,
  static?: { dir: string, cache?: number },
}

export default class HttpServer {
  private _routes: { [key: string]: { action: (context: IContext) => Promise<any>, options?: any } }
  private _matching: Array<any> = []
  private _server: Server
  private _static?: FileServer

  constructor(params: HttpServerOptions) {
    this._routes = {}
    if (params.routes) {
      params.routes.forEach(r => {
        const p = r.path.match(/\{[^\s/]+\}/g)?.map(k => k.slice(1, -1)) || []
        if (p.length) {
          this._matching.push({
            path: new RegExp('^' + r.path.replace(/\{[^\s/]+\}/g, '([\\w.=-]+)') + '$'),
            method: r.method,
            params: p,
            action: r.action,
            options: r.options
          })
        } else {
          const key = `${r.method}:${r.path}`
          this._routes[key] = { 
            action: r.action,
            options: r.options
          }
        }
      })
    }

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
    try {

      const url = new URL(req.url || '/', `http://${req.headers.host}`)
      let path = url.pathname
      let method = req.method?.toLocaleLowerCase() || 'get'
      let params: any
      let action = this._routes[`${method}:${path}`]?.action
      let options = this._routes[`${method}:${path}`]?.options

      if (!action) {
        const route = this._matching.find(r => {
          return r.path.test(path) && r.method === method
        })
        
        if (route) { 
          action = route.action
          path = route.path
          params = route.params
          options = route.options
        } else {
          if (this._static) {
            this._static.serveFiles(req, res)
            return
          }
          throw new HttpError(404, 'not found')
          // res.statusCode = 404
          // res.end('not found')
          return

        }
      }
  
      const context = new Context({
        url,
        path,
        params,
        res,
        req,
        options,
        // bodyParser: () => {
        //   return this.bodyParser(req, {
        //     minFileSize: 1000024
        //   })
        // }
      })

      // to do upload files if needed ?
      
      const result = await action(context)

      switch (typeof result) {
        case 'string':
          return res.end(result)
      
        case 'number':
          return res.end(result + '')

        case 'object':   
          if (result instanceof stream.Readable) {
            return result.pipe(res)
          }

          return res.end(JSON.stringify(result))

        case 'boolean':
          return res.end(result.toString())

        default:
          // todo throw error
          //console.log(res);

          if (res.getHeader('Connection') !== 'keep-alive') res.end()

          
          break;
      }

    } catch (err) {
        const error = err as Error
        res.statusCode = error instanceof HttpError 
          ? error.code
          : 500
        res.end(JSON.stringify({ message: error.message }))
        console.error(error);
        
    }
  }

  public listen(port: number, cb: () => void) {
    this._server.listen(port, cb)
  }

  private bodyParser(req: IncomingMessage, args: any): Promise<any> {
    return Promise.reject('BodyParser is not implemented')
  }
}
