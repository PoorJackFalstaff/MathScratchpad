"use strict";

class Route {
  constructor(name, htmlName, defaultRoute) {
    this.name = name;
    this.htmlName = htmlName;
    this.defaultRoute = defaultRoute;
  }
  
  isActiveRoute(hashedPath){
    return hashedPath.replace("#", "") === this.name;
  }
}