import { createServer, IncomingHttpHeaders, IncomingMessage, Server, ServerResponse } from 'http'
import formidable from 'formidable'
import IErrnoException from '../../interfaces/IErrnoException'
import IRoute from '../../interfaces/IRoute'
import { Context } from '../../interfaces/IRoute'
import FileServer from './static'
import stream from 'stream'

interface IAuthenticate { 
  (headers: IncomingHttpHeaders) : Promise<object | undefined>
}

interface IAuthorize {
  (user: any, route: any) : boolean
}

interface IValidate {
  (context: Context, route: any) : boolean | never
}

type HttpServerOptions = {
  routes: Array<IRoute>,
  port: number,
  static?: FileServer
}

export default class HttpServer {
  private _routes: Array<any>
  private _server: Server
  private _static?: FileServer
  private _authenticate: IAuthenticate | undefined
  private _authorize: IAuthorize | undefined
  private _validate: IValidate | undefined
  private port: number

  constructor(params: HttpServerOptions) {
    this._routes = params.routes.map(route => {
      return { 
        ...route,
        path: new RegExp("^" + route.path.replace(/\{[^\s/]+\}/g, '([\\w-]+)') + "$"),
        params: route.path.match(/\{[^\s/]+\}/g)?.map(k => k.slice(1, -1)) || []
      }
    })

    this.port = params.port

    this._static = params.static

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
    const path = url.pathname
    const method = req.method ? req.method.toLowerCase() : 'get'
  
    const route = this._routes.find(r => {   
      return r.method === method && r.path.test(path)
    })
  
    if (!route) {
      if (this._static) {
        this._static.serveFiles(req, res)
        return
      }
      
      res.statusCode = 404
      res.end('not found')
      return
    } 

    try {
      const user = this._authenticate
        ? await this._authenticate(req.headers)
        : undefined

      const isUserHasAccessToRoute = this._authorize
        ? this._authorize(user, route.options)
        : true

      if (!isUserHasAccessToRoute) throw new Error('403')

      const values = path.match(route.path)?.slice(1) || []
      const params : { [key: string]: string | number; } = {}
      for (let i = 0; i < route.params.length; i++) {
        //params[route.params[i]] = isNaN(+values[i]) ? values[i] : +values[i]
        params[route.params[i]] = values[i]
      }
    
      const context = new Context({
        url,
        params,
        user,
        res,
        req
      })

      if (this._validate) {
        this._validate(context, route.options)
      }

      //controller/handler
      const result = await route.action(context)
      //todo make available to set headears (context.setheaders)
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

      //to-do check typeof result
      //string -> html + view engine
      //object = json.stringify
      //steam - sream.pipe(res)

      //todo define response content type by route options
      //res.setHeader('Content-Type', 'text/html');

      // console.log(res.writableEnded);
      
      // res.end(JSON.stringify(result))
      // console.log(res.writableEnded);
      

    } catch (error) {
        //TODO handle error
        res.statusCode = 500
        res.end(JSON.stringify({ message: error.message }))
    }
  }

  public listen(cb: () => void) {
    this._server.listen(this.port, cb)
  }

  // private async _authenticate(params: { body: any, headers: IncomingHttpHeaders}): Promise<object | undefined> {
  //   return undefined
  // }

  public useAuth(fn: IAuthenticate) {
    this._authenticate = fn
  }

  public useAccessControl(fn: IAuthorize) {
    this._authorize = fn
  }

  public useValidation(fn: IValidate) {
    this._validate = fn
  }
}
