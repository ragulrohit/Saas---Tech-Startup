/* =====================================================================
   STACKLY — 404.js
   Floating 3D objects + cursor-synced number tilt
   ===================================================================== */

(function () {
  "use strict";

  var inPages = window.location.pathname.replace(/\\/g, "/").indexOf("/pages/") !== -1;
  var root = inPages ? "../" : "";
  var homeUrl = root + "index.html";

  /* Back to Home button */
  document.querySelectorAll("[data-back-home]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.location.href = homeUrl;
    });
  });

  /* Go Back uses history */
  document.querySelectorAll("[data-go-back]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = homeUrl;
      }
    });
  });

  /* Cursor-synced subtle 3D rotation for the 404 number */
  var n404 = document.querySelector(".n404");
  if (n404) {
    var bodyEl = document.body;
    bodyEl.addEventListener("mousemove", function (e) {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var dx = (e.clientX - cx) / cx;
      var dy = (e.clientY - cy) / cy;
      n404.style.transform =
        "rotateY(" + dx * 8 + "deg) rotateX(" + dy * -8 + "deg)";
    });
    bodyEl.addEventListener("mouseleave", function () {
      n404.style.transform = "";
    });
  }

  /* Generate a few extra random floating particles on touch prose */
  var shapes = [
    { cls: "sqr", top: "12%", left: "28%", delay: "0.6s" },
    { cls: "circle", top: "68%", left: "82%", delay: "2.4s" },
    { cls: "tri", top: "30%", left: "88%", delay: "3.1s" },
    { cls: "sqr", top: "78%", left: "14%", delay: "1.8s" }
  ];
  shapes.forEach(function (s) {
    var el = document.createElement("span");
    el.className = "shape " + s.cls;
    el.style.top = s.top;
    el.style.left = s.left;
    el.style.animationDelay = s.delay;
    document.body.appendChild(el);
  });
})();