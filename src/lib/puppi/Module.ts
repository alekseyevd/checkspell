import PersonsModel from "../../components/directories/persons/models/Person";
import HttpServer from "../http";
import Controller from "./Controller";
import { _routes } from "./_global";

const global: { [k: string]: any } = {}

interface IService {
  constructor: Function
  init: Function
}

interface Class<T> {
  new(...args: any[]): T;
}

class App {
  _modules: Array<Class<Module>>
  _services: Array<Class<any>>
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
    this._services.forEach(S => {
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

class Module {
  controllers: Array<Class<Controller>>
  models: Array<Class<any>>
  routes: Array<any> = []

  constructor(params: any) {
    this.controllers = params.controllers
    this.models = params.models
  }

  init() {
    this.initModels()
    this.initControllers()
    this.prepare()
  }

  prepare() {}

  initModels() {
    this.models.forEach(S => {
      global[S.name] = new S()
    })
  }

  initControllers() {
    for (let C of this.controllers) {
      const controller = new C()
      const routes = _routes[C.name].map((r: any) => {

        r.action = controller.constructor.prototype[r.handler].bind(controller)
        return r
      })
      this.routes = this.routes.concat(routes)
    }
  }
}

class MyClass {
  constructor(@inject(PersonsModel) public model: PersonsModel) {}

  test() {
    console.log(this.model);
    
  }
}

function inject(param: Class<any>) {
  return function (target: any, methodKey: string, parameterIndex: number) {
    
    if (!global[param.name]) throw new Error('not registered')
    target[methodKey] = global[param.name];
  }
  
}

const app = new App({
  services: [PersonsModel],
  modules: []
})
app.init()
app.listen(5000)