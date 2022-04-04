import { Entity, Model, table } from "../../../lib/database";

export interface Session extends Entity {
  id: number
  user_id: number
  ip: string
  user_agent: string
  app_token: string
  started_at: Date
  updated_at: Date
  expired_at: Date
}

@table('sessions')
export default class SessionModel extends Model<Session> {

  async createSession(user_id: number, ip: string | undefined, user_agent: string, app_token: string): Promise<Pick<Session, 'id' | 'expired_at'>> {
    const expired_at = `current_timestamp + (60 * interval '1 minute')`
    const { rows } = await this.db.query(`
      INSERT INTO sessions (user_id, ip, user_agent, app_token, expired_at)
        VALUES (
          ${user_id}, '${ip}', '${user_agent}', '${app_token}', ${expired_at}
        ) RETURNING id, expired_at;
    `)
    return rows[0]
  }

  async updateSession(id: number, app_token: string, ip: string | undefined) {
    const { rows } = await this.db.query(`
      UPDATE sessions 
        SET (ip, updated_at, expired_at) =
        ('${ip}', current_timestamp, current_timestamp + (30 * interval '1 minute'))
        WHERE id = $1 and app_token = $2
        RETURNING id, user_id, expired_at;
    `, [id, app_token])
    return rows[0]
  }

}