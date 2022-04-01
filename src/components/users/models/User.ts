import  db from "./Db";
import { Model } from "./Model";

interface User {
  id: number,
  name: string
}

class UserModel<T> extends Model<User> {
  constructor(name: string) {
    super(name)
  }

  async findByEmail(email: string): Promise<T> {
    const rows = await db.select(['*'])
      .from(this.table)
      .where(`email = '${email}'`)
      .limit(1)
      .exec()
    return rows[0]
  }
}




export const userModel = new UserModel<User>('users')

