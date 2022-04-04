import { Pool } from "pg"
import Cursor from "./Cursor"
import { Insert } from "./Insert"
import Update from "./Update"

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

  insert() {
    return new Insert(this.pool)
  }

  update(table: string) {
    return new Update(table, this.pool)
  }

  query(sql: string, args: any[] = []) {
    return this.pool.query(sql, args)
  }

}