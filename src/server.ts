// import app from './app'

// app.start()

import Hashids from 'hashids'

const hashids = new Hashids("fghfgh", 10)
const id = hashids.encode(1, 2)
const numbers = hashids.decode(id);
console.log(id)
console.log(numbers);
;
