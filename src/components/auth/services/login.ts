import crypto from 'crypto'
import app from "../../../app";
import { JWTSECRET } from "../../../config";
import { IContext } from "../../../lib/http/Context";
import jwt from "../../../lib/jwt";
import Route from '../../../lib/puppi/Route';
import { Schema } from '../../../lib/validation/validate';

const body = Schema({
  type: 'object',
  properties: {
    login: {
      type: 'string',
    },
    password: {
      type: 'string'
    }
  },
  required: ['login', 'password']
})

async function login (ctx: IContext) {
  const {
    login, password
  } = ctx.body
  const sql = `SELECT id, login, email, salt, password FROM users WHERE login in ($1) LIMIT 1`
  const { rows } = await app.db.query(sql, [login])
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
  const res = await app.db.query(`
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

export default new Route({
  path: '/login',
  method: 'post',
  handler: login,
  validate: {
    body
  }
})
