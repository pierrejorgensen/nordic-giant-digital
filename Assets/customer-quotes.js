(function () {
  var section = document.querySelector(".customer-quotes-section");
  var panel = section && section.querySelector(".customer-quotes");
  var mount = document.getElementById("assembleMount");
  if (!section || !panel || !mount) {
    return;
  }

  var quotes = Array.prototype.slice.call(
    panel.querySelectorAll(".customer-quote")
  );
  var crossfade = 700;
  var index = 0;
  var paused = false;
  var visible = true;
  var running = false;
  var phase = "idle";
  var waitGen = 0;
  var mark = null;
  var markScriptPromise = null;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    section.classList.add("is-static");
    quotes.forEach(function (quote) {
      quote.classList.add("is-active");
      quote.removeAttribute("aria-hidden");
    });
    mount.hidden = true;
    return;
  }

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

  function loadAssembleMarkScript() {
    if (markScriptPromise) {
      return markScriptPromise;
    }

    markScriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "/Assets/assemble-mark.js";
      script.onload = function () {
        resolve(window.AssembleMark);
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });

    return markScriptPromise;
  }

  function ensureMark() {
    return loadAssembleMarkScript().then(function (AssembleMark) {
      if (!mark) {
        mark = new AssembleMark(mount);
        mount.addEventListener("assemble:complete", onAnimationComplete);
      }
      return mark;
    });
  }

  function setMountInteractive(on) {
    if (on) {
      mount.removeAttribute("aria-hidden");
      mount.tabIndex = 0;
      mount.setAttribute("role", "button");
      mount.setAttribute(
        "aria-label",
        "Replay client questions and logo animation"
      );
    } else {
      mount.setAttribute("aria-hidden", "true");
      mount.tabIndex = -1;
      mount.removeAttribute("role");
      mount.removeAttribute("aria-label");
    }
  }

  function onAnimationComplete() {
    phase = "complete";
    section.classList.add("is-complete");
    setMountInteractive(true);
  }

  async function fadeOutQuotes() {
    section.classList.add("is-quotes-fading");
    panel.setAttribute("aria-live", "off");
    await wait(crossfade);
    section.classList.remove("is-quotes-fading");
    section.classList.add("is-quotes-hidden");
    panel.setAttribute("aria-hidden", "true");
    panel.tabIndex = -1;
  }

  async function startAnimation() {
    phase = "animating";
    setMountInteractive(false);

    try {
      var assembleMark = await ensureMark();
      assembleMark.play();
    } catch (error) {
      phase = "complete";
      section.classList.add("is-complete");
      console.error(error);
    }
  }

  async function finishQuotes() {
    if (!running) {
      return;
    }

    running = false;
    await fadeOutQuotes();
    await startAnimation();
  }

  function resetForReplay() {
    waitGen += 1;
    running = false;
    phase = "idle";
    section.classList.remove(
      "is-complete",
      "is-quotes-hidden",
      "is-quotes-fading",
      "is-cycling"
    );
    panel.tabIndex = 0;
    panel.setAttribute("aria-hidden", "false");
    setMountInteractive(false);

    if (mark) {
      mark.hardReset();
    }
  }

  function skipAhead() {
    if (!running || phase !== "quotes") {
      return;
    }

    waitGen += 1;

    if (index < quotes.length - 1) {
      showQuote(index + 1);
      return;
    }

    finishQuotes();
  }

  async function runQuotes() {
    running = true;
    phase = "quotes";
    section.classList.add("is-cycling");
    panel.setAttribute("aria-live", "polite");
    setMountInteractive(false);

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
      await finishQuotes();
    }
  }

  function replay() {
    if (running || phase === "animating") {
      return;
    }

    resetForReplay();
    runQuotes();
  }

  mount.addEventListener("click", function () {
    if (phase === "complete") {
      replay();
    }
  });

  mount.addEventListener("keydown", function (event) {
    if (phase !== "complete") {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      replay();
    }
  });

  new IntersectionObserver(
    function (entries) {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0.35 }
  ).observe(section);

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

  runQuotes();
})();
