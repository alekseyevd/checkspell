import HttpServer from "../http";
import Module from "./Module";


interface Class<T> {
  new(...args: any[]): T;
}

interface IService {
  init(): Promise<void>
}

const Services: { [k: string]: IService } = {}

export default class App {
  _modules: Array<Class<Module>>
  _services?: Array<Class<IService>>
  _routes: Array<any> = []
  _server!: HttpServer

  constructor(params: any) {
    this._modules = params.modules
    this._services = params.services
  }

  async init() {
    await this.initServices()
    await this.initModules()
    this.initHttpServer()
  }

  async initServices() {
    if (this._services) {
      // сделать последовательно ?
      console.log('инициализация сервисов');
      
      await Promise.all(this._services.map(S => {
        Services[S.name] = new S()
        return Services[S.name]
      }).map(s => s.init()))
    }
  }

  async initModules() {

    for (const Module of this._modules) {
      const module = new Module()
      await module.prepare()
      this._routes.push(...module.getRoutes())
    }
    
  }

  initHttpServer() {
    this._server = new HttpServer({
      routes: this._routes
    })
  }

  listen(port: number) {
    this._server.listen(port, () => console.log('server started'))
  }

  static get(serviceName: Class<any>) {
    return Services[serviceName.name]
  }
}