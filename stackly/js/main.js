/* =====================================================================
   STACKLY — main.js
   Marketing site interactions: navbar, 3D tilt, reveal, counters,
   demo-link routing, form validation, footer socials
   ===================================================================== */

(function () {
  "use strict";

  /* ---------- Path helpers ---------- */
  var inPages = window.location.pathname.replace(/\\/g, "/").indexOf("/pages/") !== -1;
  var root = inPages ? "../" : "";
  var notFoundUrl = root + "404.html";
  var homeUrl = root + "index.html";

  /* ---------- Navbar: sticky shadow ---------- */
  var navbar = document.getElementById("navbar");
  if (navbar) {
    var onScroll = function () {
      navbar.classList.toggle("scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");
  var menuCta = document.getElementById("menuCta");
  var menuOpen = false;

  function setMenu(force) {
    menuOpen = typeof force === "boolean" ? force : !menuOpen;
    if (navLinks) navLinks.classList.toggle("open", menuOpen);
    if (menuBtn) {
      menuBtn.classList.toggle("open", menuOpen);
      menuBtn.setAttribute("aria-expanded", menuOpen ? "true" : "false");
    }
    if (menuCta) menuCta.classList.toggle("show", menuOpen);
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      setMenu();
    });
    if (navLinks) navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuOpen) setMenu(false);
  });

  /* ---------- Active nav link ---------- */
  var currentFile = (window.location.pathname.replace(/\\/g, "/").split("/").pop() || "index.html").toLowerCase();
  var slug = currentFile === "index.html" ? "home" : currentFile.replace(/\.html$/, "");
  document.querySelectorAll("[data-nav]").forEach(function (link) {
    var key = link.getAttribute("data-nav");
    var href = (link.getAttribute("href") || "").split("#")[0].replace(/\\/g, "/");
    var linkFile = (href.split("/").pop() || "index.html").toLowerCase();
    if (key === slug || (key === "home" && currentFile === "index.html" && linkFile === "index.html") || linkFile === currentFile) {
      link.classList.add("active");
    }
  });

  /* ---------- Demo / unavailable links -> 404 ---------- */
  document.addEventListener("click", function (e) {
    var target = e.target.closest(".js-demo, [data-demo], a[href$='#']");
    if (target && !target.closest(".js-demo-keep")) {
      e.preventDefault();
      window.location.href = notFoundUrl;
    }
  });

  /* Custom capture: also route plain anchors whose href is "#" to 404 */
  document.querySelectorAll("a[href='#']").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = notFoundUrl;
    });
  });

  /* ---------- Footer social icons -> 404 ---------- */
  document.querySelectorAll(".footer-social, .socials a").forEach(function (s) {
    s.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = notFoundUrl;
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = el.getAttribute("data-delay");
            el.style.transitionDelay = delay ? delay + "ms" : "0ms";
            el.classList.add("on");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("on");
    });
  }

  /* ---------- Animated number counters ---------- */
  function animateCounter(el) {
    var end = parseFloat(el.getAttribute("data-count") || "0");
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (String(end).split(".")[1] || "").length;
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (end * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counterEls = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counterEls.length) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counterEls.forEach(function (el) {
      cio.observe(el);
    });
  }

  /* =====================================================================
     3D interactions
     ===================================================================== */

  /* Tilt on hover — rotates element with perspective while cursor moves */
  document.querySelectorAll(".js-tilt").forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        "perspective(1000px) rotateY(" + px * 8 + "deg) rotateX(" + py * -8 + "deg) translateY(-4px)";
    });
    el.addEventListener("mouseleave", function () {
      el.style.transform = "";
    });
  });

  /* Subtle mouse-following parallax for a 3D scene (data-depth children) */
  document.querySelectorAll(".tilt-zone").forEach(function (zone) {
    var kids = zone.querySelectorAll("[data-depth]");
    if (!kids.length) return;
    zone.addEventListener("mousemove", function (e) {
      var r = zone.getBoundingClientRect();
      var cx = (e.clientX - r.left) / r.width - 0.5;
      var cy = (e.clientY - r.top) / r.height - 0.5;
      kids.forEach(function (kid) {
        var depth = parseFloat(kid.getAttribute("data-depth") || "8");
        kid.style.transform =
          "translate3d(" + cx * depth * -1 + "px, " + cy * depth * -1 + "px, 0)";
      });
    });
    zone.addEventListener("mouseleave", function () {
      kids.forEach(function (kid) {
        kid.style.transform = "";
      });
    });
  });

  /* =====================================================================
     Contact form validation
     ===================================================================== */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var fields = [
        { id: "cf-name", re: /^.{2,}$/, msg: "Please enter your full name." },
        { id: "cf-email", re: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: "Please enter a valid email address." },
        { id: "cf-subject", re: /^.{3,}$/, msg: "Please enter a subject." }
      ];
      fields.forEach(function (f) {
        var el = document.getElementById(f.id);
        var box = el.closest(".form-field");
        var msgEl = box.querySelector(".err-msg");
        if (!f.re.test(el.value.trim())) {
          ok = false;
          box.classList.add("invalid");
          if (msgEl) msgEl.textContent = f.msg;
        } else {
          box.classList.remove("invalid");
        }
      });
      var msgEl = document.getElementById("cf-message");
      var msgBox = msgEl.closest(".form-field");
      if (msgEl.value.trim().length < 10) {
        ok = false;
        msgBox.classList.add("invalid");
        var mmsg = msgBox.querySelector(".err-msg");
        if (mmsg) mmsg.textContent = "Message must be at least 10 characters.";
      } else {
        msgBox.classList.remove("invalid");
      }

      if (ok) {
        var alert = document.getElementById("contactAlert");
        if (alert) {
          alert.classList.add("success");
          alert.style.display = "flex";
        }
        contactForm.reset();
        setTimeout(function () {
          if (alert) alert.style.display = "none";
        }, 5000);
      } else {
        var firstBad = contactForm.querySelector(".form-field.invalid input, .form-field.invalid textarea");
        if (firstBad) firstBad.focus();
      }
    });
  }
})();
