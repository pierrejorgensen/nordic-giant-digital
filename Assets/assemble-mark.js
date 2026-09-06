(function (global) {
  var EASE = "cubic-bezier(0.9, 1, 0.9, 1)";

  var DESIGN = {
    W: 1200,
    H: 300,
    N: 48,
    MIN_GAP: 11,
    SMALL: { w: 32, h: 27.71281292110203 },
    FINAL: { w: 156.76, h: 135.76 },
    FINAL_LEFT: { cx: 559.23, cy: 117.88 },
    FINAL_RIGHT: { cx: 639.43, cy: 117.88 },
    WORD_SCALE: 2.1015025743406537,
    WORD_TX: 322.2864348008826,
    WORD_TY: 47.89849742565934,
    WORD_MAX_X: 264.3,
  };

  // Assembled logo width in design units; wordmark is the widest element.
  var LOGO_WIDTH = DESIGN.WORD_MAX_X * DESIGN.WORD_SCALE;
  var LOGO_HORIZONTAL_INSET = 30;

  var WORD_PATHS = [
    "M0 91.93V82.55H2.76L2.84 83.57C3.15 83.2 3.55 82.9 4.06 82.67C4.57 82.44 5.09 82.33 5.62 82.33C6.69 82.33 7.54 82.65 8.18 83.29C8.82 83.93 9.14 84.88 9.14 86.13V91.93H6.26V86.53C6.26 86.01 6.13 85.6 5.87 85.29C5.61 84.98 5.25 84.83 4.78 84.83C4.15 84.83 3.68 85.04 3.35 85.45C3.02 85.86 2.86 86.34 2.86 86.89V91.93H0Z",
    "M13.8 87.23C13.8 86.31 14.01 85.47 14.44 84.71C14.87 83.95 15.46 83.35 16.21 82.9C16.96 82.45 17.84 82.23 18.84 82.23C19.84 82.23 20.72 82.45 21.47 82.9C22.22 83.35 22.81 83.95 23.23 84.71C23.65 85.47 23.86 86.31 23.86 87.23C23.86 88.15 23.65 88.99 23.23 89.75C22.81 90.51 22.22 91.12 21.47 91.57C20.72 92.02 19.84 92.25 18.84 92.25C17.84 92.25 16.96 92.02 16.21 91.57C15.46 91.12 14.87 90.51 14.44 89.75C14.01 88.99 13.8 88.15 13.8 87.23ZM18.84 89.75C19.33 89.75 19.74 89.63 20.07 89.39C20.4 89.15 20.65 88.84 20.82 88.45C20.99 88.06 21.08 87.66 21.08 87.23C21.08 86.8 20.99 86.4 20.82 86.02C20.65 85.64 20.4 85.33 20.07 85.09C19.74 84.85 19.33 84.73 18.84 84.73C18.35 84.73 17.95 84.85 17.61 85.09C17.27 85.33 17.01 85.64 16.84 86.02C16.67 86.4 16.58 86.8 16.58 87.23C16.58 87.66 16.67 88.06 16.84 88.45C17.01 88.84 17.27 89.15 17.61 89.39C17.95 89.63 18.36 89.75 18.84 89.75Z",
    "M28.56 91.93V82.55H31.32L31.42 83.73C31.66 83.41 31.99 83.1 32.41 82.81C32.83 82.52 33.37 82.37 34.04 82.37C34.29 82.37 34.51 82.38 34.69 82.41C34.87 82.44 35.05 82.48 35.22 82.55L34.76 85.09C34.47 85 34.12 84.95 33.72 84.95C33.04 84.95 32.49 85.15 32.07 85.56C31.65 85.97 31.44 86.54 31.44 87.29V91.93H28.56Z",
    "M45.52 91.93L45.4 90.99C45.11 91.32 44.73 91.61 44.27 91.85C43.81 92.09 43.29 92.21 42.7 92.21C41.94 92.21 41.25 92.01 40.63 91.62C40.01 91.23 39.52 90.67 39.15 89.94C38.78 89.21 38.6 88.36 38.6 87.37C38.6 86.53 38.75 85.79 39.04 85.16C39.33 84.53 39.72 84 40.21 83.59C40.7 83.18 41.23 82.87 41.8 82.66C42.37 82.45 42.94 82.35 43.5 82.35C43.95 82.35 44.31 82.38 44.57 82.44C44.83 82.5 45.09 82.58 45.34 82.67V78.59H48.2V91.93H45.52ZM45.34 87.69V85.13C44.97 84.9 44.46 84.79 43.82 84.79C43.09 84.79 42.52 85.04 42.11 85.53C41.7 86.02 41.5 86.66 41.5 87.43C41.5 88.11 41.67 88.67 42.01 89.1C42.35 89.53 42.85 89.75 43.5 89.75C44.15 89.75 44.62 89.54 44.91 89.12C45.2 88.7 45.34 88.22 45.34 87.69Z",
    "M53.3 81.17V78.59H56.38V81.17H53.3ZM53.4 91.93V82.55H56.28V91.93H53.4Z",
    "M68.22 88.81L69.9 90.69C69.51 91.12 69 91.48 68.37 91.79C67.74 92.1 66.99 92.25 66.12 92.25C65.12 92.25 64.24 92.03 63.48 91.6C62.72 91.17 62.13 90.57 61.7 89.82C61.27 89.07 61.06 88.2 61.06 87.23C61.06 86.26 61.28 85.45 61.72 84.7C62.16 83.95 62.76 83.35 63.52 82.9C64.28 82.45 65.15 82.23 66.12 82.23C66.97 82.23 67.72 82.37 68.35 82.65C68.98 82.93 69.51 83.3 69.92 83.77L68.18 85.65C67.97 85.41 67.71 85.2 67.4 85.01C67.09 84.82 66.69 84.73 66.18 84.73C65.73 84.73 65.33 84.85 65 85.08C64.67 85.31 64.41 85.62 64.23 86C64.05 86.38 63.96 86.79 63.96 87.23C63.96 87.64 64.05 88.04 64.23 88.42C64.41 88.8 64.67 89.11 65 89.36C65.33 89.61 65.73 89.73 66.18 89.73C66.67 89.73 67.09 89.63 67.42 89.43C67.75 89.23 68.02 89.02 68.22 88.81Z",
    "M81.22 95.17L82.38 93.13C82.75 93.36 83.15 93.53 83.57 93.66C83.99 93.79 84.45 93.85 84.96 93.85C85.61 93.85 86.13 93.68 86.5 93.33C86.87 92.98 87.06 92.46 87.06 91.77V91.11C86.46 91.63 85.66 91.89 84.66 91.89C83.77 91.89 83 91.7 82.37 91.32C81.74 90.94 81.25 90.41 80.92 89.73C80.59 89.05 80.42 88.28 80.42 87.41C80.42 86.4 80.65 85.51 81.1 84.75C81.55 83.99 82.18 83.4 82.99 82.98C83.8 82.56 84.74 82.35 85.82 82.35C86.59 82.35 87.33 82.42 88.04 82.55C88.75 82.68 89.37 82.85 89.92 83.05V91.63C89.92 93.18 89.49 94.32 88.64 95.06C87.79 95.8 86.62 96.17 85.14 96.17C83.51 96.17 82.21 95.84 81.22 95.17ZM87.08 87.75V84.93C86.89 84.86 86.71 84.81 86.52 84.78C86.33 84.75 86.09 84.73 85.78 84.73C84.95 84.73 84.34 84.98 83.93 85.49C83.52 86 83.32 86.6 83.32 87.31C83.32 87.98 83.49 88.51 83.82 88.92C84.15 89.33 84.63 89.53 85.24 89.53C85.85 89.53 86.28 89.39 86.6 89.1C86.92 88.81 87.08 88.36 87.08 87.75Z",
    "M95.04 81.17V78.59H98.12V81.17H95.04ZM95.14 91.93V82.55H98.02V91.93H95.14Z",
    "M108.74 91.93L108.66 91.05C107.99 91.82 107.05 92.21 105.82 92.21C105.38 92.21 104.92 92.13 104.43 91.96C103.94 91.79 103.53 91.5 103.18 91.07C102.83 90.64 102.66 90.06 102.66 89.31C102.66 88.56 102.85 87.96 103.23 87.45C103.61 86.94 104.13 86.56 104.78 86.3C105.43 86.04 106.17 85.91 106.98 85.91C107.31 85.91 107.65 85.91 107.99 85.93C108.33 85.95 108.55 85.96 108.66 85.99V85.79C108.66 85.31 108.48 84.97 108.11 84.76C107.74 84.55 107.33 84.45 106.86 84.45C106.23 84.45 105.71 84.53 105.28 84.69C104.85 84.85 104.49 85.03 104.2 85.23L103.02 83.47C103.41 83.16 103.93 82.88 104.6 82.62C105.27 82.36 106.15 82.23 107.26 82.23C108.69 82.23 109.74 82.61 110.42 83.38C111.1 84.15 111.44 85.18 111.44 86.47V91.93H108.74ZM108.66 88.55V87.79C108.59 87.78 108.47 87.76 108.28 87.74C108.09 87.72 107.88 87.71 107.64 87.71C106.84 87.71 106.27 87.82 105.94 88.05C105.61 88.28 105.44 88.6 105.44 89.01C105.44 89.78 105.91 90.17 106.84 90.17C107.29 90.17 107.71 90.03 108.09 89.75C108.47 89.47 108.66 89.07 108.66 88.55Z",
    "M116.54 91.93V82.55H119.3L119.38 83.57C119.69 83.2 120.09 82.9 120.6 82.67C121.11 82.44 121.63 82.33 122.16 82.33C123.23 82.33 124.08 82.65 124.72 83.29C125.36 83.93 125.68 84.88 125.68 86.13V91.93H122.8V86.53C122.8 86.01 122.67 85.6 122.41 85.29C122.15 84.98 121.79 84.83 121.32 84.83C120.69 84.83 120.22 85.04 119.89 85.45C119.56 85.86 119.4 86.34 119.4 86.89V91.93H116.54Z",
    "M131.46 88.35V84.81H129.98V82.55H131.46V79.47H134.34V82.55H136.76V84.81H134.34V88.51C134.34 88.96 134.43 89.31 134.61 89.56C134.79 89.81 135.07 89.93 135.46 89.93C135.75 89.93 136.01 89.88 136.22 89.78C136.43 89.68 136.63 89.56 136.82 89.43L137.98 91.19C137.09 91.91 136.1 92.27 135.02 92.27C134.13 92.27 133.42 92.1 132.9 91.77C132.38 91.44 132.01 90.98 131.79 90.39C131.57 89.8 131.46 89.12 131.46 88.35Z",
    "M152.05 91.93V81.26H154.96C156.13 81.26 157.17 81.45 158.06 81.82C158.96 82.19 159.66 82.77 160.16 83.56C160.67 84.34 160.92 85.35 160.92 86.59C160.92 87.83 160.67 88.84 160.16 89.63C159.65 90.42 158.95 91 158.06 91.37C157.16 91.74 156.13 91.93 154.96 91.93H152.05ZM152.82 91.21H155.12C156.13 91.21 157.01 91.04 157.76 90.71C158.51 90.37 159.09 89.86 159.5 89.17C159.91 88.48 160.12 87.62 160.12 86.59C160.12 85.03 159.66 83.88 158.74 83.12C157.82 82.36 156.57 81.98 155 81.98H152.82V91.21Z",
    "M172.81 91.93V81.26H173.58V91.93H172.81Z",
    "M193.96 90.55V87.59H191.11V86.87H194.73V90.87C194.37 91.19 193.86 91.49 193.19 91.77C192.53 92.05 191.68 92.19 190.63 92.19C189.58 92.19 188.7 91.95 187.93 91.48C187.16 91.01 186.54 90.35 186.11 89.5C185.67 88.66 185.45 87.69 185.45 86.59C185.45 85.81 185.57 85.08 185.83 84.41C186.08 83.73 186.44 83.14 186.89 82.63C187.35 82.12 187.9 81.73 188.53 81.44C189.16 81.15 189.87 81.01 190.63 81.01C191.26 81.01 191.8 81.09 192.26 81.26C192.72 81.43 193.1 81.63 193.4 81.87C193.7 82.11 193.94 82.34 194.12 82.56C194.3 82.78 194.42 82.94 194.48 83.05L193.9 83.45C193.84 83.37 193.73 83.23 193.58 83.05C193.43 82.87 193.23 82.68 192.96 82.47C192.7 82.27 192.38 82.09 192.01 81.95C191.64 81.81 191.2 81.73 190.7 81.73C189.77 81.73 188.98 81.95 188.32 82.38C187.66 82.81 187.15 83.39 186.8 84.12C186.45 84.85 186.27 85.67 186.27 86.59C186.27 87.51 186.45 88.32 186.8 89.06C187.15 89.8 187.65 90.39 188.3 90.82C188.95 91.25 189.72 91.47 190.62 91.47C191.44 91.47 192.12 91.38 192.64 91.2C193.17 91.02 193.6 90.81 193.94 90.56L193.96 90.55Z",
    "M207 91.93V81.26H207.77V91.93H207Z",
    "M223.29 91.93V81.95H219.15V81.26H228.21V81.95H224.07V91.93H223.3H223.29Z",
    "M236.68 91.93L241.05 81.26H241.82L246.19 91.93H245.31L243.92 88.49H238.9L237.52 91.93H236.69H236.68ZM239.17 87.77H243.62L241.4 82.23L239.18 87.77H239.17Z",
    "M257.48 91.93V81.26H258.25V91.21H264.3V91.93H257.48Z",
  ];

  var LOADING_OPACITY = 0.1;
  var REVEAL_MS = 600;

  var NS = "http://www.w3.org/2000/svg";

  function triD(cx, cy, w, h) {
    return (
      "M" +
      cx +
      "," +
      (cy - h / 2) +
      " L" +
      (cx - w / 2) +
      "," +
      (cy + h / 2) +
      " L" +
      (cx + w / 2) +
      "," +
      (cy + h / 2) +
      " Z"
    );
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) {
      el.setAttribute(k, attrs[k]);
    }
    return el;
  }

  function computeGeometry(mount) {
    var Wc = Math.max(1, Math.round(mount.clientWidth));
    var Hc = Math.max(1, Math.round(mount.clientHeight));
    var kHeight = Hc / DESIGN.H;
    var kWidth = (Wc - 2 * LOGO_HORIZONTAL_INSET) / LOGO_WIDTH;
    var k = Math.min(kHeight, Math.max(0, kWidth));
    var cx0 = DESIGN.W / 2;
    var cy0 = DESIGN.H / 2;
    var cxC = Wc / 2;
    var cyC = Hc / 2;

    function pt(p) {
      return { cx: (p.cx - cx0) * k + cxC, cy: (p.cy - cy0) * k + cyC };
    }

    function len(v) {
      return v * k;
    }

    var SMALL = { w: len(DESIGN.SMALL.w), h: len(DESIGN.SMALL.h) };
    var FINAL = { w: len(DESIGN.FINAL.w), h: len(DESIGN.FINAL.h) };
    var FINAL_LEFT = pt(DESIGN.FINAL_LEFT);
    var FINAL_RIGHT = pt(DESIGN.FINAL_RIGHT);
    var MERGE = { cx: (FINAL_LEFT.cx + FINAL_RIGHT.cx) / 2, cy: FINAL_LEFT.cy };
    var wordAnchor = pt({ cx: DESIGN.WORD_TX, cy: DESIGN.WORD_TY });

    var SCATTER_RADIUS = Math.sqrt(
      Math.pow(SMALL.w / 2, 2) + Math.pow(SMALL.h / 2, 2)
    );
    var MIN_GAP = len(DESIGN.MIN_GAP);
    var SCATTER_BOUNDS = {
      x0: -SCATTER_RADIUS,
      x1: Wc + SCATTER_RADIUS,
      y0: -SCATTER_RADIUS,
      y1: Hc + SCATTER_RADIUS,
    };

    var DESIGN_R = Math.sqrt(
      Math.pow(DESIGN.SMALL.w / 2, 2) + Math.pow(DESIGN.SMALL.h / 2, 2)
    );
    var designBoundsW = DESIGN.W + 2 * DESIGN_R;
    var designBoundsH = DESIGN.H + 2 * DESIGN_R;
    var boundsW = SCATTER_BOUNDS.x1 - SCATTER_BOUNDS.x0;
    var boundsH = SCATTER_BOUNDS.y1 - SCATTER_BOUNDS.y0;
    var areaRatio = (boundsW / designBoundsW) * (boundsH / designBoundsH);
    var TRI_COUNT = Math.max(
      16,
      Math.min(80, Math.round(DESIGN.N * areaRatio))
    );
    var LEFT_KEEP_INDEX = Math.floor(TRI_COUNT * 0.1);
    var RIGHT_KEEP_INDEX = Math.min(
      TRI_COUNT - 1,
      Math.floor(TRI_COUNT * 0.85)
    );
    if (RIGHT_KEEP_INDEX === LEFT_KEEP_INDEX) {
      RIGHT_KEEP_INDEX = Math.min(TRI_COUNT - 1, LEFT_KEEP_INDEX + 1);
    }

    return {
      Wc: Wc,
      Hc: Hc,
      k: k,
      SMALL: SMALL,
      FINAL: FINAL,
      FINAL_LEFT: FINAL_LEFT,
      FINAL_RIGHT: FINAL_RIGHT,
      MERGE: MERGE,
      WORD_SCALE: len(DESIGN.WORD_SCALE),
      WORD_TX: wordAnchor.cx,
      WORD_TY: wordAnchor.cy,
      SCATTER_RADIUS: SCATTER_RADIUS,
      MIN_GAP: MIN_GAP,
      SCATTER_BOUNDS: SCATTER_BOUNDS,
      TRI_COUNT: TRI_COUNT,
      LEFT_KEEP_INDEX: LEFT_KEEP_INDEX,
      RIGHT_KEEP_INDEX: RIGHT_KEEP_INDEX,
    };
  }

  function buildSVG(mount, geo) {
    var svg = svgEl("svg", {
      viewBox: "0 0 " + geo.Wc + " " + geo.Hc,
      "aria-hidden": "true",
    });
    svg.style.height = geo.Hc + "px";

    var tris = [];
    for (var i = 0; i < geo.TRI_COUNT; i++) {
      var path = svgEl("path", {
        class: "tri",
        d: triD(geo.MERGE.cx, geo.MERGE.cy, geo.SMALL.w, geo.SMALL.h),
      });
      path.style.transformBox = "view-box";
      path.style.transformOrigin = geo.MERGE.cx + "px " + geo.MERGE.cy + "px";
      path.dataset.keep =
        i === geo.LEFT_KEEP_INDEX
          ? "left"
          : i === geo.RIGHT_KEEP_INDEX
            ? "right"
            : "";
      svg.appendChild(path);
      tris.push(path);
    }

    var wm = svgEl("g", { class: "wordmark" });
    wm.style.transformBox = "view-box";
    var glyphs = svgEl("g", {
      transform:
        "translate(" +
        geo.WORD_TX +
        "," +
        geo.WORD_TY +
        ") scale(" +
        geo.WORD_SCALE +
        ")",
    });
    WORD_PATHS.forEach(function (d) {
      glyphs.appendChild(svgEl("path", { d: d }));
    });
    wm.appendChild(glyphs);
    svg.appendChild(wm);

    mount.appendChild(svg);
    return { svg: svg, tris: tris, wordmark: wm };
  }

  function pickGrid(n, ratio) {
    var best = null;
    for (var rows = 1; rows <= n; rows++) {
      if (n % rows !== 0) {
        continue;
      }
      var cols = n / rows;
      var diff = Math.abs(cols / rows - ratio);
      if (!best || diff < best.diff) {
        best = { rows: rows, cols: cols, diff: diff };
      }
    }
    return best;
  }

  function scatterPositions(n, geo) {
    var bounds = geo.SCATTER_BOUNDS;
    var boundsW = bounds.x1 - bounds.x0;
    var boundsH = bounds.y1 - bounds.y0;
    var grid = pickGrid(n, boundsW / boundsH);
    var cols = grid.cols;
    var rows = grid.rows;
    var cellW = boundsW / cols;
    var cellH = boundsH / rows;
    var jitterX = cellW * 0.3;
    var jitterY = cellH * 0.3;

    var placed = [];
    for (var i = 0; i < n; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var baseX = bounds.x0 + (col + 0.5) * cellW;
      var baseY = bounds.y0 + (row + 0.5) * cellH;
      var tries = 0;
      var found = null;
      while (tries < 300 && !found) {
        var x = baseX + (Math.random() * 2 - 1) * jitterX;
        var y = baseY + (Math.random() * 2 - 1) * jitterY;
        var ok = true;
        for (var j = 0; j < placed.length; j++) {
          var p = placed[j];
          var dx = p.x - x;
          var dy = p.y - y;
          if (
            Math.sqrt(dx * dx + dy * dy) <
            geo.SCATTER_RADIUS * 2 + geo.MIN_GAP
          ) {
            ok = false;
            break;
          }
        }
        if (ok) {
          found = { x: x, y: y, rot: Math.random() * 360 };
        }
        tries++;
      }
      placed.push(found || { x: baseX, y: baseY, rot: Math.random() * 360 });
    }
    return placed;
  }

  function AssembleMark(mount) {
    this.mount = mount;
    this.geo = computeGeometry(mount);
    var built = buildSVG(mount, this.geo);
    this.svg = built.svg;
    this.tris = built.tris;
    this.wordmark = built.wordmark;
    this.playing = false;

    this.hardReset();
    mount.ngPlay = this.play.bind(this);
  }

  AssembleMark.prototype.reduced = function () {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  AssembleMark.prototype.transformCSS = function (tx, ty, deg, s) {
    return (
      "translate(" +
      tx +
      "px," +
      ty +
      "px) rotate(" +
      deg +
      "deg) scale(" +
      s +
      ")"
    );
  };

  AssembleMark.prototype.setT = function (tri, tx, ty, deg, s, dur, delay) {
    tri.style.transition = dur
      ? "transform " + dur + "ms " + EASE + " " + (delay || 0) + "ms"
      : "none";
    tri.style.transform = this.transformCSS(tx, ty, deg, s);
  };

  AssembleMark.prototype.hardReset = function () {
    var geo = this.geo;
    var scatter = scatterPositions(this.tris.length, geo);
    this.tris.forEach(function (tri, i) {
      var p = scatter[i];
      tri.style.transition = "none";
      tri.style.opacity = String(LOADING_OPACITY);
      this.setT(tri, p.x - geo.MERGE.cx, p.y - geo.MERGE.cy, p.rot, 1, 0);
    }, this);
    this.wordmark.style.transition = "none";
    this.wordmark.style.opacity = "0";
    this.wordmark.style.transform = "translateY(10px)";
    this.svg.getBoundingClientRect();
  };

  AssembleMark.prototype.finishInstant = function () {
    var geo = this.geo;
    this.tris.forEach(function (tri) {
      tri.style.transition = "none";
      if (tri.dataset.keep) {
        tri.style.opacity = "1";
        var target = tri.dataset.keep === "left" ? geo.FINAL_LEFT : geo.FINAL_RIGHT;
        this.setT(
          tri,
          target.cx - geo.MERGE.cx,
          target.cy - geo.MERGE.cy,
          0,
          geo.FINAL.w / geo.SMALL.w,
          0
        );
      } else {
        tri.style.opacity = "0";
      }
    }, this);
    this.wordmark.style.transition = "none";
    this.wordmark.style.opacity = "1";
    this.wordmark.style.transform = "translateY(0)";
    this.playing = false;
    this.mount.dispatchEvent(new CustomEvent("assemble:complete"));
  };

  AssembleMark.prototype.play = function () {
    if (this.playing) {
      return;
    }
    this.playing = true;
    this.hardReset();
    if (this.reduced()) {
      this.finishInstant();
      return;
    }
    var self = this;
    this.tris.forEach(function (tri) {
      tri.style.transition = "opacity " + REVEAL_MS + "ms ease";
      tri.style.opacity = "1";
    });
    setTimeout(function () {
      self.mergeToOne();
    }, REVEAL_MS + 1000);
  };

  AssembleMark.prototype.mergeToOne = function () {
    var self = this;
    var geo = this.geo;
    var scale = geo.FINAL.w / geo.SMALL.w;
    this.tris.forEach(function (tri, i) {
      var stagger = (i % 6) * 18;
      var moveT = "transform 1800ms " + EASE + " " + stagger + "ms";
      if (tri.dataset.keep) {
        tri.style.transition = moveT;
      } else {
        tri.style.transition =
          moveT + ", opacity 350ms ease " + (stagger + 1450) + "ms";
        tri.style.opacity = "0";
      }
      tri.style.transform = self.transformCSS(0, 0, 0, scale);
    });
    setTimeout(function () {
      self.split();
    }, 1800 + 90 + 350 + 150);
  };

  AssembleMark.prototype.split = function () {
    var self = this;
    var geo = this.geo;
    var scale = geo.FINAL.w / geo.SMALL.w;
    this.tris.forEach(function (tri) {
      if (!tri.dataset.keep) {
        return;
      }
      var target = tri.dataset.keep === "left" ? geo.FINAL_LEFT : geo.FINAL_RIGHT;
      tri.style.transition = "transform 900ms " + EASE;
      tri.style.transform = self.transformCSS(
        target.cx - geo.MERGE.cx,
        target.cy - geo.MERGE.cy,
        0,
        scale
      );
    });
    setTimeout(function () {
      self.wordmarkReveal();
    }, 900 + 200);
  };

  AssembleMark.prototype.wordmarkReveal = function () {
    var self = this;
    this.wordmark.style.transition = "opacity 700ms ease, transform 700ms ease";
    this.wordmark.style.opacity = "1";
    this.wordmark.style.transform = "translateY(0)";
    setTimeout(function () {
      self.playing = false;
      self.mount.dispatchEvent(new CustomEvent("assemble:complete"));
    }, 700 + 50);
  };

  global.AssembleMark = AssembleMark;
})(window);
