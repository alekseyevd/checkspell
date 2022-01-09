import { IContext } from "../../interfaces/IRoute";

export default interface PuppyContext extends IContext {
  get user(): any
}