var safe = require('safe-regex');

var route = "/users/{uid}/pictures/{ty}";
const paramRegex = /\{[^\s/]+\}/g;
var routeMatcher = new RegExp("^" + route.replace(/\{[^\s/]+\}/g, '([\\w-]+)') + "$");
var url = "/users/1024/pictures/jj";

console.log(safe(routeMatcher))

const found = url.match(routeMatcher)
if (found) {
  const arrFound = found.slice(1)
  const keys = route.match(paramRegex)
  let res = {}
  for (let i = 0; i < arrFound.length; i++) {
    const key = keys[i].slice(1, -1)
    res[key] = arrFound[i]
  }
  // console.log(route.match(paramRegex).map(a => a.slice(1,-1)));
  // console.log(found.slice(1));
  console.log(res);
}

(function() {

  var routes = { // initial config
    '/': 'home',
    '/about': 'about',
    '/about/team': 'aboutTeam',
    '/about/team/:member': 'aboutMember'
  };
  // parse and recreate config for use
  routes = Object.keys(routes)
    // sort longest path first
    .sort(function(a,b){ return b.length - a.length; })
    // convert into more usable format
    .map(function(path) {
      return {
        // create regex
        path: new RegExp("^" + path.replace(/:[^\s/]+/g, '([\\w-]+)') + "$"),
        module: routes[path]
      };
    });
  // == [{ path: /^\/about\/team\//:([\w-]+)$/, module: "aboutMember" },  ...]


  // fake url for testing
  var url = "/about/team/jim";

  // loop through all routes, longest first
  for (var i = 0, l = routes.length; i < l; i++) {  
    // parse if possible
    var found = url.match(routes[i].path);
    if (found) { // parsed successfully
      //console.log("module: " + routes[i].module); // module to load
     // console.log("args:", found.slice(1)); // arguments for module
      break; // ignore the rest of the paths
    }
  }
})();