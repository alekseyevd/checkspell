import PersonsModel from "../../components/directories/persons/models/Person";
import { IContext } from "../../lib/http/Context";
import { auth, Get, inject, route } from "../../lib/puppi/decorators";

@route('/test')
export default class TestController {

  constructor(private model: PersonsModel) {}

  @Get()
  @auth()
  async find(ctx: IContext) {

    return this.model.findAll()
  }
}