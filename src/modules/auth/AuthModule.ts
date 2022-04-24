import Module from "../../lib/puppi/Module";
import { module } from "../../lib/puppi/decorators";
import AuthController from "./AuthController";

@module({
  controllers: [
    AuthController
  ]
})
export class AuthModule extends Module {}