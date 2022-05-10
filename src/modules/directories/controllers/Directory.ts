import { Entity, Model } from "../../../lib/database"
import { IContext } from "../../../lib/http/Context"
import HttpError from "../../../lib/http/HttpError"
import { _routes } from "../../../lib/puppi/_global"

const PAGINATION_LIMIT = 20

export default class Directory {
  model!: Model<Entity>

  async findAll(ctx: IContext): Promise<Entity[]> {

    const limit = +ctx.query.limit || PAGINATION_LIMIT
    const page =  +ctx.query.page || 0

    //const count = await this.model.count()
   
    let skip = page * limit

    return this.model.find({
      skip,
      limit,
    })
  }

  async findOne(ctx: IContext): Promise<Entity> {
    const id = +ctx.params.id || 0
    const entity = await this.model.findById(id)
    if (!entity) throw new HttpError(404, 'not found')
    return entity
  }

  create(ctx: IContext): Promise<Entity> {
    const entity = ctx.body as Entity
    return this.model.save(entity)
  }

  async update(ctx: IContext) {
    const entity = ctx.body
    const id = ctx.params.id

    const rowCount = await this.model.update(entity, `id = '${id}'`)
    if (!rowCount) throw new HttpError(404, 'not found')

    ctx.res.statusCode = 204
    ctx.res.statusMessage = 'Updated successfully'
  }

  async delete (ctx: IContext) {
    const id = ctx.params.id
    const res = await this.model.db.query(`DELETE FROM ${this.model.table} WHERE id = $1`, [id])

    if (!res.rowCount) throw new HttpError(404, 'not found')

    ctx.res.statusCode = 204
    ctx.res.statusMessage = 'Deleted successfully'
  }
}