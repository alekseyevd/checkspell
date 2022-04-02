import  db from "./Db";
import { Model } from "./Model";

interface User {
  id: number,
  name: string
}

function table(name: string) {
  return function<T extends {new (...args: any[]): {}}> (Constructor: T) {
    return class extends Constructor {
      constructor(...args: any) {
        super(name)
      }
    }
  }
}
export interface Type<T> extends Function { new (...args: any[]): T; }

@table('users')
export default class UserModel extends Model<User> {

  async findByEmail(email: string): Promise<User> {
    const rows = await db.select(['*'])
      .from(this.table)
      .where(`email = '${email}'`)
      .limit(1)
      .exec()
    return rows[0]
  }
}

// export function getModel<T extends Model<any>(constructor: T ) {
//   return new constructor()
// }
interface Class<T> {
  new(...args: any[]): T;
}

export function getModel<T>(TheClass: Class<T>, ...args: any[]): T {
  return new TheClass(...args);
}


//export const userModel = new UserModel()

