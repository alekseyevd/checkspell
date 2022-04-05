import { Model, table } from "../../../lib/database"
import { Entity } from "../../../lib/database/Model"


export interface User extends Entity {
  id: number,
  email: string,
  password: string,
  salt: string,
  phone: string | null,
  role: number
  created_at: Date | null
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


