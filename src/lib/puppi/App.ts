import { JWTSECRET } from "../../config"
import { IContext } from "../http/Context"
import jwt from "../jwt"

class App {
  static authenticate: Map<string, (ctx: IContext) => void> = new Map()
  static authorize: Map<string, (ctx: IContext) => boolean> = new Map()

}

App.authenticate.set('default', (ctx: IContext) => {
  ctx.set('user', 'anonymous')
})
App.authenticate.set('jwt', (ctx: IContext) => {
  const token = ctx.headers.authorization?.split('Bearer ')[1]
  if (!token) throw new Error('Unauthorized')

  const { user } = jwt.verify(token, JWTSECRET)
  if (!user) throw new Error('Invalid token')
  ctx.set('user', user)
})

export default App

