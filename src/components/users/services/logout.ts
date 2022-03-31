import { JWTSECRET } from "../../../config";
import { IContext } from "../../../lib/http/Context";
import HttpError from "../../../lib/http/HttpError";
import jwt from "../../../lib/jwt";
import Route from "../../../lib/puppi/Route";
import { Schema } from "../../../lib/validation/validate";
import Auth from "../models/Auth";

async function logout(ctx: IContext) {
  const token = ctx.body.token

  const { id } = jwt.verify(token, JWTSECRET)
  if (!id) throw new HttpError(401, 'invalid token')

  const session = await Auth.logout(id)
  if (!session) throw new HttpError(401, 'invalid token')

  return 'ok'
}

export default new Route({
  path: '/logout',
  method: 'post',
  handler: logout,
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
