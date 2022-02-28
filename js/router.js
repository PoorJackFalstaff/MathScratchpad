"use strict";

class Router {
  constructor(routes) {
    this.routes = routes;
    this.rootElem = document.getElementById("app");
    this.start();
  }
  
  start() {
    const r = this.routes;
    (function(scope, r) {
      window.addEventListener("routechange", () => {
        scope.hasChanged(scope, r)
      })
    });
    this.hasChanged(this, r);
  }
  
  hasChanged(scope, r) {
    if(window.location.hash.length > 0) {
      for(let i = 0; i < r.length; i++) {
        let route = r[i];
        if(route.isActiveRoute(window.location.hash.substr(1))) {
          scope.goToRoute(route.htmlName);
        }
      }
    } else {
      for(let i = 0; i < r.length; i++) {
        let route = r[i];
        if(route.default) {
          scope.goToRoute(route.htmlName);
        }
      }
    } 
  }
  
  goToRoute(htmlName) {
    (function(scope) {
      const url = "views/" + htmlName
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange
    }) 
  }
}