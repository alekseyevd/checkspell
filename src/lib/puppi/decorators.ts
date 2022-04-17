import { IContext } from "../http/Context"
import { _routes } from "./_global"

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

export function route(path: string) {
  return function(constructor: any): void {
    if (!_routes[constructor.name]) {
      _routes[constructor.name] = []
    }
    _routes[constructor.name] = _routes[constructor.name].map((r: any) => {
      r.path = path + r.path
      return r
    })
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