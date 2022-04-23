import PersonsModel from "../../components/directories/persons/models/Person";
import Controller from "./Controller";
import { _routes } from "./_global";
import { global } from './global'
import { resolve } from "./decorators";

interface Class<T> {
  new(...args: any[]): T;
}

export default class Module {

  routes: Array<any> = []

  constructor(private controllers: Array<Class<Controller>>) {}

  init() {
    this.initControllers()
    this.prepare()
  }

  prepare() {}

  initControllers() {
    // for (let C of this.controllers) {
    //   const controller = new C()
    //   const routes = _routes[C.name].map((r: any) => {

    //     r.action = controller.constructor.prototype[r.handler].bind(controller)
    //     return r
    //   })
    //   this.routes = this.routes.concat(routes)
    // }
    for (let C of this.controllers) {
      //const controller = new C()
      //console.log(controller.routes);
      const controller = resolve<any>(C)

      this.routes = this.routes.concat(controller.routes)
    }
  }
}

// class MyClass {
//   constructor(@inject(PersonsModel) public model: PersonsModel) {}

//   test() {
//     console.log(this.model);
    
//   }
// }

function module(props: any) {
  return function<K extends {new (...args: any[]): {}}> (Constructor: K) {
    return class extends Constructor {
      constructor(...args: any) {
        super(props.controllers)
      }
    }
  }
}

@module({
  controllers: []
})
export class AUthModule extends Module {
  prepare() {}
}

class Auth extends Module {
  constructor() {
    super([])
  }

  async prepare() {}
}

function inject(param: Class<any>) {
  return function (target: any, methodKey: string, parameterIndex: number) {
    
    if (!global[param.name]) throw new Error('not registered')
    target[methodKey] = global[param.name];
  }
}
