import PersonsModel from "../../components/directories/persons/models/Person";
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
  modules: Array<any>
  _services: Array<Class<any>>

  constructor(params: any) {
    this.modules = params.modules
    this._services = params.services
  }

  start() {
    this.initServices()

  }

  initServices() {
    //to-do save to global container
    this._services.forEach(S => {
      global[S.name] = new S()
    })
  }

  get(serviceName: Class<any>) {
    return global[serviceName.name]
  }
}

class Module {
  controllers: Array<Class<Controller>>
  models: Array<Class<any>>

  constructor(params: any) {
    this.controllers = params.controllers
    this.models = params.models
  }

  initModels() {
    this.models.forEach(S => {
      global[S.name] = new S()
    })
  }

  initControllers() {
    return this.controllers.map((C: Class<Controller>) => {
      const c = new C()
      return _routes[C.name].map((r: any) => {
        const key = r.handler as string
        r.action = C.prototype[key].bind(c)
        return r
      })
    })
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

new App({
  services: [PersonsModel],

})