import { IContext } from "../../../../lib/http/Context";
import { Body, Delete, Get, Post, Put, route } from "../../../../lib/puppi/decorators";
import CompanyModel from "../../models/Company";
import Directory from "../Directory"
import CompanySchema from './CompanySchema.json'

@route('/companies')
export default class CompanyController extends Directory {
  constructor(readonly model: CompanyModel) {
    super()
  }

  @Get()
  getList(ctx: IContext) {
    return super.findAll(ctx)
  }

  @Get('/{id')
  getOne(ctx: IContext) {
    return super.findOne(ctx)
  }

  @Post()
  @Body(CompanySchema)
  create(ctx: IContext) {
    return super.create(ctx)
  }

  @Put('/{id}')
  @Body(CompanySchema)
  update(ctx: IContext): Promise<void> {
    return super.update(ctx)
  }

  @Delete('/{id}')
  delete(ctx: IContext): Promise<void> {
    return super.delete(ctx)
  }
}