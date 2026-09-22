(function () {
  "use strict";

  function closeAll(except) {
    document.querySelectorAll(".custom-select").forEach(function (el) {
      if (el !== except) {
        el.classList.remove("is-open");
        var menu = el._customMenu;
        if (menu) menu.classList.remove("is-visible");
        var button = el.querySelector(".custom-select-button");
        if (button) button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function placeMenu(wrapper) {
    var button = wrapper.querySelector(".custom-select-button");
    var menu = wrapper._customMenu;
    if (!button || !menu) return;

    var rect = button.getBoundingClientRect();
    var gap = 6;
    var availableBelow = window.innerHeight - rect.bottom - gap;
    var availableAbove = rect.top - gap;
    var openAbove = availableBelow < 190 && availableAbove > availableBelow;
    var maxHeight = Math.max(120, Math.min(280, openAbove ? availableAbove : availableBelow));

    menu.style.width = rect.width + "px";
    menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)) + "px";
    menu.style.maxHeight = maxHeight + "px";
    menu.style.top = (openAbove ? rect.top - Math.min(menu.scrollHeight || 280, maxHeight) - gap : rect.bottom + gap) + "px";
  }

  function build(select) {
    if (select.dataset.customSelectReady) return;
    select.dataset.customSelectReady = "true";

    var wrapper = document.createElement("div");
    wrapper.className = "custom-select";
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "custom-select-button";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");

    var arrow = document.createElement("span");
    arrow.className = "custom-select-arrow";
    arrow.innerHTML = "<i class=\"fa-solid fa-chevron-down\"></i>";
    button.appendChild(document.createElement("span"));
    button.appendChild(arrow);

    var menu = document.createElement("div");
    menu.className = "custom-select-menu";
    menu.setAttribute("role", "listbox");
    document.body.appendChild(menu);
    wrapper._customMenu = menu;
    wrapper.appendChild(button);

    function refresh() {
      button.firstChild.textContent = select.options[select.selectedIndex] ? select.options[select.selectedIndex].textContent : "";
      menu.querySelectorAll("[role=option]").forEach(function (item) {
        item.classList.toggle("selected", item.dataset.value === select.value);
        item.setAttribute("aria-selected", item.dataset.value === select.value ? "true" : "false");
      });
    }

    Array.prototype.forEach.call(select.options, function (option) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "custom-select-option";
      item.setAttribute("role", "option");
      item.dataset.value = option.value;
      item.textContent = option.textContent;
      item.addEventListener("click", function () {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        refresh();
        wrapper.classList.remove("is-open");
        menu.classList.remove("is-visible");
        button.setAttribute("aria-expanded", "false");
      });
      menu.appendChild(item);
    });

    button.addEventListener("click", function () {
      var willOpen = !wrapper.classList.contains("is-open");
      closeAll(wrapper);
      wrapper.classList.toggle("is-open", willOpen);
      menu.classList.toggle("is-visible", willOpen);
      button.setAttribute("aria-expanded", willOpen ? "true" : "false");
      if (willOpen) placeMenu(wrapper);
    });

    select.addEventListener("change", refresh);
    refresh();
  }

  document.querySelectorAll("select").forEach(build);
  document.addEventListener("click", function (event) {
    if (!event.target.closest(".custom-select")) closeAll();
  });
  window.addEventListener("resize", function () {
    document.querySelectorAll(".custom-select.is-open").forEach(placeMenu);
  });
  window.addEventListener("scroll", function () {
    document.querySelectorAll(".custom-select.is-open").forEach(placeMenu);
  }, true);
}());
