function getAllFuncs(toCheck) {
  const props = [];
  let obj = toCheck;
  obj = Object.getPrototypeOf(obj)
      props.push(...Object.getOwnPropertyNames(obj));
  // console.log(Object.getOwnPropertyNames(obj));
  
  return props.sort().filter((e, i, arr) => { 
     if (e!=arr[i+1] && typeof toCheck[e] == 'function') return true;
  });
}

class Model {
  constructor() {
    this.prop = 1
  }
  fun1 () {}
  funn2 () {}
}

class ModelController extends Model {
  constructor() {
    super()
  }
  fun3() {}
  fun4() {}
}

class ModelController2 extends ModelController {
  fun5() {}
  get fun6() {}
}


const test = new ModelController2()
console.log(getAllFuncs(test))
