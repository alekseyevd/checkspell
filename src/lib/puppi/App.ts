import { IContext } from "../http/Context"

class App {
  static authenticate: Map<string, (ctx: IContext) => void> = new Map()
  static authorize: Map<string, (ctx: IContext) => boolean> = new Map()

}

App.authenticate.set('default', (ctx) => {
  ctx.set('user', 'anonymous')
})

export default App

