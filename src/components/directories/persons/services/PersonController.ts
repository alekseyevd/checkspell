import { Entity, getModel, Model } from "../../../../lib/database";
import { Class } from "../../../../lib/database/getModel";
import Route from "../../../../lib/puppi/Route";
import UserModel from "../../../users/models/User";
import PersonsModel from "../models/Person";
import { routes } from "./globals";

function instance<T>(Model: T) {
  //return function (Constructor: Class<Controller<T>>) {
  return function<K extends {new (...args: any[]): {}}> (Constructor: K) {
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
  constructor(model: Class<T>) {
    //this.model = getModel(model)
  }

  getRoutes() {
    return routes.map(r => {
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
    const original = descriptor.value
    routes.push({
      method: 'get',
      path: route,
      handler: prop
    })
  }
}

@instance(PersonsModel)
export default class PersonController extends Controller<PersonsModel> {

  @get('/')
  async send() {

    return this.model.findAll()

  }

  @get('/ttt')
  async find(){
    return super.find()
  }
}
