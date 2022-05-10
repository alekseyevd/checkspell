import PersonsModel from "../../models/Person";
import { IContext } from "../../../../lib/http/Context";
import { Body, Delete, Get, Post, Put, route } from "../../../../lib/puppi/decorators";
import Directory from "../Directory";
import PersonSchema from './PersonSchema.json'
// const PersonSchema = {
//   type: 'object',
//   properties: {
//     user_id: {
//       type: 'string'
//     },
//     name: {
//       type: 'string',
//     },     
//     surname: {
//       type: 'string'
//     },
//     middle_name: {
//       type: 'string'
//     },
//     birth_date: {
//       type: 'date'
//     },
//     sex: {
//       type: 'string',
//       enum: [ 'male', 'female'],
//     },
//     email: {
//       type: 'string',
//       format: 'email'
//     },
//     phone: {
//       type: 'array',
//       items: {
//         type: 'string'
//       }
//     },
//   },
//   required: ['name', 'surname']
// }


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
    return this.findOne(ctx)
  }

  @Post()
  @Body(PersonSchema)
  create(ctx: IContext) {
    return super.create(ctx)
  }

  @Put('/{id}')
  @Body(PersonSchema)
  update(ctx: IContext) {
    return super.update(ctx)
  }

  @Delete('/{id}')
  delete(ctx: IContext) {
    return super.delete(ctx)
  }
}
