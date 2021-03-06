import { Entity, Model, table } from "../../../lib/database";

export interface Person extends Entity {
  id: number
  user_id: number | null
  name: string
  surname: string
  middlename: string | null
  birth_date: Date | null
  sex: 'male' | 'female' | null
  email: string | null
  phone: string[] | null
}

@table('persons')
export default class PersonsModel extends Model<Person> {
  async findByEmail(): Promise<Array<Person>>{    
    return this.db.select(['*'])
      .from(this.table)
      .exec()
  }
}
