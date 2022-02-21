import { IContext } from "../http/Context"

export default class App {
  static authenticate: Map<string, (ctx: IContext) => void> = new Map()
  static authorize: Map<string, (ctx: IContext) => boolean> = new Map()
}

