(function () {
  var RUNE_PATHS = {
    "01": ["M30,10L30,90", "M30,70L90,10", "M30,90L90,30"], // Fé
    "02": ["M30,10L30,90", "M30,10L110,90"], // Úr
    "03": ["M30,10L30,90", "M30,10L100,80"], // Áss
    "04": ["M30,10L30,90", "M30,10L50,10L30,30", "M30,30L90,90"], // Reið
    "05": ["M30,10L30,90", "M30,80L100,10"], // Kaun
    "06": ["M30,10L30,90", "M30,90L100,20"], // Hagall
    "07": ["M30,10L30,90", "M0,80L70,10"], // Nauðr
    "08": ["M30,10L30,90", "M30,50L70,50L110,10"], // Ár
    "09": ["M30,10L70,50L130,50L90,90"], // Sól
    "10": ["M50,10L50,90", "M50,50L10,10", "M50,50L90,10"], // Týr
    "11": ["M50,10L50,90", "M50,30L10,70", "M50,30L90,70"], // Maðr
    "12": ["M50,10L50,90", "M50,70L10,30", "M50,70L90,30"] // Ýr
  };

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dividers = Array.prototype.slice.call(document.querySelectorAll(".section-divider"));

  dividers.forEach(function (divider) {
    var runeId = String(divider.dataset.rune || "").padStart(2, "0");
    var pathsData = RUNE_PATHS[runeId];
    var svg = divider.querySelector(".section-divider__rune");

    if (!pathsData || !svg) {
      return;
    }

    var paths = pathsData.map(function (d) {
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
      return path;
    });

    paths.forEach(function (path) {
      var length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = reduced ? "0" : String(length);
    });

    if (reduced) {
      return;
    }

    var played = false;

    function play() {
      paths.forEach(function (path, index) {
        var length = path.getTotalLength();
        path.style.transition = "none";
        path.style.strokeDashoffset = String(length);
        path.getBoundingClientRect();
        path.style.transition = "stroke-dashoffset 600ms cubic-bezier(.22,.61,.36,1) " + (index * 80) + "ms";
        requestAnimationFrame(function () {
          path.style.strokeDashoffset = "0";
        });
      });
    }

    function activate() {
      if (played) {
        return;
      }

      played = true;
      play();
    }

    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        activate();
      }
    }, { threshold: 0.6 }).observe(divider);

    divider.addEventListener("click", play);

    divider.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        play();
      }
    });
  });
})();
