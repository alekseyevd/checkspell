import Controller from "./Controller";
import { injectable, resolve } from "./decorators";

interface Class<T> {
  new(...args: any[]): T;
}

export default class Module {

  constructor(private controllers: Array<Class<Controller>>) {}

  async prepare() {}

  getRoutes () {
    const routes = this.controllers.map(C => {

      const controller = resolve<any>(C)
      return controller.routes
    })
    return [].concat(...routes)
  }
}
