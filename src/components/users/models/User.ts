import { Model, table } from "../../../lib/database"


interface User {
  id: number,
  email: string,
  password: string,
  salt: string,
  phone: string,
  person: number,
  role: number
  name: string,
  created_at: Date
}

@table('users')
export default class UserModel extends Model<User> {

  async findByEmail(email: string): Promise<User> {
    const rows = await this.db.select(['*'])
      .from(this.table)
      .where(`email = '${email}'`)
      .limit(1)
      .exec()
    return rows[0]
  }
}


