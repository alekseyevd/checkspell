import PersonsModel from "../components/directories/persons/models/Person";
import { IContext } from "../lib/http/Context";
import { get, route, inject } from "../lib/puppi/decorators";

@route('/test')
export default class TestController {

  constructor(private model: PersonsModel) {}

  @get()
  async find(ctx: IContext) {
    console.log(this.model);
    
    return this.model.findAll()
  }
}