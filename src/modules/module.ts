import { module } from "../lib/puppi/decorators";
import Module from "../lib/puppi/Module";
import TestController from "./testController";

@module({
  controllers: [
    TestController
  ]
})
export class TestModule extends Module {
  prepare() {}
}