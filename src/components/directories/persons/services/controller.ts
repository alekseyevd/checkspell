import { IContext } from "../../../../lib/http/Context";
import Directory from "../../../../lib/puppi/Controller";
import PersonsModel from "../models/Person";

function get(route: string) {
  return function(target: any, prop: string, descriptor: PropertyDescriptor): void {
    console.log('method', target.constructor.name);
    if (!target.constructor.routes) {
      target.constructor.routes = []
    }
    target.constructor.routes.push({
      method: 'get',
      path: route,
      handler: prop
    })
  }
}

function route(path: string) {
  return function(constructor: any): void {
    if (!constructor.routes) {
      constructor.routes = []
    }
    constructor.routes = constructor.routes.map((r: any) => {
      r.path = path + r.path
      return r
    })
  }
}

@route('/api/persons')
export class PersonController extends Directory<PersonsModel> {
  constructor() {
    super(PersonsModel)
  }

  @get('/')
  async findAll(){
    return super.findAll()
  }

  async findById(ctx: IContext){
    return super.findById(ctx)
  }

  async send(ctx: IContext) {
    console.log('send', ctx.get('user'));
    return this.model.findAll()

  }
}