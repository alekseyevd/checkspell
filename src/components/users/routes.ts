import Route from "../../lib/puppi/Route";
import login from "./services/login";
import logout from "./services/logout";
import refresh from "./services/refresh";
import register from "./services/register";

const routes: Route[] = [
  register,
  login,
  refresh,
  logout
]

export default routes