import Route from "../../lib/puppi/Route"
import authenticate from "./default"
import authenticateWithJWToken from "./jwt"

export const enum AuthStratagy {
  default = 'default',
  jwt = 'jwt'
}


export default function setUpAuthenticationStratagies() {
  Route.authenticate.set(AuthStratagy.default, authenticate)
  Route.authenticate.set(AuthStratagy.jwt, authenticateWithJWToken)
}