/* TTB by the Numbers — chart and interaction logic.
   Plain Chart.js. Every series traces to the globals defined in data.js. */
(function () {
  "use strict";

  var INK = "#211f1b", MUTED = "#6d665b", GRID = "#ece4d6", ACCENT = "#b3702d";
  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  if (window.Chart) {
    Chart.defaults.font.family = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
    Chart.defaults.font.size = 12.5;
    Chart.defaults.color = MUTED;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.boxHeight = 8;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.tooltip.backgroundColor = "#2b2822";
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 5;
    Chart.defaults.plugins.tooltip.titleMarginBottom = 6;
    Chart.defaults.animation = reduce ? false : { duration: 700 };
  }

  /* ---------- helpers ---------- */
  function billions(thousands) { return thousands == null ? null : thousands / 1e6; }
  function millions(n) { return n == null ? null : n / 1e6; }
  function fmt(n, d) { return Number(n).toLocaleString("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }

  function baseLineOptions(yLabel, yFmt) {
    return {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: true, position: "top", align: "start" },
        tooltip: {
          callbacks: {
            label: function (c) {
              if (c.parsed.y == null) return c.dataset.label + ": not published";
              return c.dataset.label + ": " + yFmt(c.parsed.y);
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 12 } },
        y: {
          beginAtZero: true, grid: { color: GRID }, border: { display: false },
          title: { display: !!yLabel, text: yLabel, color: MUTED, font: { size: 11 } },
          ticks: { callback: function (v) { return yFmt(v, true); } }
        }
      }
    };
  }

  function makeControls(host, items, onPick, multi) {
    host.innerHTML = "";
    items.forEach(function (it, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = it.label;
      var on = multi ? true : i === 0;
      b.setAttribute("aria-pressed", String(on));
      b.addEventListener("click", function () {
        if (multi) {
          var next = b.getAttribute("aria-pressed") !== "true";
          b.setAttribute("aria-pressed", String(next));
          onPick(i, next, it);
        } else {
          Array.prototype.forEach.call(host.children, function (c) { c.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
          onPick(i, true, it);
        }
      });
      host.appendChild(b);
    });
  }

  /* ---------- hero count-up ---------- */
  (function countUp() {
    var el = document.querySelector("[data-countup]");
    if (!el) return;
    var target = parseFloat(el.dataset.countup);
    var dec = parseInt(el.dataset.decimals || "0", 10);
    var prefix = el.dataset.prefix || "";
    function land() { el.textContent = prefix + target.toFixed(dec); }
    if (reduce) { land(); return; }
    var start = null, dur = 1100;
    function step(ts) {
      if (start == null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    /* the hero sits above the fold, so animate on load; a timer guarantees the
       final value even where requestAnimationFrame is paused (background tab) */
    requestAnimationFrame(step);
    setTimeout(land, dur + 200);
  })();

  /* ---------- 1. collections over time ---------- */
  (function () {
    var cv = document.getElementById("chartCollections");
    if (!cv || !window.Chart) return;
    var yrs = TAX.years.map(String);
    var bFmt = function (v) { return "$" + fmt(v, 1) + "B"; };
    new Chart(cv, {
      type: "line",
      data: {
        labels: yrs,
        datasets: [
          { label: "All-in total", data: TAX.totalTaxCollections.map(billions), borderColor: ACCENT, backgroundColor: ACCENT, borderWidth: 2.4, tension: .25, pointRadius: 2.5, pointHoverRadius: 5 },
          { label: "Domestic (TTB)", data: TAX.totalTTBCollections.map(billions), borderColor: "#6f5844", backgroundColor: "#6f5844", borderWidth: 2.2, tension: .25, pointRadius: 2.5, pointHoverRadius: 5 },
          { label: "Imports (CBP)", data: TAX.importsCBP.map(billions), borderColor: "#5b7285", backgroundColor: "#5b7285", borderWidth: 2.2, tension: .25, pointRadius: 2.5, pointHoverRadius: 5 }
        ]
      },
      options: baseLineOptions("Billions of dollars", bFmt)
    });
  })();

  /* ---------- 2. FY2025 by commodity ---------- */
  (function () {
    var cv = document.getElementById("chartCommodity");
    if (!cv || !window.Chart) return;
    var last = TAX.years.length - 1;
    var rows = TAX.commodityMeta.map(function (m) {
      return { label: m.label, color: m.color, val: billions(TAX.byCommodity[m.key][last]) };
    }).sort(function (a, b) { return b.val - a.val; });
    var total = rows.reduce(function (s, r) { return s + r.val; }, 0);
    new Chart(cv, {
      type: "bar",
      data: {
        labels: rows.map(function (r) { return r.label; }),
        datasets: [{ data: rows.map(function (r) { return r.val; }), backgroundColor: rows.map(function (r) { return r.color; }), borderRadius: 3, maxBarThickness: 34 }]
      },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: function (c) {
            var pct = (c.parsed.x / total * 100);
            return "$" + fmt(c.parsed.x, 2) + "B  (" + fmt(pct, 0) + "% of total)";
          } } }
        },
        scales: {
          x: { beginAtZero: true, grid: { color: GRID }, border: { display: false }, ticks: { callback: function (v) { return "$" + fmt(v, 0) + "B"; } } },
          y: { grid: { display: false }, border: { display: false }, ticks: { color: INK, font: { size: 12.5 } } }
        }
      }
    });
    // supporting stats
    var host = document.getElementById("commodityStats");
    if (host) {
      var stats = [
        { n: "$6.8B", l: "distilled spirits, up 19% since FY 2015" },
        { n: "$8.9B", l: "tobacco, down 38% since FY 2015" },
        { n: "$56M", l: "average collected per day in FY 2025" },
        { n: "25%", l: "of collections came in on imports" }
      ];
      stats.forEach(function (s) {
        var d = document.createElement("div"); d.className = "s";
        d.innerHTML = '<div class="s-num">' + s.n + '</div><div class="s-lab">' + s.l + "</div>";
        host.appendChild(d);
      });
    }
  })();

  /* ---------- 3. alcohol production, toggled ---------- */
  (function () {
    var cv = document.getElementById("chartAlcohol");
    if (!cv || !window.Chart) return;
    var titleEl = document.getElementById("alcTitle");
    var srcEl = document.getElementById("alcSource");
    var products = {
      beer: {
        label: "Beer", years: BEER.years, unit: "Millions of barrels",
        title: "Beer: production and taxable removals",
        source: "Source: TTB National Statistical Report, Beer (TTB S 5130), calendar years 2012 to 2025. A barrel is 31 gallons.",
        series: [
          { label: "Production", data: BEER.productionBarrels.map(millions), color: "#c9962f" },
          { label: "Taxable removals", data: BEER.taxableRemovalsBarrels.map(millions), color: "#8a5620" }
        ]
      },
      wine: {
        label: "Wine", years: WINE.years, unit: "Millions of wine gallons",
        title: "Wine: production and taxable withdrawals",
        source: "Source: TTB National Statistical Report, Wine (TTB S 5120), calendar years 2012 to 2025.",
        series: [
          { label: "Production", data: WINE.productionGallons.map(millions), color: "#b6607c" },
          { label: "Taxable withdrawals", data: WINE.taxableWithdrawalsGallons.map(millions), color: "#7a2f45" }
        ]
      },
      spirits: {
        label: "Spirits", years: SPIRITS.years, unit: "Millions of proof gallons",
        title: "Distilled spirits: whisky production and total taxable withdrawals",
        source: "Source: TTB National Statistical Report, Distilled Spirits (TTB S 5110), calendar years 2012 to 2025. The 2025 national taxable-withdrawals total is redacted in the source and shown as a gap.",
        series: [
          { label: "Whisky production", data: SPIRITS.productionWhiskyProofGallons.map(millions), color: "#c78a3c" },
          { label: "Taxable withdrawals (all spirits)", data: SPIRITS.taxableWithdrawalsProofGallons.map(millions), color: "#8a5620" }
        ]
      }
    };
    var chart = null;
    function draw(key) {
      var p = products[key];
      titleEl.textContent = p.title;
      srcEl.textContent = p.source;
      var fFmt = function (v) { return fmt(v, 0); };
      var cfg = {
        type: "line",
        data: {
          labels: p.years.map(String),
          datasets: p.series.map(function (s) {
            return { label: s.label, data: s.data, borderColor: s.color, backgroundColor: s.color, borderWidth: 2.4, tension: .25, pointRadius: 2, pointHoverRadius: 5, spanGaps: false };
          })
        },
        options: baseLineOptions(p.unit, fFmt)
      };
      if (chart) { chart.destroy(); }
      chart = new Chart(cv, cfg);
    }
    draw("beer");
    var host = document.getElementById("alcToggle");
    if (host) {
      makeControls(host, [
        { label: "Beer", key: "beer" }, { label: "Wine", key: "wine" }, { label: "Spirits", key: "spirits" }
      ], function (i, on, it) { draw(it.key); }, false);
    }
  })();

  /* ---------- 4. tobacco ---------- */
  (function () {
    var cv = document.getElementById("chartTobacco");
    if (!cv || !window.Chart) return;
    var sticks = TOBACCO.cigaretteSticks.map(function (n) { return n / 1e9; });
    new Chart(cv, {
      type: "line",
      data: {
        labels: TOBACCO.years.map(String),
        datasets: [{ label: "Taxed cigarettes", data: sticks, borderColor: "#6f5844", backgroundColor: "rgba(111,88,68,.10)", borderWidth: 2.6, tension: .25, fill: true, pointRadius: 2, pointHoverRadius: 5 }]
      },
      options: baseLineOptions("Billions of cigarettes", function (v) { return fmt(v, 0) + "B"; })
    });
  })();

  /* ---------- 5. permits ---------- */
  (function () {
    var cv = document.getElementById("chartPermits");
    if (!cv || !window.Chart) return;
    function pts(pc) { return pc.years.map(function (y, i) { return { x: y, y: pc.counts[i] }; }); }
    new Chart(cv, {
      type: "line",
      data: {
        datasets: [
          { label: "Breweries (registered)", data: pts(BEER.permitCounts), borderColor: "#c9962f", backgroundColor: "#c9962f", borderWidth: 2.4, tension: .25, pointRadius: 2, pointHoverRadius: 5 },
          { label: "Bonded wine producers", data: pts(WINE.permitCounts), borderColor: "#8e3b55", backgroundColor: "#8e3b55", borderWidth: 2.4, tension: .25, pointRadius: 2, pointHoverRadius: 5 },
          { label: "Distillery permits", data: pts(SPIRITS.permitCounts), borderColor: "#b3702d", backgroundColor: "#b3702d", borderWidth: 2.4, tension: .25, pointRadius: 2, pointHoverRadius: 5 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "nearest", intersect: false },
        plugins: {
          legend: { display: true, position: "top", align: "start" },
          tooltip: { callbacks: { title: function (items) { return items.length ? String(items[0].parsed.x) : ""; }, label: function (c) { return c.dataset.label + ": " + fmt(c.parsed.y, 0); } } }
        },
        scales: {
          x: { type: "linear", min: 2010, max: 2024, grid: { display: false }, ticks: { maxRotation: 0, callback: function (v) { return Math.round(v); }, stepSize: 2 } },
          y: { beginAtZero: true, grid: { color: GRID }, border: { display: false }, ticks: { callback: function (v) { return fmt(v, 0); } } }
        }
      }
    });
  })();

})();
