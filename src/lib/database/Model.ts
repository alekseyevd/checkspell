import { DataBase } from "."

export class Model<T> {
  table: string
  db: DataBase

  constructor(name: string) {
    this.table = name
    this.db = DataBase.instance
  }

  async findAll(params: any = {}): Promise<Array<T>> {
    return await this.db.select(params.fields)
      .from(this.table)
      .where(params.where)
      .limit(params.limit)
      .exec()
  }

  async findById(id: number) {
    return await this.db.select(['*'])
      .from(this.table)
      .where(`id = ${id}`)
      .limit(1)
      .exec()
  }

  async create(params: any) {
    const keys = Object.keys(params).join(', ')
    const values = Object.values(params).map(v => `'${v}'`).join(', ')
    const sql = `INSERT INTO ${this.table} (${keys}) VALUES (${values}) RETURNING id;`
    
    return await this.db.query(sql)
  }
}


