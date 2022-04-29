import Cursor from './Cursor'
import { DataBase } from './DataBase'

export { DataBase } from './DataBase'
export { Model } from './Model'
export { Entity } from './Model'
export { table } from './table'
export { getModel } from './getModel'

export function query(sql: string) {
  return DataBase.getInstance()._pool.query(sql)
}

export function select(fields: Array<string>) {
  return new Cursor({ fields }, DataBase.getInstance()._pool)
}