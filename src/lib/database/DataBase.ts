import { Pool } from "pg"
import Cursor from "./Cursor"
import { Insert } from "./Insert"
import Update from "./Update"
import 'dotenv/config'

export class DataBase {
  static instance: DataBase

  _pool!: Pool

  constructor() {
    if (DataBase.instance) return DataBase.instance
    this._pool = new Pool()
    this._pool.connect()
    DataBase.instance = this
  }

  static getInstance() {
    return DataBase.instance
  }

  connect() {
    this._pool.connect()
  }

  select(fields: Array<string>) {
    return new Cursor({ fields }, this._pool)
  }

  insert() {
    return new Insert(this._pool)
  }

  update(table: string) {
    return new Update(table, this._pool)
  }

  query(sql: string, args: any[] = []) {
    return this._pool.query(sql, args)
  }

}