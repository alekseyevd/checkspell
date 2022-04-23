import { Class } from "../database/getModel"
import { IContext } from "../http/Context"
import { _routes } from "./_global"
import { global } from './global'
import 'reflect-metadata'

export function get(route: string = '') {
  return function(target: any, prop: string, descriptor: PropertyDescriptor): void {
    if (!_routes[target.constructor.name]) {
      _routes[target.constructor.name] = []
    }
    _routes[target.constructor.name].push({
      method: 'get',
      path: route,
      handler: prop
    })
  }
}

export function post(route: string = '') {
  return function(target: any, prop: string, descriptor: PropertyDescriptor): void {
    if (!_routes[target.constructor.name]) {
      _routes[target.constructor.name] = []
    }
    _routes[target.constructor.name].push({
      method: 'post',
      path: route,
      handler: prop
    })
  }
}

export function put(route: string = '') {
  return function(target: any, prop: string, descriptor: PropertyDescriptor): void {
    if (!_routes[target.constructor.name]) {
      _routes[target.constructor.name] = []
    }
    _routes[target.constructor.name].push({
      method: 'put',
      path: route,
      handler: prop
    })
  }
}

export function del(route: string = '') {
  return function(target: any, prop: string, descriptor: PropertyDescriptor): void {
    if (!_routes[target.constructor.name]) {
      _routes[target.constructor.name] = []
    }
    _routes[target.constructor.name].push({
      method: 'delete',
      path: route,
      handler: prop
    })
  }
}

export const methods = {
  post, put, get,
  delete: del
}

// export function route(path: string) {
//   return function(constructor: any): void {
//     if (!_routes[constructor.name]) {
//       _routes[constructor.name] = []
//     }
//     _routes[constructor.name] = _routes[constructor.name].map((r: any) => {
//       r.path = path + r.path
//       return r
//     })
//   }
// }

export function route(path: string) {
  return function <K extends {new (...args: any[]): {}}> (Constructor: K) {
    if (!_routes[Constructor.name]) {
      _routes[Constructor.name] = []
    }
    const routes = _routes[Constructor.name].map((r: any) => {
      r.path = path + r.path
      return r
    })
    return class extends Constructor {
      constructor(...args: any) {
        super(...args)
      }

      get routes() {
        return routes.map((r: any) => {
          const key = r.handler as string
          r.action = this.constructor.prototype[key].bind(this)
          return r
        })
      }
    }
  }
}

export function auth() {
  return function(target: any, prop: string, descriptor: PropertyDescriptor): void {
    const original = descriptor.value
    descriptor.value = function (ctx: IContext) {
      if (!ctx.headers.authorization) throw new Error('auth err')
      ctx.set('user', 'authorized user')
      
      return original.call(this, ctx)
    }
  }
}

export function module(props: any) {
  return function<K extends {new (...args: any[]): {}}> (Constructor: K) {
    return class extends Constructor {
      constructor(...args: any) {
        super(props.controllers)
      }
    }
  }
}

export function inject(target: any, propertyKey: string, h: number) {

    
    //if (!global[param.name]) global[param.name] = new param()
    console.log(target);
    const key = Reflect.getOwnMetadata('design:paramtypes', target)
    console.log(key);
    // key.forEach((k: any) => {
    //   target.constructor.prototype[propertyKey] = 
    // })
    
   // target.constructor.prototype[propertyKey] = global[param.name];
  
}
export function resolve<T>(target: Class<any>): T {
  // tokens are required dependencies, while injections are resolved tokens from the Injector
  let tokens = Reflect.getMetadata('design:paramtypes', target) || []
  
  let injections = tokens.map((token: any) => new token);
  console.log(injections);
  
  
  return new target(...injections);
}