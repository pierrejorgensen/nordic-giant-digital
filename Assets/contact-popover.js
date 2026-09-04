(function () {
  var popover = document.getElementById("contact-popover");
  var panel = popover && popover.querySelector(".contact-popover__panel");
  var trigger = document.querySelector("[data-contact-popover-trigger]");
  if (!popover || !panel || !trigger) {
    return;
  }

  var lastFocus = null;

  function positionPopover() {
    var header = document.querySelector("header");
    var headerBottom = header
      ? header.getBoundingClientRect().bottom
      : trigger.getBoundingClientRect().bottom;
    var panelRect = panel.getBoundingClientRect();
    var triggerRect = trigger.getBoundingClientRect();
    var pointerX =
      triggerRect.left + triggerRect.width / 2 - panelRect.left;

    popover.style.setProperty("--popover-top", headerBottom + "px");
    popover.style.setProperty("--popover-pointer-x", pointerX + "px");
  }

  function openPopover() {
    lastFocus = document.activeElement;
    popover.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    positionPopover();
    var firstField = panel.querySelector(
      ".contact-form input:not([hidden]), .contact-form textarea"
    );
    if (firstField) {
      firstField.focus({ preventScroll: true });
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

    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-haspopup", "dialog");

  trigger.addEventListener("click", function (event) {
    event.preventDefault();
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
    if (event.key === "Escape") {
      closePopover();
    }
  });

  window.addEventListener("resize", function () {
    if (!popover.hidden) {
      positionPopover();
    }
  });
})();
