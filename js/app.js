"use strict";
// import {Router} from "/js/router.js"
// import {Route} from "js/route.js"
console.log(Router);
(function () {
  function init() {
    let router = new Router([
      new Route("bleh", "bleh.html", true),
      new Route("spreadsheet", "spreadsheet.html"),
    ]);
  }
  init();
})();
