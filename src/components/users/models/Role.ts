import { Entity, Model, table } from "../../../lib/database";

export interface Role extends Entity {
  id: number,
  name: string
}

@table('roles')
export default class RoleModel extends Model<Role> {}