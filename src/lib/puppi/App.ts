import { JWTSECRET } from "../../config"
import { IContext } from "../http/Context"
import jwt from "../jwt"

class App {
  static authenticate: Map<string, (ctx: IContext) => void> = new Map()
  static authorize: Map<string, (ctx: IContext) => boolean> = new Map()
}


export default App

