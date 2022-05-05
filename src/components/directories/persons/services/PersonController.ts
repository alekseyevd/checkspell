import { Entity, getModel, Model } from "../../../../lib/database";
import { Class } from "../../../../lib/database/getModel";
import { IContext } from "../../../../lib/http/Context";
import Route from "../../../../lib/puppi/Route";
import { Schema } from "../../../../lib/validation/validate";
import PersonsModel from "../../../../modules/directories/models/Person";
import { controllerRoutes, routes } from "./globals";

function instance<T>(Model: T) {
  //return function (Constructor: Class<Controller<T>>) {
  return function<K extends {new (...args: any[]): {}}> (Constructor: K) {
    console.log('instance', Constructor.name);
    return class extends Constructor {
      static model = Model
      constructor(...args: any) {
        super(Model)
      }
    }
  }
}

class Controller<T extends Model<Entity>> {
  static model: Class<any>
  current: number
  constructor() {
    //this.model = getModel(model)
    this.current = 0
  }

  getRoutes() {
    console.log(controllerRoutes[this.constructor.name]);
    
    return controllerRoutes[this.constructor.name].map((r: any) => {
      const key = r.handler as string
      r.handler = this.constructor.prototype[key].bind(this)
      return new Route(r)
    })
  }

  get model(): T {
    const c = this.constructor as any
    return getModel(c.model) 
  }

  async find() {
    return this.model.findAll()
  }

  async findOne() {}

  async create() {}

  async update() {}

  async delete() {}
}

function get(route: string) {
  return function(target: any, prop: string, descriptor: PropertyDescriptor): void {
    console.log('method', target.constructor.name);
    if (!controllerRoutes[target.constructor.name]) {
      controllerRoutes[target.constructor.name] = []
    }
    controllerRoutes[target.constructor.name].push({
      method: 'get',
      path: route,
      handler: prop
    })
  }
}
function post(route: string) {
  return function(target: any, prop: string, descriptor: PropertyDescriptor): void {
    if (!controllerRoutes[target.constructor.name]) {
      controllerRoutes[target.constructor.name] = []
    }
    controllerRoutes[target.constructor.name].push({
      method: 'post',
      path: route,
      handler: prop
    })
  }
}

function auth() {
  return function(target: any, prop: string, descriptor: PropertyDescriptor): void {
    const original = descriptor.value
    descriptor.value = function (ctx: IContext) {
      if (!ctx.headers.authorization) throw new Error('auth err')
      ctx.set('user', 'authorized')
      
      return original.call(this, ctx)
    }
  }
}

function access() {
  return function(target: any, prop: string, descriptor: PropertyDescriptor): void {
    const original = descriptor.value
    descriptor.value = function (ctx: IContext) {
      console.log('access', ctx.get('user'));
      
      return original.call(this, ctx)
    }
  }
}

function route(path: string) {
  return function(constructor: Function): void {
    if (!controllerRoutes[constructor.name]) {
      controllerRoutes[constructor.name] = []
    }
    controllerRoutes[constructor.name] = controllerRoutes[constructor.name].map((r: any) => {
      r.path = path + r.path
      return r
    })
  }
}

function validateBody(jsonSchema: any) {
  return function(target: any, prop: string, descriptor: PropertyDescriptor): void {
    const original = descriptor.value
    descriptor.value = async function (ctx: IContext) {
      const { body } = await ctx.parseBody()

      const { errors } = Schema(jsonSchema)(body)
      if (errors?.length) throw new Error(errors.join(', '))
      
      return original.call(this, ctx)
    }
  }
}

//@instance(PersonsModel)
@route('/api/persons')
export default class PersonController extends Controller<PersonsModel> {
  static model = PersonsModel

  @post('')
  // @auth()
  // @access()
  async send(ctx: IContext) {
    console.log('send', ctx.get('user'));

    return super.find()
    //return this.model.findAll()

  }

  @post('/ttt')
  @validateBody({
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email'
      },
      password: {
        type: 'string'
      }
    },
    required: ['email', 'password']
  })


  async find(){
    return super.find()
  }
}
