import { Pool } from "pg"

export default class Cursor {
  private _db: Pool
  private fields: string[]
  private table: string | undefined
  private whereClause: string | undefined
  private orderBy: string | undefined
  private limitClause: number | undefined
  private offsetClause: number | undefined

  constructor(params: any, db: Pool) {
    this.fields = params.fields || ['*']
    this._db = db
  }

  from(name: string) {
    this.table = name
    return this
  }

  where(condition: string) {
    this.whereClause = condition
    return this
  }

  order(name: string) {
    this.orderBy = name
    return this
  }

  limit(limit: number) {
    this.limitClause = limit
    return this
  }

  offset(count: number) {
    this.offsetClause = count
    return this
  }

  async exec(values: string[] | undefined = undefined): Promise<Array<any>> {
    const { table, whereClause, orderBy, limitClause, offsetClause } = this;
    const fields = this.fields.join(', ');
    let sql = `SELECT ${fields} FROM ${table}`;
    if (whereClause) {
      sql += ` WHERE ${whereClause}`
    }
    if (orderBy) {
      sql += `ORDER BY ${orderBy}`
    }
    if (limitClause) {
      sql += ` LIMIT ${limitClause};`
    }
    if (offsetClause) {
      sql += ` OFFSET ${offsetClause}`
    }
    console.log(`${sql} [${values?.join(', ')}]`);
    
    const { rows } = await this._db.query(sql, values)
    return rows
  }
}