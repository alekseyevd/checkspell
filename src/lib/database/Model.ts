import { DataBase } from "."

export type Entity = {
  [key: string]: string | number | Date | null 
}

export class Model<T extends Entity> {
  table: string
  db: DataBase

  constructor(name: string) {
    this.table = name
    this.db = DataBase.instance
  }

  async findAll(params: any = {}): Promise<T[]> {
    return await this.db.select(params.fields)
      .from(this.table)
      .where(params.where)
      .limit(params.limit)
      .exec()
  }

  async findById(id: number): Promise<T[]> {
    const result = await this.db.select(['*'])
      .from(this.table)
      .where(`id = ${id}`)
      .limit(1)
      .exec()
    return result[0]
  }

  create() {
    return {} as T
  }

  async save(params: T): Promise<T> {
    return await this.db
      .insert()
      .into(this.table)
      .values(params)
      .exec()

    // const keys = Object.keys(params).join(', ')
    // const values = Object.values(params).map(v => `'${v}'`).join(', ')
    // const sql = `INSERT INTO ${this.table} (${keys}) VALUES (${values}) RETURNING *;`
    
    // const { rows } = await this.db.query(sql)
    // return rows[0]
  }
}


