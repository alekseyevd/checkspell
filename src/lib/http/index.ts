import { createServer, IncomingHttpHeaders, IncomingMessage, RequestListener, Server, ServerResponse } from 'http'
import formidable from 'formidable'
import IErrnoException from '../../interfaces/IErrnoException'
import IRoute from '../../interfaces/IRoute'
import { Context } from '../../interfaces/IRoute'

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
}

export default class HttpServer {
  private _routes: Array<any>
  private _server: Server
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

    try {
      const user = this._authenticate
        ? await this._authenticate(req.headers)
        : undefined

      const isUserHasAccessToRoute = this._authorize
        ? this._authorize(user, route.options)
        : true

      if (!isUserHasAccessToRoute) throw new Error('403')

      const { fields, files } = await new Promise((resolve, reject) => {
        formidable().parse(req, (error, fields, files) => {
          if (error) {
            reject(error)
            return
          }
          resolve({ fields, files})
        })
      })

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
          decodedKey = decodedKey.replace("[]", "")
          queryParams[decodedKey] || (queryParams[decodedKey] = [])
          queryParams[decodedKey].push(decodedValue)
        } else {
          queryParams[decodedKey] = decodedValue
        }
      })
    
      const context: Context = {
        body: fields,
        files,
        params,
        queryParams,
        headers: req.headers,
        user
      }

      if (this._validate) {
        this._validate(context, route.options)
      }

      //controller/handler
      const result = await route.action(context)

      //route.view

      //todo define response content type by route options
      //res.setHeader('Content-Type', 'text/html');
      res.end(JSON.stringify(result))

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
