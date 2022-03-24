import { IContext } from "../../lib/http/Context";

export default function authenticate (ctx: IContext) {
  ctx.set('user', 'anonymous')
}