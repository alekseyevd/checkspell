export interface IRoute {
  pathname: string,
  get?: () => void,
  post?: () => void
}