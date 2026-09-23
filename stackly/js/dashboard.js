/* =====================================================================
   STACKLY — dashboard.js
   Auth guard, profile hydration, sidebar, logout modal, charts,
   customers filter, notifications, settings, team modal, toasts
   ===================================================================== */

(function () {
  "use strict";

  var inPages = window.location.pathname.replace(/\\/g, "/").indexOf("/pages/") !== -1;
  var root = inPages ? "../" : "";
  var notFoundUrl = root + "404.html";
  var loginUrl = root + "login.html";

  /* =====================================================================
   AUTHENTICATION PROTECTION — block direct access
   ===================================================================== */
  if (!localStorage.getItem("userEmail")) {
    window.location.href = loginUrl;
    return;
  }

  /* =====================================================================
   PROFILE HYDRATION
   ===================================================================== */
  var userEmail = localStorage.getItem("userEmail");
  var userName = localStorage.getItem("userName");
  var userRole = localStorage.getItem("userRole") || "User";
  var settings = {};
  try {
    settings = JSON.parse(localStorage.getItem("userSettings") || "{}");
  } catch (e) {
    settings = {};
  }

  var avatarSeed = userRole ? userRole.toLowerCase() : "user";
  var avatarFallback = root + "assets/icons/profile-avatar.svg";
  var avatarImg =
    settings.avatar && settings.avatar.indexOf("http") === 0
      ? settings.avatar
      : "https://i.pravatar.cc/150?img=" +
        (Math.abs(hashCode(avatarSeed + userEmail)) % 70) +
        1;

  function hashCode(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return h;
  }

  /* Fill every element that carries these hooks */
  document.querySelectorAll("[data-user-name]").forEach(function (el) { el.textContent = userName; });
  document.querySelectorAll("[data-user-email]").forEach(function (el) {
    el.textContent = userEmail;
    el.setAttribute("title", userEmail);
  });
  document.querySelectorAll("[data-user-role]").forEach(function (el) { el.textContent = userRole; });
  document.querySelectorAll("[data-user-avatar]").forEach(function (el) {
    el.addEventListener("error", function () {
      if (el.getAttribute("src") !== avatarFallback) el.setAttribute("src", avatarFallback);
    });
    el.setAttribute("src", avatarImg);
    el.setAttribute("alt", "Profile photo of " + userName);
  });

  /* =====================================================================
   DARK MODE
   ===================================================================== */
  var darkToggle = document.getElementById("tgDark");
  var darkEnabled = localStorage.getItem("stacklyDark") === "1";

  function applyDark(on) {
    document.body.classList.toggle("dark", on);
    if (darkToggle) darkToggle.checked = on;
  }
  applyDark(darkEnabled);
  if (darkToggle) {
    darkToggle.addEventListener("change", function () {
      applyDark(darkToggle.checked);
      localStorage.setItem("stacklyDark", darkToggle.checked ? "1" : "0");
    });
  }

  var notifToggle = document.getElementById("tgNotifications");
  if (notifToggle) {
    notifToggle.checked = settings.notifications !== false;
    notifToggle.addEventListener("change", function () {
      settings.notifications = notifToggle.checked;
      localStorage.setItem("userSettings", JSON.stringify(settings));
    });
  }

  /* =====================================================================
   SIDEBAR (mobile)
   ===================================================================== */
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("sideOverlay");

  function openSidebar() {
    if (sidebar) sidebar.classList.add("open");
    if (overlay) overlay.classList.add("show");
    if (menuOpenBtn) menuOpenBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
    if (menuOpenBtn) menuOpenBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  var menuOpenBtn = document.getElementById("menuOpen");
  if (menuOpenBtn) menuOpenBtn.addEventListener("click", openSidebar);
  var sidebarClose = document.getElementById("sidebarClose");
  if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar && sidebar.classList.contains("open")) closeSidebar();
  });

  /* =====================================================================
   ACTIVE SIDEBAR LINK
   ===================================================================== */
  var slug = (window.location.pathname.split("/").pop() || "dashboard.html").toLowerCase();
  var keyMap = {
    "dashboard.html": "overview",
    "overview.html": "overview",
    "analytics.html": "analytics",
    "projects.html": "projects",
    "team.html": "team",
    "customers.html": "customers",
    "reports.html": "reports",
    "notifications.html": "notifications",
    "settings.html": "settings"
  };
  var currentKey = keyMap[slug] || "overview";
  document.querySelectorAll(".sidebar-nav a[data-key]").forEach(function (a) {
    if (a.getAttribute("data-key") === currentKey) a.classList.add("active");
  });

  /* =====================================================================
   LOGOUT MODAL
   ===================================================================== */
  var logoutModal = document.getElementById("logoutModal");
  var btnConfirmLogout = document.getElementById("btnConfirmLogout");
  var btnCancelLogout = document.getElementById("btnCancelLogout");

  function openModal(modal) {
    if (modal) modal.classList.add("show");
  }
  function closeModal(modal) {
    if (modal) modal.classList.remove("show");
  }

  document.addEventListener("click", function (e) {
    var trig = e.target.closest(".js-logout");
    if (trig) {
      e.preventDefault();
      openModal(logoutModal);
    }
  });

  if (btnCancelLogout) btnCancelLogout.addEventListener("click", function () {
    closeModal(logoutModal);
  });

  if (logoutModal) {
    logoutModal.addEventListener("click", function (e) {
      if (e.target === logoutModal) closeModal(logoutModal);
    });
  }

  if (btnConfirmLogout) {
    btnConfirmLogout.addEventListener("click", function () {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      localStorage.removeItem("loginTime");
      window.location.href = loginUrl;
    });
  }

  /* =====================================================================
   DEMO LINKS -> 404 (reports download/view, etc.)
   ===================================================================== */
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".js-demo");
    if (t) {
      e.preventDefault();
      window.location.href = notFoundUrl;
    }
  });

  /* =====================================================================
   TOAST
   ===================================================================== */
  function showToast(msg) {
    var toast = document.getElementById("dashToast");
    if (!toast) return;
    toast.querySelector("[data-toast-msg]").textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove("show");
    }, 3200);
  }

  /* =====================================================================
   CHARTS (Chart.js)
   ===================================================================== */
  if (window.Chart) {
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.color = "#6b7390";

    function chartColor(base, alpha) {
      var rgb = { r: 124, g: 58, b: 237 };
      if (base === "blue") rgb = { r: 59, g: 130, b: 246 };
      if (base === "cyan") rgb = { r: 6, g: 182, b: 212 };
      if (base === "pink") rgb = { r: 236, g: 72, b: 153 };
      if (base === "green") rgb = { r: 34, g: 197, b: 94 };
      return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + alpha + ")";
    }

    /* User distribution (doughnut) */
    var cUserDist = document.getElementById("chartUserDist");
    if (cUserDist) {
      new Chart(cUserDist, {
        type: "doughnut",
        data: {
          labels: ["Enterprise", "Professional", "Starter"],
          datasets: [
            {
              data: [35, 40, 25],
              backgroundColor: [chartColor("purple", 0.9), chartColor("blue", 0.85), chartColor("cyan", 0.85)],
              borderColor: ["#ffffff", "#ffffff", "#ffffff"],
              borderWidth: 3,
              hoverOffset: 12
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true, padding: 16 } }
          }
        }
      });
    }

    /* Monthly growth (line) */
    var cGrowth = document.getElementById("chartGrowth");
    if (cGrowth) {
      var labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      new Chart(cGrowth, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Users",
              data: [12, 18, 15, 24, 30, 28, 38, 44, 41, 52, 58, 68],
              borderColor: "#7c3aed",
              backgroundColor: "rgba(124,58,237,0.12)",
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: "#fff",
              pointBorderColor: "#7c3aed",
              pointBorderWidth: 2,
              pointRadius: 4
            },
            {
              label: "Revenue",
              data: [8, 12, 20, 18, 26, 34, 32, 42, 50, 48, 60, 76],
              borderColor: "#06b6d4",
              backgroundColor: "rgba(6,182,212,0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: "#fff",
              pointBorderColor: "#06b6d4",
              pointBorderWidth: 2,
              pointRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: "index" },
          plugins: { legend: { position: "top", labels: { usePointStyle: true } } },
          scales: {
            y: { beginAtZero: true, grid: { color: "rgba(124,58,237,0.08)" } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    /* Revenue performance (bar) */
    var cRevenue = document.getElementById("chartRevenue");
    if (cRevenue) {
      new Chart(cRevenue, {
        type: "bar",
        data: {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [
            {
              label: "Revenue (K)",
              data: [86, 120, 148, 196],
              backgroundColor: [
                "rgba(124,58,237,0.75)",
                "rgba(59,130,246,0.75)",
                "rgba(6,182,212,0.75)",
                "rgba(236,72,153,0.75)"
              ],
              borderRadius: 10,
              borderSkipped: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: "rgba(124,58,237,0.08)" } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    /* Traffic (line) */
    var cTraffic = document.getElementById("chartTraffic");
    if (cTraffic) {
      var tLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      new Chart(cTraffic, {
        type: "line",
        data: {
          labels: tLabels,
          datasets: [
            {
              label: "Visitors",
              data: [4200, 5100, 4800, 6200, 7100, 5400, 4900],
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.12)",
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointRadius: 3
            },
            {
              label: "Conversions",
              data: [520, 640, 580, 810, 960, 700, 630],
              borderColor: "#ec4899",
              backgroundColor: "rgba(236,72,153,0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: "index" },
          plugins: { legend: { position: "top", labels: { usePointStyle: true } } },
          scales: {
            y: { beginAtZero: true, grid: { color: "rgba(124,58,237,0.08)" } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    /* Channels (bar) */
    var cChannels = document.getElementById("chartChannels");
    if (cChannels) {
      new Chart(cChannels, {
        type: "bar",
        data: {
          labels: ["Organic", "Paid Ads", "Social", "Referral", "Email", "Direct"],
          datasets: [
            {
              label: "Leads",
              data: [640, 430, 380, 290, 350, 210],
              backgroundColor: "rgba(124,58,237,0.7)",
              borderRadius: 8,
              borderSkipped: false
            },
            {
              label: "Sales",
              data: [210, 145, 120, 96, 130, 74],
              backgroundColor: "rgba(6,182,212,0.8)",
              borderRadius: 8,
              borderSkipped: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top", labels: { usePointStyle: true } } },
          scales: {
            y: { beginAtZero: true, grid: { color: "rgba(124,58,237,0.08)" } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    /* Sources (pie) */
    var cSources = document.getElementById("chartSources");
    if (cSources) {
      new Chart(cSources, {
        type: "pie",
        data: {
          labels: ["Organic Search", "Paid", "Social Media", "Referrals"],
          datasets: [
            {
              data: [42, 24, 20, 14],
              backgroundColor: [
                "rgba(124,58,237,0.85)",
                "rgba(59,130,246,0.85)",
                "rgba(6,182,212,0.85)",
                "rgba(236,72,153,0.85)"
              ],
              borderColor: "#ffffff",
              borderWidth: 3,
              hoverOffset: 12
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 14 } } }
        }
      });
    }
  }

  /* =====================================================================
   CUSTOMERS — search + filter (fully working)
   ===================================================================== */
  var custSearch = document.getElementById("custSearch");
  var custFilter = document.getElementById("custFilterPlan");
  var custTable = document.getElementById("custTable");
  var custEmpty = document.getElementById("custEmpty");

  function filterCustomers() {
    if (!custTable) return;
    var q = (custSearch ? custSearch.value : "").toLowerCase().trim();
    var plan = custFilter ? custFilter.value : "";
    var rows = custTable.querySelectorAll("tr[data-customer]");
    var visible = 0;
    rows.forEach(function (tr) {
      var hay = (
        tr.getAttribute("data-name") + " " +
        tr.getAttribute("data-company") + " " +
        tr.getAttribute("data-email")
      ).toLowerCase();
      var matchQ = hay.indexOf(q) !== -1;
      var matchPlan = !plan || tr.getAttribute("data-plan") === plan;
      var show = matchQ && matchPlan;
      tr.style.display = show ? "" : "none";
      if (show) visible++;
    });
    if (custEmpty) custEmpty.style.display = visible ? "none" : "block";
    var counter = document.getElementById("custCount");
    if (counter) counter.textContent = visible + " customers shown";
  }

  if (custSearch) {
    custSearch.addEventListener("input", filterCustomers);
  }
  if (custFilter) {
    custFilter.addEventListener("change", filterCustomers);
  }
  filterCustomers();

  /* =====================================================================
   NOTIFICATIONS — mark as read
   ===================================================================== */
  var notifList = document.getElementById("notifList");
  var notifCount = document.getElementById("notifCount");
  var btnMarkAll = document.getElementById("btnMarkAll");

  function refreshNotifCount() {
    if (!notifList) return;
    var unread = notifList.querySelectorAll(".notif-card.unread").length;
    var el = document.getElementById("notifCount");
    if (el) el.textContent = unread;
  }

  if (notifList) {
    notifList.addEventListener("click", function (e) {
      var card = e.target.closest(".notif-card");
      if (!card) return;
      if (card.classList.contains("unread")) {
        card.classList.remove("unread");
        card.classList.add("read");
        refreshNotifCount();
      }
    });
  }

  if (btnMarkAll) {
    btnMarkAll.addEventListener("click", function () {
      notifList.querySelectorAll(".notif-card.unread").forEach(function (c) {
        c.classList.remove("unread");
        c.classList.add("read");
      });
      refreshNotifCount();
      showToast("All notifications marked as read.");
    });
  }
  refreshNotifCount();

  /* =====================================================================
   TEAM — view profile modal
   ===================================================================== */
  var teamModal = document.getElementById("teamModal");
  var teamModalClose = document.getElementById("teamModalClose");
  var teamModalBody = document.getElementById("teamModalBody");

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".js-view-profile");
    if (!btn) return;
    var img = btn.getAttribute("data-avatar");
    var name = btn.getAttribute("data-name");
    var role = btn.getAttribute("data-role");
    var email = btn.getAttribute("data-email");
    var status = btn.getAttribute("data-status") || "Available";
    if (teamModalBody) {
      teamModalBody.innerHTML =
        '<img src="' + img + '" alt="Portrait of ' + name + '">' +
        "<h3>" + name + "</h3>" +
        "<p>" + role + "</p>" +
        '<p class="tm-email"><i class="fa-solid fa-envelope"></i> ' + email + "</p>" +
        '<span class="badge-pill badge-green">' + status + "</span>" +
        '<button class="btn-mini" data-demo>Send Message</button>';
      teamModalBody.querySelectorAll("[data-demo]").forEach(function (b) {
        b.addEventListener("click", function () {
          window.location.href = notFoundUrl;
        });
      });
    }
    openModal(teamModal);
  });

  if (teamModalClose) teamModalClose.addEventListener("click", function () {
    closeModal(teamModal);
  });
  if (teamModal) {
    teamModal.addEventListener("click", function (e) {
      if (e.target === teamModal) closeModal(teamModal);
    });
  }

  /* =====================================================================
   SETTINGS — save profile
   ===================================================================== */
  var settingsForm = document.getElementById("settingsForm");
  if (settingsForm) {
    var stName = document.getElementById("st-name");
    var stEmail = document.getElementById("st-email");
    var stPhone = document.getElementById("st-phone");
    var stCompany = document.getElementById("st-company");
    var stRole = document.getElementById("st-role");
    var stPass = document.getElementById("st-password");

    if (stName) stName.value = localStorage.getItem("userName") || "";
    if (stEmail) stEmail.value = localStorage.getItem("userEmail") || "";
    if (stPhone) stPhone.value = settings.phone || "";
    if (stCompany) stCompany.value = settings.company || "";
    if (stRole) stRole.value = localStorage.getItem("userRole") || "";

    settingsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (stName && stName.value.trim().length < 2) {
        stName.closest(".form-field").classList.add("invalid");
        alert("Please enter a valid full name.");
        return;
      }
      settings.phone = stPhone ? stPhone.value.trim() : "";
      settings.company = stCompany ? stCompany.value.trim() : "";
      settings.account = {
        passwordSaved: !!(stPass && stPass.value)
      };
      localStorage.setItem("userSettings", JSON.stringify(settings));
      if (stName) localStorage.setItem("userName", stName.value.trim());
      if (stRole && stRole.value) localStorage.setItem("userRole", stRole.value);
      if (stPass && stPass.value) localStorage.setItem("userPassword", "*******");
      showToast("Settings saved successfully!");
      setTimeout(function () {
        window.location.reload();
      }, 1800);
    });
  }

  /* =====================================================================
   PROJECTS — status filter chips
   ===================================================================== */
  var projChips = document.getElementById("projChips");
  var projRows = document.querySelectorAll("#projectTable tr[data-customer]");
  var projEmpty = document.getElementById("projEmpty");
  var projCount = document.getElementById("projCount");
  if (projChips) {
    projChips.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      projChips.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("active");
      });
      chip.classList.add("active");
      var st = chip.getAttribute("data-st");
      var visible = 0;
      projRows.forEach(function (tr) {
        var match = !st || tr.getAttribute("data-status") === st;
        tr.style.display = match ? "" : "none";
        if (match) visible++;
      });
      if (projEmpty) projEmpty.style.display = visible ? "none" : "block";
      if (projCount) projCount.textContent = visible + " projects";
    });
  }

  /* =====================================================================
   KPI numbers — smooth counting
   ===================================================================== */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count") || "0");
    var suffix = el.getAttribute("data-suffix") || "";
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
})();
