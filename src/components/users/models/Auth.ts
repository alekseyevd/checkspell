import app from "../../../app";
import IErrnoException from "../../../interfaces/IErrnoException";
import HttpError from "../../../lib/http/HttpError";

class Auth {
  async registerUser(password: string, salt: string, email: string) {
    try {
      const sql = `
        INSERT INTO users (password, salt, email)
          VALUES (
            '${password}', '${salt}', $1
          ) RETURNING id;
      `;
      const { rows } = await app.db.query(sql, [email]);
      return rows[0].id
    } catch (error) {
      const er = error as IErrnoException
      if (er.code === "23505") {
        throw new HttpError(409, 'user already exists')
      }
      throw error
    }  
  }

  async findUserById(id: number) {
    const { rows } = await app.db.query(`SELECT * FROM users WHERE id = ${id};`)
    return rows[0]
  }

  async findUserByEmail(email: string) {
    const sql = `SELECT id, email, salt, password FROM users WHERE email in ($1) LIMIT 1;`
    const { rows } = await app.db.query(sql, [email])
    return rows[0]
  }

  async createSession(user_id: number, ip: string | undefined, user_agent: string, app_token: string) {
    const expired_at = `current_timestamp + (60 * interval '1 minute')`
    const { rows } = await app.db.query(`
      INSERT INTO sessions (user_id, ip, user_agent, app_token, expired_at)
        VALUES (
          ${user_id}, '${ip}', '${user_agent}', '${app_token}', ${expired_at}
        ) RETURNING id, expired_at;
    `)
    return rows[0]
  }

  async updateSession(id: number, app_token: string, ip: string | undefined) {
    const { rows } = await app.db.query(`
      UPDATE sessions 
        SET (ip, updated_at, expired_at) =
        ('${ip}', current_timestamp, current_timestamp + (30 * interval '1 minute'))
        WHERE id = $1 and app_token = $2
        RETURNING id, user_id, expired_at;
    `, [id, app_token])
    return rows[0]
  }

  async logout(id: number) {
    const { rows } = await app.db.query(`
      DELETE from sessions 
        WHERE id = $1
        RETURNING id, user_id, expired_at;
    `, [id])
    return rows[0]
  }
}

export default new Auth