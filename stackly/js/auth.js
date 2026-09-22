/* =====================================================================
   STACKLY — auth.js
   Login & signup validation, localStorage persistence, role handling
   ===================================================================== */

(function () {
  "use strict";

  var inPages = window.location.pathname.replace(/\\/g, "/").indexOf("/pages/") !== -1;
  var root = inPages ? "../" : "";
  var notFoundUrl = root + "404.html";

  /* ---------- Utilities ---------- */

  /* "rahul.kumar@gmail.com" -> "Rahul Kumar" */
  function readableName(email) {
    var base = (email || "").split("@")[0] || "";
    var parts = base.split(/[._\-+]+/).filter(Boolean);
    return parts
      .map(function (p) {
        return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
      })
      .join(" ");
  }

  function show(selector, text) {
    var el = document.querySelector(selector);
    if (!el) return;
    if (text) el.textContent = text;
    el.classList.remove("success", "error");
    el.classList.add("error");
    el.style.display = "flex";
  }

  function showOk(selector, text) {
    var el = document.querySelector(selector);
    if (!el) return;
    if (text) el.textContent = text;
    el.classList.remove("success", "error");
    el.classList.add("success");
    el.style.display = "flex";
  }

  function hideAlert(selector) {
    var el = document.querySelector(selector);
    if (el) el.style.display = "none";
  }

  function setInvalid(field, msg) {
    field.classList.add("invalid");
    var msgEl = field.querySelector(".err-msg");
    if (msgEl) msgEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + msg;
  }

  function setValid(field) {
    field.classList.remove("invalid");
  }

  function emailValid(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  /* Route every demo-only link (forgot password, google, etc.) to 404 */
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".js-demo");
    if (t) {
      e.preventDefault();
      window.location.href = notFoundUrl;
    }
  });

  /* =====================================================================
     LOGIN
     ===================================================================== */
  var loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      hideAlert("#loginAlert");

      var emailField = document.getElementById("lg-email");
      var passField = document.getElementById("lg-password");
      var roleField = document.getElementById("lg-role");

      var ok = true;

      if (!emailValid(emailField.value.trim())) {
        setInvalid(emailField.closest(".form-field"), "Please enter a valid email address.");
        ok = false;
      } else {
        setValid(emailField.closest(".form-field"));
      }

      if (passField.value.length < 6) {
        setInvalid(passField.closest(".form-field"), "Password must be at least 6 characters.");
        ok = false;
      } else {
        setValid(passField.closest(".form-field"));
      }

      if (!roleField.value) {
        setInvalid(roleField.closest(".form-field"), "Please select your role.");
        ok = false;
      } else {
        setValid(roleField.closest(".form-field"));
      }

      if (!ok) {
        show("#loginAlert", "Please fix the highlighted fields.");
        return;
      }

      var email = emailField.value.trim();
      var role = roleField.value;

      /* Store session */
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", readableName(email));
      localStorage.setItem("loginTime", new Date().toISOString());

      var btn = loginForm.querySelector(".btn-auth");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in...';
      }

      showOk("#loginAlert", "Login successful! Welcome back.");

      setTimeout(function () {
        window.location.href = root + "dashboard.html";
      }, 1200);
    });
  }

  /* =====================================================================
     SIGNUP
     ===================================================================== */
  var signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      hideAlert("#signupAlert");

      var nameEl = document.getElementById("su-name");
      var emailEl = document.getElementById("su-email");
      var passEl = document.getElementById("su-password");
      var confEl = document.getElementById("su-confirm");
      var roleEl = document.getElementById("su-role");
      var termsEl = document.getElementById("su-terms");

      var ok = true;

      if (nameEl.value.trim().length < 2) {
        setInvalid(nameEl.closest(".form-field"), "Please enter your full name.");
        ok = false;
      } else {
        setValid(nameEl.closest(".form-field"));
      }

      if (!emailValid(emailEl.value.trim())) {
        setInvalid(emailEl.closest(".form-field"), "Please enter a valid email address.");
        ok = false;
      } else {
        setValid(emailEl.closest(".form-field"));
      }

      if (passEl.value.length < 6) {
        setInvalid(passEl.closest(".form-field"), "Password must be at least 6 characters.");
        ok = false;
      } else {
        setValid(passEl.closest(".form-field"));
      }

      if (confEl.value !== passEl.value || confEl.value === "") {
        setInvalid(confEl.closest(".form-field"), "Passwords do not match.");
        ok = false;
      } else {
        setValid(confEl.closest(".form-field"));
      }

      if (!roleEl.value) {
        setInvalid(roleEl.closest(".form-field"), "Please select your role.");
        ok = false;
      } else {
        setValid(roleEl.closest(".form-field"));
      }

      if (!termsEl.checked) {
        setInvalid(termsEl.closest(".form-field"), "You must accept the Terms & Conditions.");
        ok = false;
      } else {
        setValid(termsEl.closest(".form-field"));
      }

      if (!ok) {
        show("#signupAlert", "Please fix the highlighted fields.");
        return;
      }

      /* Persist user profile */
      localStorage.setItem("userName", nameEl.value.trim());
      localStorage.setItem("userEmail", emailEl.value.trim());
      localStorage.setItem("userRole", roleEl.value);
      localStorage.setItem("signupTime", new Date().toISOString());

      var btn = signupForm.querySelector(".btn-auth");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating account...';
      }

      showOk("#signupAlert", "Account created successfully!");

      setTimeout(function () {
        window.location.href = root + "login.html";
      }, 1500);
    });
  }

})();
