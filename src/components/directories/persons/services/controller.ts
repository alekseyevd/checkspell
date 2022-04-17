import { IContext } from "../../../../lib/http/Context";
import { get, route, methods, del, auth } from "../../../../lib/puppi/decorators";
import Directory from "../../../../lib/puppi/Directory";
import { _routes } from "../../../../lib/puppi/_global";
import PersonsModel from "../models/Person";

@route('/api/persons')
export class PersonController extends Directory<PersonsModel> {
  constructor() {
    super(PersonsModel)
  }

  @get()
  @auth()
  async findAll(ctx: IContext){
    return super.findAll(ctx)
  }

  @del()
  async findById(ctx: IContext){
    return super.findById(ctx)
  }

  async send(ctx: IContext) {
    console.log('send', ctx.get('user'));
    return this.model.findAll()

  }
}