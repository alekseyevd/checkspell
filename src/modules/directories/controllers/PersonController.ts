import PersonsModel from "../models/Person";
import { Entity, Model } from "../../../lib/database";
import { IContext } from "../../../lib/http/Context";
import { Delete, Get, Post, Put, route } from "../../../lib/puppi/decorators";

class Directory {
  model!: Model<Entity>

  async findAll(ctx: IContext): Promise<Entity[]> {
    console.log(ctx.get('user'));
    
    return this.model.findAll()
  }
}

@route('/persons')
export default class PersonsController extends Directory {
  constructor(readonly model: PersonsModel) {
    super()
  }

  @Get()
  getList(ctx: IContext) {
    return super.findAll(ctx)
  }

  @Get('/{id}')
  getOne(ctx: IContext) {
    //TODO
    console.log(ctx.params);
    return 5
  }

  @Post()
  create(ctx: IContext) {
    //TODO
  }

  @Put('/{id}')
  update(ctx: IContext) {
    //TODO
  }

  @Delete()
  delete(ctx: IContext) {
    //TODO
  }

}