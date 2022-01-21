import { IContext } from "../http/Context";

export default interface PuppyContext extends IContext {
  get user(): any
}