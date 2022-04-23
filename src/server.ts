// import app from './app'

import { DataBase } from "./lib/database";
import App from "./lib/puppi/App";
import { TestModule } from "./modules/module";

// app.start()

//import Hashids from 'hashids'

// const hashids = new Hashids("fghfgh", 10)
// const id = hashids.encode(1, 2)
// const numbers = hashids.decode(id);
// console.log(id)
// console.log(numbers);

const app = new App({
  services: [ 
    DataBase 
  ],
  modules: [
    TestModule
  ]
})
app.init()
app.listen(5000)
