import { controllerRoutes } from "../../components/directories/persons/services/globals";
import IRoute from "../../interfaces/IRoute";
import { getModel } from "../database";
import { Class } from "../database/getModel";
import { Entity, IModel, Model } from "../database/Model";
import { IContext } from "../http/Context";

class Controller {
  model?: IModel
  constructor(model?: Class<IModel>) {
    if (model) this.model = getModel(model)
  }

  get routes(): IRoute[] {
    console.log(controllerRoutes[this.constructor.name]);
    
    return controllerRoutes[this.constructor.name].map((r: any) => {
      const key = r.handler as string
      r.handler = this.constructor.prototype[key].bind(this)
      return r
    })
  }
}

export default class Directory<T extends Model<Entity>> extends Controller {

  model: T

  constructor(model: Class<T>) {
    super()
    this.model = getModel(model)
  }

  async findAll(): Promise<Entity[]> {
    return this.model.findAll()
  }

  async findById(ctx: IContext) {
    const id = +ctx.query.id
    return this.model.findById(id)
  }

  async create() {}

  async update() {}

  async delete() {}
}

