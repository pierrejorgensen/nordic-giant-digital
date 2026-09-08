(function () {
  var popover = document.getElementById("contact-popover");
  var panel = popover && popover.querySelector(".contact-popover__panel");
  var trigger = document.querySelector("[data-contact-popover-trigger]");
  var main = document.querySelector("main");
  var footer = document.querySelector("footer");
  if (!popover || !panel || !trigger) {
    return;
  }

  var lastFocus = null;
  var focusableSelector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([hidden]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getFocusableElements(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll(focusableSelector),
      function (element) {
        return !element.closest("[hidden]") && element.tabIndex !== -1;
      }
    );
  }

  function setBackgroundInert(inert) {
    if (main) {
      main.inert = inert;
    }
    if (footer) {
      footer.inert = inert;
    }
  }

  function positionPopover() {
    var header = document.querySelector("header");
    var headerBottom = header
      ? header.getBoundingClientRect().bottom
      : trigger.getBoundingClientRect().bottom;
    var panelRect = panel.getBoundingClientRect();
    var triggerRect = trigger.getBoundingClientRect();
    var pointerX =
      triggerRect.left + triggerRect.width / 2 - panelRect.left;

    popover.style.setProperty("--popover-top", (headerBottom + 10) + "px");
    popover.style.setProperty("--popover-pointer-x", pointerX + "px");
  }

  function openPopover() {
    lastFocus = document.activeElement;
    popover.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    setBackgroundInert(true);
    positionPopover();
    var focusable = getFocusableElements(panel);
    if (focusable.length) {
      focusable[0].focus({ preventScroll: true });
    } else {
      panel.focus({ preventScroll: true });
    }
  }

  function closePopover() {
    if (popover.hidden) {
      return;
    }

    popover.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    setBackgroundInert(false);

    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  function handleTabTrap(event) {
    if (popover.hidden || event.key !== "Tab") {
      return;
    }

    var focusable = getFocusableElements(panel);
    if (!focusable.length) {
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  trigger.addEventListener("click", function () {
    if (popover.hidden) {
      openPopover();
    } else {
      closePopover();
    }
  });

  popover.addEventListener("click", function (event) {
    if (!panel.contains(event.target)) {
      closePopover();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !popover.hidden) {
      closePopover();
      return;
    }

    handleTabTrap(event);
  });

  window.addEventListener("resize", function () {
    if (!popover.hidden) {
      positionPopover();
    }
  });
})();
