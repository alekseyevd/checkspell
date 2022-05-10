import { Entity, Model, table } from "../../../lib/database";

export interface Company extends Entity {
  id: number
  name: string
  fullname: string | null
  shortname: string | null
  inn: string | null
  kpp: string | null
  ogrn: string | null
  address: string | null
}

@table('companies')
export default class CompanyModel extends Model<Company> {}
