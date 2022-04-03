import { Pool } from "pg"
import Cursor from "./Cursor"

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

  select(fields: Array<string>) {
    return new Cursor({ fields }, this.pool)
  }

  query(sql: string) {
    return this.pool.query(sql)
  }

}