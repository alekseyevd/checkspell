import { Pool } from "pg"
import { Entity } from "./Model"

export class Insert {
  private _db: Pool
  private table?: string
  private fields?: string
  private _values?: string

  constructor(db: Pool) {
    this._db = db
  }

  into(table: string) {
    this.table = table
    return this
  }

  values(params: Entity) {
    this.fields = Object.keys(params).join(', ')
    this._values = Object.values(params).map(v => {
      if (Array.isArray(v)){
        return `ARRAY [${v.map(k => `'${k}'`)}]`
      }
      return `'${v}'`
    }).join(', ')
    return this
  }

  async exec() {
    let sql = `INSERT INTO ${this.table} (${this.fields}) VALUES (${this._values}) RETURNING *;`
    console.log(sql);
    const { rows } = await this._db.query(sql)
    return rows[0]
  }
}