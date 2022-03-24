import { JWTSECRET } from "../../config"
import { IContext } from "../../lib/http/Context"
import HttpError from "../../lib/http/HttpError"
import jwt from "../../lib/jwt"

export default function authenticateWithJWToken (ctx: IContext) {
  const token = ctx.headers.authorization?.split('Bearer ')[1]
  if (!token) throw new HttpError(400, 'Invalid token')

  const { user } = jwt.verify(token, JWTSECRET)
  if (!user) throw new HttpError(400, 'Invalid token')
  ctx.set('user', user)
}