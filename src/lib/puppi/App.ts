import { IContext } from "../http/Context"

class App {
  authenticate: Map<string, (ctx: IContext) => void> 
  authorize: Map<string, (ctx: IContext) => void> 

  constructor() {
    this.authenticate = new Map()
    this.authorize = new Map()
  }
}

export default new App()
