import { Context } from "../../interfaces/IRoute";

class Controller {
  authenticate(context: Context): any {}

  authorize(user: any): boolean {
    return true
  }

  validate(context: Context) {}

  render(context: Context) {}

  async handleRequest(context: Context) {
    const user = this.authenticate(context)
    this.authorize(user) 
    this.validate(context)
    return this.render(context)
  }
}