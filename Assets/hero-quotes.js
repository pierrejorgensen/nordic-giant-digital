(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  var slot = document.querySelector(".hero-slot");
  var panel = slot && slot.querySelector(".hero-quotes");
  var headline = slot && slot.querySelector(".hero-slot__headline");
  if (!panel || !headline) {
    return;
  }

  var quotes = Array.prototype.slice.call(panel.querySelectorAll(".hero-quote"));
  var crossfade = 700;
  var index = 0;
  var paused = false;
  var visible = true;
  var running = false;
  var waitGen = 0;

  function dwell(text) {
    return 4000 + text.trim().split(/\s+/).length * 250;
  }

  function wait(ms) {
    var gen = waitGen;
    var start = performance.now();

    return new Promise(function (resolve) {
      function tick(now) {
        if (gen !== waitGen) {
          resolve();
          return;
        }

        if (!visible || paused) {
          requestAnimationFrame(tick);
          return;
        }

        if (now - start >= ms) {
          resolve();
          return;
        }

        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }

  function showQuote(i) {
    index = i;
    quotes.forEach(function (quote, j) {
      var active = j === i;
      quote.classList.toggle("is-active", active);
      quote.setAttribute("aria-hidden", active ? "false" : "true");
    });
  }

  function lockHeight() {
    slot.style.minHeight = slot.offsetHeight + "px";
    panel.style.top = headline.offsetTop + "px";
    panel.style.left = headline.offsetLeft + "px";
    panel.style.width = headline.offsetWidth + "px";
    panel.style.height = headline.offsetHeight + "px";
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  }

  function skipAhead() {
    if (!running) {
      return;
    }

    waitGen += 1;

    if (index < quotes.length - 1) {
      showQuote(index + 1);
      return;
    }

    finish();
  }

  async function finish() {
    waitGen += 1;
    running = false;
    slot.classList.add("is-reverting");
    slot.classList.remove("is-cycling");
    await wait(crossfade);
    slot.classList.remove("is-reverting");
    slot.classList.add("is-complete");
    headline.removeAttribute("aria-hidden");
    panel.setAttribute("aria-hidden", "true");
    panel.removeAttribute("aria-live");
    panel.tabIndex = -1;
  }

  async function run() {
    running = true;
    lockHeight();
    slot.classList.add("is-cycling");
    headline.setAttribute("aria-hidden", "true");
    panel.setAttribute("aria-hidden", "false");
    panel.setAttribute("aria-live", "polite");

    await wait(crossfade);

    index = 0;

    while (running && index < quotes.length) {
      var startIndex = index;
      showQuote(index);
      await wait(dwell(quotes[index].textContent));

      if (!running) {
        return;
      }

      if (index !== startIndex) {
        continue;
      }

      if (index >= quotes.length - 1) {
        break;
      }

      index += 1;
    }

    if (running) {
      await finish();
    }
  }

  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.35 }).observe(slot);

  panel.addEventListener("mouseenter", function () {
    paused = true;
  });

  panel.addEventListener("mouseleave", function () {
    paused = false;
  });

  panel.addEventListener("focusin", function () {
    paused = true;
  });

  panel.addEventListener("focusout", function () {
    paused = false;
  });

  panel.addEventListener("click", skipAhead);

  panel.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      skipAhead();
    }
  });

  run();
})();
