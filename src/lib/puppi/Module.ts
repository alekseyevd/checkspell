interface IService {
  constructor: Function
  init: Function
}

interface Class {
  new(...args: any[]): any;
}

class App {
  modules: Array<any>
  _services: Array<Class>
  service: { [k: string]: any }
  constructor(params: any) {
    this.modules = params.modules
    this._services = params.services
    this.service = {}
  }

  start() {
    this.initServices()
    this.initModules(this.modules)
  }

  initServices() {
    //to-do save to global container
    this._services.forEach(S => {
      this.service[S.name] = new S()
    })
  }

  get(serviceName: Class) {
    return this.service[serviceName.name]
  }
}