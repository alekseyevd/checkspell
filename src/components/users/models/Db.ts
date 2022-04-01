import { Pool } from "pg";

export class DataBase {
  static instance: DataBase

  pool: Pool

  constructor() {
    if (DataBase.instance) {
      this.pool = DataBase.instance.pool
      return 
    } 
    this.pool = new Pool()
    DataBase.instance = this
  }

  static getInstance() {
    return DataBase.instance.pool
  }

  connect() {
    this.pool.connect()
  }
}

class Cursor {
  private fields: string[]
  private table: string | undefined
  private whereClause: string | undefined
  private orderBy: string | undefined
  private limitClause: number | undefined
  private offsetClause: number | undefined

  constructor(params: any) {
    this.fields = params.fields || ['*']

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

  async exec() {
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
    console.log(sql);
    
    const { rows } = await DataBase.instance.pool.query(sql)
    return rows
  }
}

function select(fields: Array<string>) {
  return new Cursor({
    fields
  })
}

export default {
  query: (str: string) => DataBase.instance.pool.query(str),
  select
}