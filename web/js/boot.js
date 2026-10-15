/* Arranque: enlaza TCMath, comprueba dependencias y lanza la interfaz. */
(function (TC) {
  "use strict";
  TC.TCMath = window.TCMath;
  var M = window.TCMath;
  function go() {
    if (!M) { document.getElementById("view").innerHTML = "<p>Error: no cargó math.js.</p>"; return; }
    TC.start();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})(window.TC);
