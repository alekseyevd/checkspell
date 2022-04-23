import HttpServer from "../http";
import Module from "./Module";
import { global } from './global'

interface Class<T> {
  new(...args: any[]): T;
}

export default class App {
  _modules: Array<Class<Module>>
  _services?: Array<Class<any>>
  _routes: Array<any> = []
  _server?: HttpServer

  constructor(params: any) {
    this._modules = params.modules
    this._services = params.services
  }

  init() {
    this.initServices()
    this.initModules()
    this.initHttpServer()
  }

  initServices() {
    //to-do save to global container
    this._services?.forEach(S => {
      global[S.name] = new S()
    })
  }

  initModules() {
    this._modules.forEach(M => {
      const module = new M()
      module.init()
      this._routes = this._routes.concat(module.routes)
    })
  }

  initHttpServer() {
    this._server = new HttpServer({
      routes: this._routes
    })
  }

  listen(port: number) {
    this._server?.listen(port, () => console.log('server started'))
  }

  static get(serviceName: Class<any>) {
    return global[serviceName.name]
  }
}