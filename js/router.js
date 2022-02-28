"use strict";

class Router {
  constructor(routes) {
    this.routes = routes;
    this.rootElem = document.getElementById("app");
    console.log("ROUTER CREATED", this.routes)
    this.start();
  }
  
  start() {
    
    const r = this.routes;
    console.log("ROUTER STARTED", this.routes);
    (function(scope, r) {
      window.addEventListener("routechange", () => {
        scope.hasChanged(scope, r)
      })
    });
    this.hasChanged(this, r);
  }
  
  hasChanged(scope, r) {
    console.log("SCOPE HAS CHANGED");
    if(window.location.hash.length > 0) {
      for(let i = 0; i < r.length; i++) {
        let route = r[i];
        if(route.isActiveRoute(window.location.hash.substr(1))) {
          scope.goToRoute(route.htmlName);
        }
      }
    } else {
      for(let i = 0; i < r.length; i++) {
        console.log(r[i])
        let route = r[i];
        if(route.defaultRoute) {
          console.log("THIS IS THE DEFAULT ROUTE!!")
          scope.goToRoute(route.htmlName);
        }
      }
    } 
  }
  
  goToRoute(htmlName) {
    console.log("GOING TO ", htmlName);
    (function(scope) {
      const url = "views/" + htmlName
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = () => {
        if(this.readyState === 4 && this.status === 200) {
          scope.rootElem.innerHTML = this.responseText;
        }
      };
      xhttp.open("GET", url, true);
      xhttp.send();
    })(this); 
  }
}