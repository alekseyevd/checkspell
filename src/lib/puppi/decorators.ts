import 'reflect-metadata'
import { Class } from "../database/getModel"
import { IContext } from "../http/Context"
import { _routes } from "./_global"



export function Get(route: string = '') {
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

export function Post(route: string = '') {
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

export function Put(route: string = '') {
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

export function Delete(route: string = '') {
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

export const HttpMethods = {
  Post, Put, Get, Delete
} as const

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
 
    const routes = _routes[Constructor.name]?.map((r: any) => {
      r.path = path + r.path
      return r
    }) || []
    return class extends Constructor {
      constructor(...args: any) {
        super(...args)
      }

      get routes() {
        return routes.map((r: any) => {
          r.action = this.constructor.prototype[r.handler].bind(this)
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

export function inject(prop: any) {
  return function (target: any, prop: any, t: any) {
    console.log(t);
  }
}

const injections: { [k: string]: any } = {}

export function resolve<T>(target: Class<any>): T {
  // tokens are required dependencies, while injections are resolved tokens from the Injector
  let tokens = Reflect.getMetadata('design:paramtypes', target) || []

  //console.log(Reflect.getOwnMetadata(target))
  
  let injections = tokens.map((token: any) => resolve<any>(token))
  if (injections[target.name]) return injections[target.name]

  injections[target.name] = new target(...injections)
  return injections[target.name]
}