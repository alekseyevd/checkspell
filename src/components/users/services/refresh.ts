import { JWTSECRET } from "../../../config"
import { getModel } from "../../../lib/database"
import { IContext } from "../../../lib/http/Context"
import HttpError from "../../../lib/http/HttpError"
import jwt, { JWTError } from "../../../lib/jwt"
import Route from "../../../lib/puppi/Route"
import { Schema } from "../../../lib/validation/validate"
import SessionModel from "../../../modules/auth/models/Session"
import UserModel from "../../../modules/auth/models/User"

async function refresh(ctx: IContext) {
  const app_token = ctx.headers.authorization?.split('Bearer ')[1]
  if (!app_token) throw new HttpError(401, 'Unauthorized')

  const ip = ctx.req.socket.remoteAddress
  const refresh = ctx.query.token

  try {
    const { id } = jwt.verify(refresh, JWTSECRET)
    if (!id) throw new HttpError(401, 'invalid token')

    const session = await getModel(SessionModel).updateSession(id, app_token, ip)
    if (!session) throw new HttpError(401, 'invalid app_token')

    const user = await getModel(UserModel).findById(session.user_id)
    const access_token = jwt.sign({
      user: {
        id: user.id,
        email: user.email
      }
    }, JWTSECRET, 15 * 60000)

    const newRefresh = jwt.sign({
      id: session.id,
      exp: session.expired_at
    }, JWTSECRET)

    return { token: access_token, refresh: newRefresh }
  } catch (error) {
    if (error instanceof JWTError) throw new HttpError(401, 'invalid token')
    throw error
  }
}

export default new Route({
  path: '/refresh',
  method: 'get',
  handler: refresh,
  validate: {
    query: Schema({
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
