import Module from "../../lib/puppi/Module";
import { module } from "../../lib/puppi/decorators";
import PersonsController from "./controllers/person/PersonController";
import CompanyController from "./controllers/company/CompanyController";

@module({
  controllers: [
    PersonsController,
    CompanyController,
  ]
})
export class DirectoryModule extends Module {}