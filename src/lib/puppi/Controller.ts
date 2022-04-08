import PersonsModel from "../../components/directories/persons/models/Person";
import { controllerRoutes } from "../../components/directories/persons/services/globals";
import IRoute from "../../interfaces/IRoute";
import { getModel } from "../database";
import { Entity, IModel, Model } from "../database/Model";

class Controller<T> {
  get routes(): IRoute[] {
    console.log(controllerRoutes[this.constructor.name]);
    
    return controllerRoutes[this.constructor.name].map((r: any) => {
      const key = r.handler as string
      r.handler = this.constructor.prototype[key].bind(this)
      return r
    })
  }

  model(): T {
    const c = this.constructor as any
    return getModel(c.model) 
  }
}

export default class DirectoryController<T extends Model<Entity>> extends Controller<Model<Entity>> {
  model(): T {
    const c = this.constructor as any
    return getModel(c.model) 
  }

  async find() {
    return this.model().findAll()
  }

  async findOne() {}

  async create() {}

  async update() {}

  async delete() {}
}

export class PersonController extends DirectoryController<PersonsModel> {
  static model = PersonsModel

  async find(){
    return super.find()
  }

  async send(ctx: IContext) {
    console.log('send', ctx.get('user'));
    return this.model().findAll()

  }
}