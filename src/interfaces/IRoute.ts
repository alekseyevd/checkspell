import { IContext } from "../lib/http/Context";

export default interface IRoute {
  method: string,
  path: string,
  action: (context: IContext) => Promise<any>
  options?: any,
  files?: any
}