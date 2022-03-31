import { Pool } from "pg";
import app from "../../../app";

class DataBase {
  static _instance: DataBase

  _db: Pool

  constructor() {
    if (DataBase._instance) {
      this._db = DataBase._instance._db
      return 
    } 
    this._db = new Pool()
    DataBase._instance = this
  }

  static getInstance() {
    return  DataBase._instance._db
  }
}

export default {
  query: (str: string) => DataBase._instance._db.query(str)
}