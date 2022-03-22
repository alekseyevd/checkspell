import { IContext } from "../lib/http/Context";
import { pool } from '../db'
import crypto from 'crypto'
import jwt from "../lib/jwt";
import { JWTSECRET } from "../config";

export default async function login (ctx: IContext) {
  const {
    login, password
  } = ctx.body
  const sql = `SELECT id, login, email, salt, password FROM users WHERE login in ($1) LIMIT 1`
  const { rows } = await pool.query(sql, [login])
  if (rows.length === 0) throw new Error('invalid credentials')

  var hmac = crypto.createHmac('sha256', rows[0].salt);
  const hashedPwd = hmac.update(password).digest('hex');
  if (hashedPwd !== rows[0].password) throw new Error('invalid credentials')

  const {
    id, email
  } = rows[0]

  const token = jwt.sign({ 
    user: {
      id, login, email 
    }
  }, JWTSECRET, 15 * 60000)

  const ip = ctx.req.socket.remoteAddress
  const expired_at = `current_timestamp + (30 * interval '1 minute')`
  const res = await pool.query(`
    INSERT INTO sessions (token, user_id, ip, expired_at)
      VALUES (
        '${token}', ${id}, '${ip}', ${expired_at}
      ) RETURNING id, expired_at
  `)

  const refresh = jwt.sign({
    id: res.rows[0].id,
    exp: res.rows[0].expired_at
  }, JWTSECRET)
  return { token, refresh }
}