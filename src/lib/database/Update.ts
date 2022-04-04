import { Pool } from "pg";

export default class Update {
  private _db: Pool
  private table: string
  private values?: string
  private condition?: string

  constructor(table: string, db: Pool) {
    this.table = table
    this._db = db
  }

  set(values: string[]) {
    this.values = values.join(', ')
    return this
  }

  where(condition: string) {
    this.condition = condition
    return this
  }

  async exec() {
    let sql = `UPDATE ${this.table} SET ${this.values}`
    if (this.condition) {
      sql += ` WHERE ${this.condition}` 
    }
    sql += ` RETURNING *;`

    const { rows } = await this._db.query(sql)
    return rows
  }
}