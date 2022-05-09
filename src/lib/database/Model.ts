import { DataBase } from "."

export interface IModel {
  [key: string]: any,
}

export type Entity = {
  [key: string]: string | number | Date | null | Array<any>
}

export class Model<T extends Entity> implements IModel  {
  private _db: DataBase

  constructor(private _table: string) {
    this._db = DataBase.getInstance()
  }

  get db() { 
    return this._db
  }

  get table() {
    return this._table
  }

  find(params: any = {}): Promise<T[]> {
    return this.db.select(params.fields)
      .from(this.table)
      .where(params.filter)
      .limit(params.limit)
      .offset(params.skip)
      .exec()
  }

  async count() {
    const [res] = await this.find({
      fields: ['count(*)']
    })
    return res.count as number
  }

  async findById(id: number | string): Promise<T | undefined> {
    const result = await this.db.select(['*'])
      .from(this.table)
      .where(`id = '${id}'`)
      .limit(1)
      .exec()
    return result[0]
  }

  create() {
    return {} as T
  }

  save(params: T): Promise<T> {
    return this.db
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

  update(params: T, filter: string): Promise<number> {
    return this.db
      .update(this.table)
      .set(params)
      .where(filter)
      .exec()
  }
}


