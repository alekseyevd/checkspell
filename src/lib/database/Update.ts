import { Pool } from "pg";
import { Entity } from "./Model";

export default class Update {
  private _db: Pool
  private table: string
  private values?: string
  private condition?: string

  constructor(table: string, db: Pool) {
    this.table = table
    this._db = db
  }

  set(params: Entity) {
    this.values = Object.keys(params)
      .map(key => `${key} = '${params[key]}'`)
      .join(', ')

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
    sql += `;`

    console.log(sql);
    
    const res = await this._db.query(sql)
    
    return res.rowCount
  }
}