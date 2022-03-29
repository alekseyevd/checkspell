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

  async findUserByEmail(email: string) {
    const sql = `SELECT id, email, salt, password FROM users WHERE email in ($1) LIMIT 1;`
    const { rows } = await app.db.query(sql, [email])
    return rows[0]
  }

  async createSession(token: string, user_id: number, ip: string | undefined) {
    const expired_at = `current_timestamp + (30 * interval '1 minute')`
    const { rows } = await app.db.query(`
      INSERT INTO sessions (token, user_id, ip, expired_at)
        VALUES (
          '${token}', ${user_id}, '${ip}', ${expired_at}
        ) RETURNING id, expired_at;
    `)
    return rows[0]
  }

  async updateSession(id: number, token: string, newToken: string, ip: string | undefined) {
    const { rows } = await app.db.query(`
      UPDATE sessions 
        SET (token, ip, expired_at) =
        ('${newToken}', '${ip}', current_timestamp + (30 * interval '1 minute'))
        WHERE id = $1 and token = $2
        RETURNING id, expired_at;
    `, [id, token])
    return rows[0]
  }
}

export default new Auth