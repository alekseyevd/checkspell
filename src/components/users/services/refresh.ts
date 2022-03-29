import app from "../../../app"
import { JWTSECRET } from "../../../config"
import { IContext } from "../../../lib/http/Context"
import HttpError from "../../../lib/http/HttpError"
import jwt, { JWTError } from "../../../lib/jwt"
import Route from "../../../lib/puppi/Route"
import { Schema } from "../../../lib/validation/validate"
import Auth from "../models/Auth"

async function refresh(ctx: IContext) {
  const token = ctx.headers.authorization?.split('Bearer ')[1]
  if (!token) throw new HttpError(401, 'Unauthorized')

  const ip = ctx.req.socket.remoteAddress
  const refresh = ctx.body.token

  try {
    const { id } = jwt.verify(refresh, JWTSECRET)
    if (!id) throw new HttpError(401, 'invalid token')

    const newToken = jwt.update(token, JWTSECRET, 15 * 60000)
    const session = await Auth.updateSession(id, token, newToken, ip)
    if (!session) throw new HttpError(401, 'invalid token')

    const newRefresh = jwt.sign({
      id: session.id,
      exp: session.expired_at
    }, JWTSECRET)

    return { token: newToken, refresh: newRefresh }
  } catch (error) {
    if (error instanceof JWTError) throw new HttpError(401, 'invalid token')
    throw error
  }
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
