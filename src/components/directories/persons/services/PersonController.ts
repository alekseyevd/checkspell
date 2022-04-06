import { get } from "http";
import { Entity, getModel, Model } from "../../../../lib/database";
import { Class } from "../../../../lib/database/getModel";
import PersonsModel from "../models/Person";

function instance<T>(Model: T) {
  //return function (Constructor: Class<Controller<T>>) {
  return function<K extends {new (...args: any[]): {}}> (Constructor: K) {
    return class extends Constructor {
      constructor(...args: any) {
        super(Model)
      }
    }
  }
}

class Controller<T extends Model<Entity>> {
  model: T
  constructor(model: Class<T>) {
    this.model = getModel(model)
  }

  async find() {
    return await this.model.findAll()
  }

  async findOne() {}

  async create() {}

  async update() {}

  async delete() {}
}

@instance(PersonsModel)
export default class PersonController extends Controller<PersonsModel> {

  @get('/')
  async send() {
    this.model.findAll()
  }


  async find(): Promise<Entity[]> {
    return super.find()
  }
}
