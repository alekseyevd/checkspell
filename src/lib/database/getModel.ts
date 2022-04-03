interface Class<T> {
  new(...args: any[]): T;
}

export function getModel<T>(Constructor: Class<T>, ...args: any[]): T {
  return new Constructor(...args);
}