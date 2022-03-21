import { IContext } from "../lib/http/Context"
import crypto from 'crypto'
import { pool } from '../db'

export default async function register(ctx: IContext) {
  var salt = crypto.randomBytes(128).toString('base64')
  var hmac = crypto.createHmac('sha256', salt);
  const {
    password,
    login,
    email,
  } = ctx.body
  const hashedPwd = hmac.update(password).digest('hex');
  const sql = `
    INSERT INTO users (login, password, salt, email)
      VALUES (
        $1, '${hashedPwd}', '${salt}', $2
      ) RETURNING id;
  `;
  const res = await pool.query(sql, [login, email]);
  return res
}