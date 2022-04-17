import { Entity, Model } from "../database"
import { Class, getModel } from "../database/getModel"
import { IContext } from "../http/Context"
import Controller from "./Controller"

export default class Directory<T extends Model<Entity>> extends Controller {

  modelClass: Class<T>

  constructor(modelClass: Class<T>) {
    super()
    this.modelClass = modelClass
  }

  get model(): T {
    return getModel(this.modelClass)
  }

  async findAll(ctx: IContext): Promise<Entity[]> {
    console.log(ctx.get('user'));
    
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