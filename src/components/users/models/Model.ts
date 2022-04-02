import app from '../../../app'
import db from './Db'


export class Model<T> {
  table: string

  constructor(name: string) {
    this.table = name
  }

  async findAll(params: any = {}): Promise<Array<T>> {
    return await db.select(params.fields)
      .from(this.table)
      .where(params.where)
      .limit(params.limit)
      .exec()
  }

  async findById(id: number) {
    return await db.select(['*'])
      .from(this.table)
      .where(`id = ${id}`)
      .limit(1)
      .exec()
  }

  async create(params: any) {
    const keys = Object.keys(params).join(', ')
    const values = Object.values(params).map(v => `'${v}'`).join(', ')
    const sql = `INSERT INTO ${this.table} (${keys}) VALUES (${values}) RETURNING id;`
    
    return await db.query(sql)
  }
}

export function connect(name: string, entity: any) {
  const model = new Model(name)

  const Entyty = class extends entity {
    constructor() {
      super()
    }

    async save() {
      await model.create(this)
    }
  }

  return {
    model,
    entity: Entyty
  }
}

