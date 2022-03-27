import { JWTSECRET } from "../../config"
import { IContext } from "../../lib/http/Context"
import HttpError from "../../lib/http/HttpError"
import jwt from "../../lib/jwt"

export default function authenticateWithJWToken (ctx: IContext) {
  const token = ctx.headers.authorization?.split('Bearer ')[1]
  if (!token) throw new HttpError(401, 'Unauthorized')

  try {
    const { user } = jwt.verify(token, JWTSECRET)
    if (!user) throw new HttpError(401, 'Unauthorized')
    ctx.set('user', user)
  } catch (error) {
    throw new HttpError(401, 'Unauthorized')
  }

}