import Module from "../../lib/puppi/Module";
import { module } from "../../lib/puppi/decorators";
import PersonsController from "./controllers/PersonController";

@module({
  controllers: [
    PersonsController
  ]
})
export class DirectoryModule extends Module {}