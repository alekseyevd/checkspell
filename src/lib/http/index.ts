import { createServer, IncomingHttpHeaders, IncomingMessage, RequestListener, Server, ServerResponse } from 'http'
import formidable from 'formidable'
import IErrnoException from '../../interfaces/IErrnoException'
import IRoute from '../../interfaces/IRoute'

interface IAuthenticate { 
  (params: { body: any, headers: IncomingHttpHeaders}) : Promise<object | undefined>
}

interface IAuthorize {
  (user: any, route: any) : boolean
}

export default class HttpServer {
  private _routes: Array<any>
  private _server: Server
  private _authenticate: IAuthenticate
  private _authorize: IAuthorize

  constructor(
    routes: Array<IRoute>,
    authenticate: IAuthenticate = async () => undefined,
    authorize: IAuthorize
  ) {
    this._routes = routes.map(route => {
      return { 
        ...route,
        path: new RegExp("^" + route.path.replace(/\{[^\s/]+\}/g, '([\\w-]+)') + "$"),
        params: route.path.match(/\{[^\s/]+\}/g)?.map(k => k.slice(1, -1)) || []
      }
    })

    this._authenticate = authenticate.bind(this)
    this._authorize = authorize.bind(this)

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
          decodedKey = decodedKey.replace("[]", "")
          queryParams[decodedKey] || (queryParams[decodedKey] = [])
          queryParams[decodedKey].push(decodedValue)
        } else {
          queryParams[decodedKey] = decodedValue
        }
      })
      
      try {
        //TODO Authenticate
        const user = await this._authenticate({ body: { ...fields }, headers: req.headers })

        const isUserHasAccessToRoute = this._authorize(user, route.params)
        if (!isUserHasAccessToRoute) throw new Error('403')

        const context = {
          body: fields,
          files,
          params,
          queryParams,
          headers: req.headers,
          user
        }

        this.validate(context, route.params)

        const result = await route.action(context)
        res.end(JSON.stringify(result))
      } catch (error) {
        //TODO handle error
        res.statusCode = 500
        res.end(JSON.stringify({ message: error.message }))
      }
    })
  }

  public listen(...args: any) {
    this._server.listen(...args)
  }

  useValidation(fn: () => void) {
    this.validate = fn
  }

  validate(context: any, params: any) {}
}
