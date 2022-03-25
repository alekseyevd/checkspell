import app from "../../../app"
import { JWTSECRET } from "../../../config"
import { IContext } from "../../../lib/http/Context"
import jwt from "../../../lib/jwt"
import Route from "../../../lib/puppi/Route"
import { Schema } from "../../../lib/validation/validate"

async function refresh(ctx: IContext) {
  const token = ctx.headers.authorization?.split('Bearer ')[1]
  if (!token) throw new Error('Unauthorized')
  const ip = ctx.req.socket.remoteAddress
  const refresh = ctx.body.token

  const payload = jwt.verify(refresh, JWTSECRET)
  const session_id = payload.id

  const newToken = jwt.update(token, JWTSECRET, 15 * 60000)

  const res = await app.db.query(`
    UPDATE sessions 
      SET (token, ip, expired_at) =
      ('${newToken}', '${ip}', current_timestamp + (30 * interval '1 minute'))
      WHERE id = $1 and token = $2
      RETURNING id, expired_at;
  `, [session_id, token])
  if (res.rows.length === 0) throw new Error('invalid token')

  const newRefresh = jwt.sign({
    id: res.rows[0].id,
    exp: res.rows[0].expired_at
  }, JWTSECRET)
  return { token: newToken, refresh: newRefresh }
}

export default new Route({
  path: '/refresh',
  method: 'post',
  handler: refresh,
  validate: {
    body: Schema({
      type: 'object',
      properties: {
        token: {
          type: 'string',
        }
      },
      required: ['token']
    })
  },
})
