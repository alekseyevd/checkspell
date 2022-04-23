import IRoute from "../../interfaces/IRoute";
import { getModel } from "../database";
import { Class } from "../database/getModel";
import { Entity, IModel, Model } from "../database/Model";
import { IContext } from "../http/Context";
import { _routes } from "./_global";

export default class Controller {

  constructor(private _routes: Array<any>) {
    this._routes = _routes
  }

  get routes(): IRoute[] {
  
    return this._routes.map((r: any) => {
      const key = r.handler as string
      r.action = this.constructor.prototype[key].bind(this)
      return r
    })
  }

  // get routes(): IRoute[] {
  
  //   return _routes[this.constructor.name].map((r: any) => {
  //     const key = r.handler as string
  //     r.action = this.constructor.prototype[key].bind(this)
  //     return r
  //   })
  // }
}


