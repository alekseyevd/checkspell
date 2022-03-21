import { IContext } from "../lib/http/Context";
import { pool } from '../db'
import crypto from 'crypto'
import jwt from "../lib/jwt";
import { JWTSECRET } from "../config";

export default async function login (ctx: IContext) {
  const {
    login, password
  } = ctx.body
  const sql = `SELECT id, login, email FROM users WHERE login in ($1) LIMIT 1`
  const { rows } = await pool.query(sql, [login])
  if (rows.length === 0) throw new Error('invalid credentials')

  var hmac = crypto.createHmac('sha256', rows[0].salt);
  const hashedPwd = hmac.update(password).digest('hex');
  if (hashedPwd !== rows[0].password) throw new Error('invalid credentials')

  const {
    id, email
  } = rows[0]

  const token = jwt.sign({ id, login, email}, process.env.JWTSECRET as string)
  await pool.query(`INSERT INTO sessions ()`)
  return token
}