/* TTB by the Numbers: the picture show and the ledger.
   All values come from data.js verbatim; conversions here are display-only. */

(function () {
  "use strict";

  /* less animations: render the whole page still, the way reduced-motion does */
  var reduced = true;

  /* the door's "house band" switch is the master mute: off means no music AND
     no typewriter clacks, stamps, or other reel sounds */
  function wantSound() {
    try { return sessionStorage.getItem("ttbSound") === "on"; } catch (e) { return false; }
  }

  /* ============================================================
     Typewriter click-clack (WebAudio, no sound files)
     ============================================================ */
  var audioCtx = null;
  function ensureAudio() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) { /* no audio, no problem */ }
  }
  document.addEventListener("pointerdown", ensureAudio);
  document.addEventListener("keydown", ensureAudio);

  function clack() {
    if (reduced || !wantSound() || !audioCtx || audioCtx.state !== "running") return;
    var t = audioCtx.currentTime;
    var dur = 0.035;
    var buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * dur), audioCtx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.4);
    var src = audioCtx.createBufferSource(); src.buffer = buf;
    var bp = audioCtx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 1700 + Math.random() * 1600; bp.Q.value = 1.1;
    var g = audioCtx.createGain(); g.gain.value = 0.07;
    src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
    src.start(t);
  }

  /* a stamp lands: one deep felt thump through the table */
  function thunk() {
    if (reduced || !wantSound() || !audioCtx || audioCtx.state !== "running") return;
    var t = audioCtx.currentTime;
    var o = audioCtx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.11);
    var g = audioCtx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t); o.stop(t + 0.24);
    var dur = 0.05;
    var buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * dur), audioCtx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    var s = audioCtx.createBufferSource(); s.buffer = buf;
    var f = audioCtx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 500;
    var g2 = audioCtx.createGain(); g2.gain.value = 0.16;
    s.connect(f); f.connect(g2); g2.connect(audioCtx.destination);
    s.start(t);
  }

  /* a round through the plank: a dull pop, more silent film than firefight */
  function popShot() {
    if (reduced || !wantSound() || !audioCtx || audioCtx.state !== "running") return;
    var t = audioCtx.currentTime;
    var dur = 0.09;
    var buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * dur), audioCtx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.6);
    var s = audioCtx.createBufferSource(); s.buffer = buf;
    var f = audioCtx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900;
    var g = audioCtx.createGain(); g.gain.value = 0.12;
    s.connect(f); f.connect(g); g.connect(audioCtx.destination);
    s.start(t);
    var o = audioCtx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(210, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.07);
    var g2 = audioCtx.createGain();
    g2.gain.setValueAtTime(0.09, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g2); g2.connect(audioCtx.destination);
    o.start(t); o.stop(t + 0.14);
  }

  /* a coin clink: two bright partials with a fast die-off */
  function coinClink() {
    if (reduced || !wantSound() || !audioCtx || audioCtx.state !== "running") return;
    var t = audioCtx.currentTime;
    [0, 0.03].forEach(function (off, k) {
      var o = audioCtx.createOscillator();
      o.type = "triangle";
      o.frequency.value = (k ? 5100 : 3300) + Math.random() * 700;
      var g = audioCtx.createGain();
      g.gain.setValueAtTime(k ? 0.014 : 0.03, t + off);
      g.gain.exponentialRampToValueAtTime(0.0004, t + off + 0.13);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t + off); o.stop(t + off + 0.16);
    });
  }
  /* the coins rattle onto the bar as the stacks land */
  var coinShowerDone = false;
  function coinShower() {
    if (coinShowerDone || reduced || typeof TAX === "undefined") return;
    coinShowerDone = true;
    TAX.years.forEach(function (yr, i) {
      var n = Math.round(TAX.totalTaxCollections[i] / 1e6);
      [Math.floor(n / 2), n].forEach(function (k) {
        setTimeout(coinClink, i * 85 + k * 38);
      });
    });
  }

  /* vintage palette (mirrors styles.css) */
  var V = {
    ink: "#221708", paper: "#f6edd6", grid: "#d8c9a3", tick: "#8a7853",
    gold: "#c2922a", spirits: "#96551b", wine: "#71303f", beer: "#c2922a",
    tobacco: "#59462f", firearms: "#4c5a60", up: "#4a6a33", down: "#a3392a"
  };
  var COLORS = {
    distilledSpirits: V.spirits, wine: V.wine, beer: V.beer,
    tobacco: V.tobacco, firearms: V.firearms
  };

  var fmt = new Intl.NumberFormat("en-US");
  var kToB = function (v) { return v / 1e6; };
  var money2 = function (v) { return "$" + v.toFixed(2) + "B"; };

  /* ============================================================
     Typewriter
     ============================================================ */
  function typeText(el, text, cps, signal, sound) {
    return new Promise(function (resolve) {
      el.textContent = "";
      var caret = document.createElement("span");
      caret.className = "caret";
      var out = document.createTextNode("");
      el.appendChild(out); el.appendChild(caret);
      el.classList.add("typing");
      if (reduced) { out.nodeValue = text; el.classList.add("done"); resolve(); return; }
      var i = 0;
      (function tick() {
        if (signal && signal.aborted) { out.nodeValue = text; el.classList.add("done"); resolve(); return; }
        if (i >= text.length) { el.classList.add("done"); resolve(); return; }
        var ch = text.charAt(i++);
        out.nodeValue += ch;
        if (sound && ch !== " ") clack();
        var d = 1000 / (cps || 26) * (0.6 + Math.random() * 0.9);
        setTimeout(tick, d);
      })();
    });
  }

  /* ============================================================
     Silent-film intro
     ============================================================ */
  var intro = document.getElementById("intro");
  var introAbort = { aborted: false };
  var introTimeouts = [];

  function iwait(ms, run) {
    return new Promise(function (res) {
      if (run.aborted) return res();
      introTimeouts.push(setTimeout(res, ms));
    });
  }

  function spawnBubbles(scene, n) {
    scene.querySelectorAll(".bubble").forEach(function (b) { b.remove(); });
    for (var i = 0; i < n; i++) {
      var b = document.createElement("i");
      b.className = "bubble";
      var size = 5 + Math.random() * 16;
      b.style.width = b.style.height = size + "px";
      b.style.left = Math.random() * 100 + "%";
      b.style.animationDuration = 4 + Math.random() * 5 + "s";
      b.style.animationDelay = Math.random() * 3 + "s";
      scene.appendChild(b);
    }
  }

  function endIntro(instant) {
    introAbort.aborted = true;
    introTimeouts.forEach(clearTimeout);
    document.body.style.overflow = "";
    startHouseMusic(); /* skipping the reel still opens the bar */
    if (instant) { intro.classList.add("gone"); afterIntro(); return; }
    intro.classList.add("iris");
    setTimeout(function () { intro.classList.add("gone"); }, 1150);
    afterIntro();
  }

  function playIntro() {
    if (reduced) {
      /* the page is kept still, but she asked for one beat back: the county-line
         road sign. play just that scene, then land on the page. */
      var rsScene = intro.querySelector('.scene[data-scene="rs"]');
      if (!rsScene) { intro.classList.add("gone"); startHouseMusic(); afterIntro(); return; }
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
      intro.classList.remove("gone", "iris");
      void rsScene.offsetWidth;
      rsScene.classList.add("on");
      var rsCard = rsScene.querySelector(".card");
      introTimeouts.push(setTimeout(function () {
        if (rsCard) rsCard.classList.add("go-rebel"); /* NOT HERE, PARTNER paints on */
        startHouseMusic();                            /* the record drops after the knock */
      }, 1600));
      introTimeouts.push(setTimeout(function () { endIntro(false); }, 4300));
      return;
    }
    /* kill any run already in flight before starting a fresh one */
    introAbort.aborted = true;
    introTimeouts.forEach(clearTimeout);
    var myRun = { aborted: false };
    introAbort = myRun;
    introTimeouts = [];
    intro.classList.remove("gone", "iris");
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    var scenes = Array.prototype.slice.call(intro.querySelectorAll(".scene"));
    scenes.forEach(function (s) {
      s.classList.remove("on");
      s.querySelectorAll(".typed").forEach(function (t) {
        t.textContent = "";
        t.classList.remove("typing", "done");
      });
      var c = s.querySelector(".card");
      if (c) c.classList.remove("go-red", "go-arrow", "go-green", "go-rebel");
    });

    /* lock every card at its final size before any type lands, so the
       reel holds one shape and the words grow into it */
    scenes.forEach(function (s) {
      s.classList.add("measure");
      var card = s.querySelector(".card");
      if (card) card.style.minHeight = "";
      s.querySelectorAll(".typed").forEach(function (t) {
        t.style.minHeight = "";
        if (t.dataset.type) t.textContent = t.dataset.type;
      });
      s.querySelectorAll(".typed").forEach(function (t) {
        if (t.dataset.type) t.style.minHeight = t.offsetHeight + "px";
      });
      if (card) card.style.minHeight = card.offsetHeight + "px";
      s.querySelectorAll(".typed").forEach(function (t) {
        if (t.dataset.type) t.textContent = "";
      });
      s.classList.remove("measure");
    });

    var seq = Promise.resolve();
    var holds = { "rs": 2600, "1": 1500, "2": 1900, "5": 2000 };
    scenes.forEach(function (scene) {
      seq = seq.then(function () {
        if (myRun.aborted) return;
        scenes.forEach(function (s) { s.classList.remove("on"); });
        /* force restart of scene-scoped CSS animations (the stamp, the iris) */
        void scene.offsetWidth;
        scene.classList.add("on");
        if (scene.dataset.scene === "rs") {
          /* the county line closes the reel: the law posts its notice, the
             outlaws crack the plank, THAT is when the record drops, the
             message goes up in red paint, and three rounds sign the work */
          var cardR = scene.querySelector(".card");
          return iwait(1700, myRun).then(function () {
            if (!myRun.aborted) {
              cardR.classList.add("go-rebel");
              startHouseMusic();
              thunk();
              introTimeouts.push(setTimeout(function () { if (!myRun.aborted) popShot(); }, 60));
              [780, 980, 1220].forEach(function (ms) {
                introTimeouts.push(setTimeout(function () { if (!myRun.aborted) popShot(); }, ms));
              });
            }
            return iwait(holds["rs"] || 2600, myRun);
          });
        }
        if (scene.dataset.scene === "0") {
          /* film leader: 3... 2... 1... start the show */
          var num = scene.querySelector("#leaderNum");
          var leaderTick = function (v) {
            num.textContent = v;
            num.classList.remove("tick"); void num.offsetWidth; num.classList.add("tick");
            clack(); thunk();
          };
          leaderTick("3");
          return new Promise(function (r) {
            var vals = ["3", "2", "1"], k = 0;
            var t = setInterval(function () {
              k++;
              if (myRun.aborted || k >= vals.length) { clearInterval(t); r(); return; }
              leaderTick(vals[k]);
            }, 800);
            introTimeouts.push(t);
          }).then(function () { return iwait(600, myRun); });
        }
        if (scene.dataset.scene === "2") {
          /* one long take: 1919, then the two stamps land in turn, no scene cuts */
          spawnBubbles(scene, 26);
          var card2 = scene.querySelector(".card");
          var ts = scene.querySelectorAll(".typed");
          return typeText(ts[0], ts[0].dataset.type, 14, myRun, true)
            .then(function () { return iwait(800, myRun); })
            .then(function () {
              if (!myRun.aborted) {
                card2.classList.add("go-red");
                introTimeouts.push(setTimeout(function () { if (!myRun.aborted) thunk(); }, 300));
              }
              return iwait(950, myRun);
            })
            .then(function () { return typeText(ts[1], ts[1].dataset.type, 14, myRun, true); })
            .then(function () { return iwait(500, myRun); })
            /* the arrow draws its way across first, then the green stamp lands */
            .then(function () { if (!myRun.aborted) card2.classList.add("go-arrow"); return iwait(1250, myRun); })
            .then(function () {
              if (!myRun.aborted) {
                card2.classList.add("go-green");
                /* no music yet: the record holds its cue for the county line */
                introTimeouts.push(setTimeout(function () { if (!myRun.aborted) thunk(); }, 300));
              }
              return iwait(950, myRun);
            })
            .then(function () { return typeText(ts[2], ts[2].dataset.type, 14, myRun, true); })
            .then(function () { return iwait(holds["2"] || 1900, myRun); });
        }
        return Promise.resolve().then(function () {
          if (myRun.aborted) return;
          var t = scene.querySelector(".typed");
          return t ? typeText(t, t.dataset.type, 14, myRun, true) : null;
        }).then(function () {
          return iwait(holds[scene.dataset.scene] || 1400, myRun);
        });
      });
    });
    seq.then(function () { if (!myRun.aborted) endIntro(false); });
  }

  document.getElementById("skipIntro").addEventListener("click", function () { endIntro(true); });

  /* ============================================================
     Count-ups, typewriter kickers, reveals (armed after the intro)
     ============================================================ */
  function countUp(el) {
    var target = parseFloat(el.dataset.countup);
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    var prefix = el.dataset.prefix || "";
    var comma = el.dataset.comma === "1";
    var render = function (v) {
      var s = comma ? fmt.format(Math.round(v)) : v.toFixed(decimals);
      el.textContent = prefix + s;
    };
    if (reduced) { render(target); return; }
    var t0 = null, dur = 1400;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      render(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var chartFactories = {};   /* canvasId -> function, built below */
  var madeCharts = {};

  function afterIntro() {
    if (afterIntro.done) return;
    afterIntro.done = true;

    /* hold a typed element at its final height so the page doesn't
       shuffle underneath while the letters land */
    function reserve(el) {
      var prev = el.textContent;
      el.textContent = el.dataset.type;
      el.style.minHeight = el.offsetHeight + "px";
      el.textContent = prev;
    }

    /* scroll-triggered type is silent; the clack sounds belong to the intro reel */
    var heroKick = document.querySelector(".hero .kick");
    if (heroKick) { reserve(heroKick); typeText(heroKick, heroKick.dataset.type, 22, null, false); }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        if (el.classList.contains("reveal")) el.classList.add("in");
        if (el.classList.contains("tw") && el.dataset.type) {
          if (el.classList.contains("kicker")) {
            /* section kickers land whole; only the barkeep still types mid-page */
            el.textContent = el.dataset.type;
            el.classList.add("done");
          } else {
            var whisper = el.classList.contains("barkeep");
            reserve(el);
            typeText(el, el.dataset.type, whisper ? 15 : 22, null, false);
          }
        }
        el.querySelectorAll("[data-countup]").forEach(countUp);
        if (el.dataset.countup) countUp(el);
        el.querySelectorAll("canvas").forEach(function (c) {
          if (chartFactories[c.id] && !madeCharts[c.id]) { madeCharts[c.id] = true; chartFactories[c.id](); }
        });
        if (el.querySelector(".picto-rows")) animatePictos(el);
      });
    }, { threshold: 0.15 });

    document.querySelectorAll(".reveal, .tw, .hero-ticker .t, .hero .big-number").forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     The guest: name from the door, poured through the page
     ============================================================ */
  function guestName() {
    try { return (sessionStorage.getItem("ttbName") || "").trim().slice(0, 24); } catch (e) { return ""; }
  }
  function dressForGuest() {
    var g = guestName();
    var s1 = document.querySelector('.scene[data-scene="1"] .typed');
    if (s1) {
      s1.dataset.type = (g ? "Howdy, " + g + ". " : "Howdy. ") +
        "Let's take a trip back in time for a story of taxes, taverns, and the bureau that kept the books.";
    }
    var lbl = document.getElementById("pourLabel");
    if (lbl) lbl.textContent = g ? g + "'s pour" : "The pour";
    var foot = document.getElementById("pourFor");
    if (foot) foot.textContent = g || "a friend of the house";
    var tabGuest = document.getElementById("tabGuest");
    if (tabGuest) tabGuest.textContent = g || "a friend of the house";
    document.querySelectorAll("[data-barkeep]").forEach(function (el) {
      var t = el.dataset.barkeep.replace(/"/g, "");
      t = g ? t.replace("{name}", g)
            : t.replace(", {name}", "").replace("{name}", "friend");
      el.dataset.type = t; /* the whisper types itself on reveal */
      if (el.classList.contains("done")) el.textContent = t;
    });
  }
  dressForGuest();

  /* progress bar + the filling glass + active nav */
  var progress = document.getElementById("progress");
  var pourLiq = document.getElementById("pourLiq");
  var heroSec = document.getElementById("heroSec");
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var frac = max > 0 ? h.scrollTop / max : 0;
    progress.style.width = frac * 100 + "%";
    if (pourLiq) {
      var full = 20; /* inner mug height in the 34-unit viewBox */
      var lvl = Math.round(full * frac * 10) / 10;
      pourLiq.setAttribute("height", lvl);
      pourLiq.setAttribute("y", 27 - lvl);
    }
    /* the ticket waits offstage until the poster has had its moment */
    if (heroSec) ticket.classList.toggle("show", heroSec.getBoundingClientRect().bottom < 80);
  }, { passive: true });

  /* the programme booklet is the navigation */
  var ticket = document.getElementById("ticketNav");
  var booklet = document.getElementById("booklet");
  function closeBooklet() {
    booklet.classList.remove("open");
    ticket.setAttribute("aria-expanded", "false");
  }
  ticket.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = booklet.classList.toggle("open");
    ticket.setAttribute("aria-expanded", String(open));
  });
  booklet.addEventListener("click", function (e) {
    e.stopPropagation();
    if (e.target.closest("a")) closeBooklet();
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#booklet, #ticketNav")) closeBooklet();
  });

  var navLinks = document.querySelectorAll("#booklet a");
  var secByLink = {};
  navLinks.forEach(function (a) {
    var id = (a.getAttribute("href") || "").slice(1);
    if (id) secByLink[id] = a;
  });

  var navIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      navLinks.forEach(function (a) { a.classList.remove("here"); });
      var a = secByLink[e.target.id];
      if (a) a.classList.add("here");
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  ["ontap", "prologue", "collections", "alcohol", "tobacco", "firearms", "industry", "finale", "tab"].forEach(function (id) {
    var s = document.getElementById(id);
    if (s) navIO.observe(s);
  });

  /* ============================================================
     Pictograms
     ============================================================ */
  var waffle = document.getElementById("waffleShare");
  var waffleLegend = document.getElementById("waffleLegend");
  (function buildWaffle() {
    /* FY2025 shares of total tax collections, rounded to whole cells.
       tobacco 43, spirits 33, beer 15, wine 5, firearms 4 = 100.
       Each cell is the product's own icon from elsewhere in the show. */
    var ICONS = {
      tobacco: { vb: "0 0 26 24", d: '<path d="M4 15.5v2.2a4.8 4.8 0 0 0 9.6 0v-2.2z"/><path d="M13.6 15.5 22.5 8.2l1.6 1.1"/><path d="M8.8 12.2c-1.6-1.8 1.2-2.8-.4-4.8M11.6 12.2c-1.6-1.8 1.2-2.8-.4-4.8"/>' },
      distilledSpirits: { vb: "0 0 24 24", d: '<path d="M10 2h4M12 2v6l5 11a1 1 0 0 1-1 1.4H8A1 1 0 0 1 7 19l5-11"/>' },
      beer: { vb: "0 0 24 24", d: '<path d="M6 4h9v16H6zM15 8h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3"/><path d="M6 8h9"/>' },
      wine: { vb: "0 0 24 24", d: '<path d="M8 3h8c0 5-1 8-4 9v6"/><path d="M8 3c0 5 1 8 4 9"/><path d="M8 21h8"/>' },
      firearms: { vb: "0 0 24 24", d: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>' }
    };
    function iconSVG(key) {
      var ic = ICONS[key];
      return '<svg viewBox="' + ic.vb + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ic.d + '</svg>';
    }
    var blocks = [
      { key: "tobacco", label: "Tobacco", n: 43 },
      { key: "distilledSpirits", label: "Distilled spirits", n: 33 },
      { key: "beer", label: "Beer", n: 15 },
      { key: "wine", label: "Wine", n: 5 },
      { key: "firearms", label: "Firearms and ammunition", n: 4 }
    ];
    var i = 0;
    blocks.forEach(function (b) {
      for (var k = 0; k < b.n; k++) {
        var cell = document.createElement("i");
        cell.style.color = COLORS[b.key];
        cell.style.transitionDelay = (i * 7) + "ms";
        cell.title = b.label + " - pour its funnel";
        cell.setAttribute("aria-hidden", "true"); /* the legend buttons carry this action for screen readers */
        cell.innerHTML = iconSVG(b.key);
        cell.addEventListener("click", function () { pourFunnel(b.key); });
        waffle.appendChild(cell);
        i++;
      }
      var leg = document.createElement("span");
      leg.setAttribute("role", "button");
      leg.tabIndex = 0;
      leg.innerHTML = '<b style="color:' + COLORS[b.key] + '">' + iconSVG(b.key) + '</b>' + b.label + " &middot; " + b.n + "%";
      leg.addEventListener("click", function () { pourFunnel(b.key); });
      leg.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pourFunnel(b.key); }
      });
      waffleLegend.appendChild(leg);
    });
  })();

  /* the funnel pours on demand: pick a product in the waffle above and its
     own share pours out of the full FY 2025 take */
  function pourFunnel(catKey, force) {
    var box = document.getElementById("waffleFunnel");
    if (!box) return;
    /* a second click on the same product folds the funnel back away */
    if (!force && box.dataset.cat === catKey && !box.hidden) {
      box.classList.remove("pour");
      box.hidden = true;
      box.dataset.cat = "";
      box.innerHTML = "";
      return;
    }
    var li = TAX.years.length - 1;
    var totalK = TAX.totalTaxCollections[li];
    var LBL = { distilledSpirits: "Distilled spirits", wine: "Wine", beer: "Beer", tobacco: "Tobacco", firearms: "Firearms and ammunition" };
    var isAlc = catKey === "distilledSpirits" || catKey === "wine" || catKey === "beer";
    var alcoholK = TAX.byCommodity.distilledSpirits[li] + TAX.byCommodity.wine[li] + TAX.byCommodity.beer[li];
    var stages = [{ label: "Everything TTB collects", value: totalK, fill: "#c9a75a", text: "#221708" }];
    if (isAlc) stages.push({ label: "Alcohol", value: alcoholK, fill: "#c2922a", text: "#221708" });
    stages.push({
      label: LBL[catKey], value: TAX.byCommodity[catKey][li],
      fill: COLORS[catKey], text: catKey === "beer" ? "#221708" : "#f6edd6"
    });
    var FOAM = "#fbf4dd";
    function bill(k) { return "$" + (k / 1e6).toFixed(1) + "B"; }
    function pct(k) { var p = k / totalK * 100; return (p < 10 ? p.toFixed(1) : Math.round(p)) + "%"; }
    var W = 680, PAD = 20, bandH = 58, conH = 20, cx = W / 2;
    var w = stages.map(function (s) { return Math.max(12, s.value / totalK * (W - PAD * 2)); });
    var y = 16, parts = [], step = 0;
    stages.forEach(function (s, i) {
      var hw = w[i] / 2;
      var g = '<g class="fn-step" style="transition-delay:' + (step++ * 160) + 'ms">';
      if (i === 0) {
        /* the head: a cap of foam along the top of the pour */
        g += '<rect x="' + (cx - hw) + '" y="' + (y - 6) + '" width="' + w[i] + '" height="10" fill="' + FOAM + '"/>';
        for (var fx = cx - hw + 5; fx <= cx + hw - 5; fx += 11) {
          g += '<circle cx="' + fx + '" cy="' + (y - 4) + '" r="7" fill="' + FOAM + '" stroke="#d8c9a3" stroke-width=".7"/>';
        }
        g += '<rect x="' + (cx - hw) + '" y="' + (y - 5) + '" width="' + w[i] + '" height="9" fill="' + FOAM + '"/>';
      }
      g += '<rect x="' + (cx - hw) + '" y="' + y + '" width="' + w[i] + '" height="' + bandH + '" fill="' + s.fill + '"/>';
      if (w[i] > 90) {
        g += '<circle cx="' + (cx - 0.3 * w[i]) + '" cy="' + (y + 44) + '" r="2.4" fill="' + FOAM + '" opacity=".45"/>' +
          '<circle cx="' + (cx + 0.28 * w[i]) + '" cy="' + (y + 48) + '" r="2.4" fill="' + FOAM + '" opacity=".45"/>';
      }
      var caption = bill(s.value) + (i ? " &middot; " + pct(s.value) + " of the total" : " &middot; FY 2025");
      if (w[i] >= 250) {
        g += '<text x="' + cx + '" y="' + (y + 25) + '" text-anchor="middle" fill="' + s.text + '" class="fn-lab">' + s.label + '</text>' +
          '<text x="' + cx + '" y="' + (y + 45) + '" text-anchor="middle" fill="' + s.text + '" class="fn-num">' + caption + '</text>';
      } else {
        /* narrow pours carry their words beside the stream */
        var tx = cx + hw + 14;
        g += '<text x="' + tx + '" y="' + (y + 25) + '" text-anchor="start" fill="#221708" class="fn-lab">' + s.label + '</text>' +
          '<text x="' + tx + '" y="' + (y + 45) + '" text-anchor="start" fill="#59462f" class="fn-num">' + caption + '</text>';
      }
      g += '</g>';
      parts.push(g);
      y += bandH;
      if (i < stages.length - 1) {
        /* liquid neck: the pour narrows on an S-curve, not a hard bevel */
        var hw2 = w[i + 1] / 2;
        parts.push('<path class="fn-step" style="transition-delay:' + (step++ * 160) + 'ms" d="M' +
          (cx - hw) + ' ' + y +
          ' C' + (cx - hw) + ' ' + (y + conH * 0.55) + ' ' + (cx - hw2) + ' ' + (y + conH * 0.45) + ' ' + (cx - hw2) + ' ' + (y + conH) +
          ' L' + (cx + hw2) + ' ' + (y + conH) +
          ' C' + (cx + hw2) + ' ' + (y + conH * 0.45) + ' ' + (cx + hw) + ' ' + (y + conH * 0.55) + ' ' + (cx + hw) + ' ' + y +
          ' Z" fill="' + stages[i + 1].fill + '" opacity=".35"/>');
        y += conH;
      }
    });
    if (isAlc) {
      /* the spout narrows to a pour stream and lands in the house stein */
      var lastFill = stages[stages.length - 1].fill;
      var hw3 = w[stages.length - 1] / 2;
      parts.push('<path class="fn-step" style="transition-delay:' + (step++ * 160) + 'ms" d="M' +
        (cx - hw3) + ' ' + y +
        ' C' + (cx - hw3) + ' ' + (y + 14) + ' ' + (cx - 7) + ' ' + (y + 10) + ' ' + (cx - 7) + ' ' + (y + 26) +
        ' L' + (cx + 7) + ' ' + (y + 26) +
        ' C' + (cx + 7) + ' ' + (y + 10) + ' ' + (cx + hw3) + ' ' + (y + 14) + ' ' + (cx + hw3) + ' ' + y +
        ' Z" fill="' + lastFill + '" opacity=".35"/>');
      y += 26;
      var ry = y + 24;            /* rim line */
      var by = ry + 40;           /* base line */
      parts.push('<g class="fn-step" style="transition-delay:' + (step++ * 160) + 'ms">' +
        '<rect x="' + (cx - 3.5) + '" y="' + y + '" width="7" height="26" fill="' + lastFill + '"/>' +
        '<path d="M' + (cx - 20) + ' ' + (ry + 7) + ' L' + (cx - 17.6) + ' ' + (by - 2) + ' L' + (cx + 17.6) + ' ' + (by - 2) + ' L' + (cx + 20) + ' ' + (ry + 7) + ' Z" fill="' + lastFill + '"/>' +
        '<circle cx="' + (cx - 13) + '" cy="' + ry + '" r="5" fill="' + FOAM + '"/>' +
        '<circle cx="' + (cx - 4) + '" cy="' + (ry - 2.5) + '" r="5.5" fill="' + FOAM + '"/>' +
        '<circle cx="' + (cx + 5) + '" cy="' + (ry - 1) + '" r="5" fill="' + FOAM + '"/>' +
        '<circle cx="' + (cx + 13) + '" cy="' + (ry + 0.5) + '" r="4.5" fill="' + FOAM + '"/>' +
        '<circle cx="' + (cx - 22.5) + '" cy="' + (ry + 5) + '" r="3.5" fill="' + FOAM + '"/>' +
        '<path d="M' + (cx - 21.5) + ' ' + ry + ' L' + (cx - 18.6) + ' ' + by + ' L' + (cx + 18.6) + ' ' + by + ' L' + (cx + 21.5) + ' ' + ry + '" fill="none" stroke="#221708" stroke-width="1.8"/>' +
        '<path d="M' + (cx - 20.6) + ' ' + (ry + 12) + ' H' + (cx + 20.6) + '" stroke="#221708" stroke-width="1" opacity=".28"/>' +
        '<path d="M' + (cx - 19.2) + ' ' + (by - 9) + ' H' + (cx + 19.2) + '" stroke="#221708" stroke-width="1" opacity=".28"/>' +
        '<path d="M' + (cx + 20.5) + ' ' + (ry + 9) + ' h5.5 a10 10 0 0 1 10 10 v3 a10 10 0 0 1 -10 10 h-6.5" fill="none" stroke="#221708" stroke-width="1.8"/></g>');
      y = by + 8;
    } else {
      y += 14;
    }
    var last = stages[stages.length - 1];
    box.hidden = false;
    box.dataset.cat = catKey;
    box.classList.remove("pour");
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + y + '" role="img" aria-label="Funnel chart. In FY 2025, ' +
      bill(totalK) + ' in total collections narrows to ' + bill(last.value) + ' from ' + last.label.toLowerCase() + '.">' + parts.join("") + '</svg>';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { box.classList.add("pour"); });
    });
  }

  /* the bar menu: five taxes, click one to pour it */
  (function buildTapMenu() {
    var row = document.getElementById("tapRow");
    var panel = document.getElementById("tapDetail");
    if (!row || !panel) return;
    var li = TAX.years.length - 1;
    var ITEMS = [
      { key: "beer", verb: "Pour one", label: "Beer", href: "#alcohol",
        extra: "139.2 million barrels crossed the bar in 2025, the lowest year in the published series.",
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect class="tap-liq" x="7.2" y="5.2" width="6.6" height="13.6" fill="#c2922a" stroke="none"/><path d="M6 4h9v16H6zM15 8h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3"/><path d="M6 8h9" opacity=".5"/></svg>' },
      { key: "wine", verb: "Uncork it", label: "Wine", href: "#alcohol",
        extra: "554 million gallons were withdrawn for the taxed market in 2025.",
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="tap-liq" d="M8.9 6.5 C9.2 9.5 10.2 11.2 12 11.8 C13.8 11.2 14.8 9.5 15.1 6.5 Z" fill="#71303f" stroke="none"/><path d="M8 3h8c0 5-1 8-4 9v6"/><path d="M8 3c0 5 1 8 4 9"/><path d="M8 21h8"/></svg>' },
      { key: "distilledSpirits", verb: "Make it a double", label: "Distilled spirits", href: "#alcohol",
        extra: "The house liquor: the biggest earner in the place every year since FY 2022. The barkeep pours nothing else.",
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="tap-liq" d="M8.6 14.5 h6.8 l1.5 4 a1 1 0 0 1 -1 1.4 H8.1 a1 1 0 0 1 -1 -1.4 Z" fill="#96551b" stroke="none"/><path d="M10 2h4M12 2v6l5 11a1 1 0 0 1-1 1.4H8A1 1 0 0 1 7 19l5-11"/></svg>' },
      { key: "tobacco", verb: "Light one up", label: "Tobacco", href: "#tobacco",
        extra: "134 billion cigarettes were removed for the taxed market in 2025, down by more than half since 2012.",
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"><path class="tap-smoke" d="M20.6 9.5 c-1.2 -1.6 .8 -2.6 -.3 -4.5" stroke="#8a7853" stroke-width="1" fill="none"/><rect x="2" y="10.5" width="5" height="4" fill="#c9964b" stroke="none"/><rect x="7" y="10.5" width="12" height="4" fill="#f3ead2" stroke="#59462f" stroke-width=".9"/><circle class="tap-ember" cx="19.8" cy="12.5" r="1.7" fill="#d96b29" stroke="none"/></svg>' },
      { key: "firearms", verb: "One for the hunters", label: "Firearms and ammunition", href: "#firearms",
        extra: "Every dollar is earmarked for wildlife restoration under the Pittman-Robertson Act of 1937.",
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle class="tap-ping" cx="12" cy="12" r="7.5" stroke="#4c5a60"/><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/></svg>' }
    ];
    function choose(item, btn) {
      row.querySelectorAll(".tap-item").forEach(function (b) {
        b.classList.toggle("on", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      var s = TAX.byCommodity[item.key];
      var pct = (s[li] - s[0]) / s[0] * 100;
      var dir = pct >= 0 ? "up" : "down";
      panel.hidden = false;
      panel.innerHTML = '<p class="td-name">' + item.label + '</p>' +
        '<div class="td-big">$' + (s[li] / 1e6).toFixed(1) + 'B<small>collected in FY 2025</small></div>' +
        '<div class="td-chg ' + dir + '">' + dir + ' ' + Math.abs(pct).toFixed(0) + '% since FY 2015</div>' +
        '<p>' + item.extra + '</p>' +
        '<a href="' + item.href + '">Jump to that reel</a>';
    }
    ITEMS.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tap-item";
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = '<span class="tap-disc">' + item.svg + '</span><span class="tap-verb">' + item.verb + '</span><span class="tap-name">' + item.label + '</span>';
      btn.addEventListener("click", function () { choose(item, btn); });
      row.appendChild(btn);
    });
  })();

  /* tobacco: the tax base as a cigarette that burns down to FY 2025 */
  (function buildBurnDown() {
    var box = document.getElementById("burnDown");
    if (!box) return;
    var li = TAX.years.length - 1;
    var v15 = TAX.byCommodity.tobacco[0], v25 = TAX.byCommodity.tobacco[li];
    var W = 680, H = 158, X0 = 30, FL = 62, y = 66, h = 26;
    var full = 560;                    /* paper length drawn for FY 2015 */
    var keep = full * (v25 / v15);     /* paper left at FY 2025 */
    var burnX = X0 + FL + keep;
    function money(k) { return "$" + (k / 1e6).toFixed(1) + "B"; }
    var ash = "";
    for (var i = 0; i < 26; i++) {
      var fx = burnX + 8 + (full - keep - 16) * (i / 25);
      var fy = y + 4 + ((i * 7) % 19);
      var fr = 1 + ((i * 3) % 4) / 2.5;
      ash += '<circle cx="' + fx.toFixed(1) + '" cy="' + fy + '" r="' + fr + '" fill="' + (i % 3 ? "#9b917f" : "#6f665a") + '"/>';
    }
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="FY 2015 tobacco collections of ' +
      money(v15) + ' drawn as a cigarette. Burning it down leaves ' + money(v25) + ' by FY 2025; the ash is the ' +
      money(v15 - v25) + ' that went missing.">' +
      '<text x="' + X0 + '" y="42" class="bn-lab">FY 2015 &middot; ' + money(v15) + '</text>' +
      '<text x="' + burnX + '" y="' + (y + h + 32) + '" text-anchor="middle" class="bn-lab">FY 2025 &middot; ' + money(v25) + '</text>' +
      '<line x1="' + burnX + '" y1="' + (y - 8) + '" x2="' + burnX + '" y2="' + (y + h + 12) + '" stroke="#a3392a" stroke-width="1.2" stroke-dasharray="4 3"/>' +
      '<g id="bnAsh" opacity="0">' + ash + '</g>' +
      '<rect x="' + X0 + '" y="' + y + '" width="' + FL + '" height="' + h + '" fill="#c9964b"/>' +
      '<path d="M' + (X0 + 9) + ' ' + y + ' v' + h + ' M' + (X0 + 18) + ' ' + y + ' v' + h + '" stroke="#a97a35" stroke-width="1.5"/>' +
      '<rect id="bnPaper" x="' + (X0 + FL) + '" y="' + y + '" width="' + full + '" height="' + h + '" fill="#f6efdc" stroke="#cdbd97" stroke-width="1"/>' +
      '<g id="bnSmoke" class="bn-smoke" opacity="0">' +
      '<path d="M' + burnX + ' ' + (y - 10) + ' c-7 -9 7 -15 0 -24 c-7 -9 7 -15 0 -24"/>' +
      '<path d="M' + (burnX + 13) + ' ' + (y - 6) + ' c-6 -8 6 -13 0 -21 c-6 -8 6 -13 0 -21"/>' +
      '<path d="M' + (burnX - 12) + ' ' + (y - 8) + ' c-5 -7 5 -12 0 -19 c-5 -7 5 -12 0 -19"/>' +
      '<path d="M' + (burnX + 55) + ' ' + (y - 4) + ' c-6 -8 6 -13 0 -21 c-6 -8 6 -13 0 -21"/>' +
      '<path d="M' + (burnX + 110) + ' ' + (y - 7) + ' c-7 -9 7 -15 0 -24 c-7 -9 7 -15 0 -24"/>' +
      '<path d="M' + (burnX + 170) + ' ' + (y - 4) + ' c-5 -7 5 -12 0 -19 c-5 -7 5 -12 0 -19"/>' +
      '<path d="M' + (burnX + 235) + ' ' + (y - 6) + ' c-6 -8 6 -13 0 -21 c-6 -8 6 -13 0 -21"/>' +
      '</g>' +
      '<circle id="bnEmber" cx="' + (X0 + FL + full) + '" cy="' + (y + h / 2) + '" r="0" fill="#d96b29"/>' +
      '<text id="bnGone" x="' + (burnX + (full - keep) / 2) + '" y="42" text-anchor="middle" class="bn-gone" opacity="0">' +
      money(v15 - v25) + ' gone</text>' +
      /* the match: a stick, a head, and a flame that flares in on the strike */
      '<g id="bnMatch" opacity="0">' +
        '<rect x="651" y="99" width="6" height="50" rx="3" fill="#c9a05a"/>' +
        '<ellipse cx="654" cy="99" rx="5.2" ry="7" fill="#6d1005"/>' +
        '<g id="bnFlame">' +
          '<path d="M654 63 C643 81, 646 94, 654 99 C662 94, 665 81, 654 63 Z" fill="#f0902a"/>' +
          '<path d="M654 74 C648 85, 649 94, 654 98 C659 94, 660 85, 654 74 Z" fill="#fce08a"/>' +
        '</g>' +
      '</g></svg>';
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bn-btn";
    btn.textContent = "Strike the match";
    box.appendChild(btn);
    var paper = box.querySelector("#bnPaper"), ember = box.querySelector("#bnEmber"),
        ashG = box.querySelector("#bnAsh"), gone = box.querySelector("#bnGone"),
        smoke = box.querySelector("#bnSmoke");
    var playing = false, burned = false;
    function finish() {
      paper.setAttribute("width", keep);
      ember.setAttribute("cx", burnX); ember.setAttribute("r", "4.5");
      ashG.setAttribute("opacity", ".9");
      gone.setAttribute("opacity", "1");
      smoke.setAttribute("opacity", "1");
      btn.textContent = "Roll a fresh one";
      playing = false; burned = true;
    }
    function reset() {
      paper.setAttribute("width", full);
      ember.setAttribute("r", "0"); ember.setAttribute("cx", X0 + FL + full);
      ashG.setAttribute("opacity", "0");
      gone.setAttribute("opacity", "0");
      smoke.setAttribute("opacity", "0");
      box.classList.remove("striking");
      btn.textContent = "Strike the match";
      burned = false;
    }
    function burn() {
      var t0 = null, dur = 2600;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var e = 1 - Math.pow(1 - p, 2);
        var wNow = full - (full - keep) * e;
        paper.setAttribute("width", wNow);
        ember.setAttribute("cx", X0 + FL + wNow);
        ashG.setAttribute("opacity", String((0.9 * e).toFixed(2)));
        if (p < 1) requestAnimationFrame(step); else finish();
      }
      requestAnimationFrame(step);
    }
    btn.addEventListener("click", function () {
      if (playing) return;
      if (burned) { reset(); return; }
      if (reduced) { finish(); return; }
      playing = true;
      /* strike first: the match flares in, then the ember catches and burns down */
      box.classList.add("striking");
      setTimeout(function () { ember.setAttribute("r", "6"); }, 360);
      setTimeout(burn, 460);
    });
  })();

  /* the regulars, on the map: a tile grid of permit counts by state */
  (function buildPermitMap() {
    var box = document.getElementById("permitMap");
    var tog = document.getElementById("mapToggle");
    if (!box || !tog || typeof PERMITTEES === "undefined") return;
    /* tile-grid positions: [col, row] on a 12 x 8 board */
    var TILES = {
      AK: [0, 0], ME: [11, 0],
      WI: [5, 1], VT: [10, 1], NH: [11, 1],
      WA: [1, 2], ID: [2, 2], MT: [3, 2], ND: [4, 2], MN: [5, 2], IL: [6, 2], MI: [7, 2], NY: [9, 2], MA: [10, 2], RI: [11, 2],
      OR: [1, 3], NV: [2, 3], WY: [3, 3], SD: [4, 3], IA: [5, 3], IN: [6, 3], OH: [7, 3], PA: [8, 3], NJ: [9, 3], CT: [10, 3],
      CA: [1, 4], UT: [2, 4], CO: [3, 4], NE: [4, 4], MO: [5, 4], KY: [6, 4], WV: [7, 4], VA: [8, 4], MD: [9, 4], DE: [10, 4],
      AZ: [2, 5], NM: [3, 5], KS: [4, 5], AR: [5, 5], TN: [6, 5], NC: [7, 5], SC: [8, 5], DC: [9, 5],
      OK: [4, 6], LA: [5, 6], MS: [6, 6], AL: [7, 6], GA: [8, 6],
      HI: [0, 7], TX: [4, 7], FL: [9, 7], PR: [11, 7]
    };
    var VIEWS = [
      { key: "all", btn: "All four", label: "permits of all four types" },
      { key: 0, btn: "Importers", label: "alcohol importer permits" },
      { key: 1, btn: "Wholesalers", label: "alcohol wholesaler permits" },
      { key: 2, btn: "Spirits", label: "spirits producer and bottler permits" },
      { key: 3, btn: "Wine", label: "wine producer and blender permits" }
    ];
    var RAMP = ["#efe4c4", "#dbc188", "#c2922a", "#96551b", "#59462f"];
    var NAMES = {
      AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
      CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia",
      HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
      KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
      MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
      NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
      NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
      OR: "Oregon", PA: "Pennsylvania", PR: "Puerto Rico", RI: "Rhode Island", SC: "South Carolina",
      SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
      WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
    };
    var P = 55, T = 50, PAD = 10;
    function val(st, key) {
      var a = PERMITTEES.states[st];
      if (!a) return 0;
      return key === "all" ? a[0] + a[1] + a[2] + a[3] : a[key];
    }
    var curView = null, curState = null;
    var detail = document.createElement("div");
    detail.className = "tm-detail";
    detail.hidden = true;
    box.parentNode.insertBefore(detail, box.nextSibling);
    function showDetail(st, fill) {
      var a = PERMITTEES.states[st] || [0, 0, 0, 0];
      var total = a[0] + a[1] + a[2] + a[3];
      var big = val(st, curView.key);
      detail.hidden = false;
      detail.innerHTML = '<p class="tmd-name">' + NAMES[st] + '</p>' +
        '<div class="tmd-big" style="color:' + fill + '">' + fmt.format(big) + '<small>' + curView.label + '</small></div>' +
        '<p class="tmd-rows">importers ' + fmt.format(a[0]) + ' &middot; wholesalers ' + fmt.format(a[1]) +
        ' &middot; spirits ' + fmt.format(a[2]) + ' &middot; wine ' + fmt.format(a[3]) +
        ' &middot; all four ' + fmt.format(total) + '</p>';
    }
    function render(view) {
      var states = Object.keys(TILES);
      var vals = states.map(function (s) { return val(s, view.key); }).filter(function (v) { return v > 0; }).sort(function (a, b) { return a - b; });
      var cuts = [0.2, 0.4, 0.6, 0.8].map(function (q) { return vals[Math.min(vals.length - 1, Math.floor(q * vals.length))]; });
      function bucket(v) {
        if (v <= 0) return -1;
        for (var i = 0; i < 4; i++) { if (v <= cuts[i]) return i; }
        return 4;
      }
      curView = view;
      var total = states.reduce(function (t, s) { return t + val(s, view.key); }, 0);
      var W = 12 * P - (P - T) + PAD * 2, Hgt = 8 * P - (P - T) + PAD * 2;
      var parts = [];
      states.forEach(function (st) {
        var v = val(st, view.key), b = bucket(v);
        var x = PAD + TILES[st][0] * P, y = PAD + TILES[st][1] * P;
        var fill = b < 0 ? "#f1ebd8" : RAMP[b];
        var txt = b >= 3 ? "#f6edd6" : "#221708";
        parts.push('<g class="tm-tile" data-st="' + st + '" data-fill="' + (b < 1 ? "#8a7853" : fill) + '" role="button" tabindex="0" aria-label="' + NAMES[st] + ": " + fmt.format(v) + " " + view.label + '"><title>' + NAMES[st] + ": " + fmt.format(v) + " " + view.label + '</title>' +
          '<rect x="' + x + '" y="' + y + '" width="' + T + '" height="' + T + '" fill="' + fill + '" stroke="#cdbd97" stroke-width="' + (b < 0 ? 1 : 0) + '"/>' +
          '<text x="' + (x + T / 2) + '" y="' + (y + 21) + '" text-anchor="middle" class="tm-ab" fill="' + txt + '">' + st + '</text>' +
          '<text x="' + (x + T / 2) + '" y="' + (y + 38) + '" text-anchor="middle" class="tm-n" fill="' + txt + '">' + fmt.format(v) + '</text></g>');
      });
      box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + Hgt + '" role="img" aria-label="Tile map of ' +
        fmt.format(total) + " active " + view.label + ' by state, including DC and Puerto Rico. Select a state for detail.">' + parts.join("") + '</svg>' +
        '<p class="tm-total">' + fmt.format(total) + " active " + view.label + " across 50 states, DC, and Puerto Rico &middot; darker means more &middot; click a state</p>";
      box.querySelectorAll(".tm-tile").forEach(function (tile) {
        function pick() {
          curState = tile.dataset.st;
          showDetail(curState, tile.dataset.fill);
        }
        tile.addEventListener("click", pick);
        tile.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); }
        });
      });
    }
    VIEWS.forEach(function (view, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = view.btn;
      if (i === 0) btn.className = "active";
      btn.addEventListener("click", function () {
        tog.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        render(view);
      });
      tog.appendChild(btn);
    });
    render(VIEWS[0]);
  })();

  /* the take, stacked in gold coins on the bar rail; each coin drops in */
  (function buildCoinStacks() {
    var box = document.getElementById("coinStacks");
    if (!box) return;
    var base = 205, cw = 36, ch = 7, parts = [];
    TAX.years.forEach(function (yr, i) {
      var v = TAX.totalTaxCollections[i] / 1e6;
      var x = 34 + i * 58, n = Math.round(v);
      var g = "<g>";
      for (var k = 0; k < n; k++) {
        var jit = ((i * 13 + k * 7) % 5) - 2;
        g += '<ellipse class="cs-coin" style="transition-delay:' + (i * 85 + k * 38) + 'ms" cx="' + (x + cw / 2 + jit) + '" cy="' + (base - k * ch) + '" rx="' + (cw / 2) + '" ry="4.2" fill="#c9a227" stroke="#7a5410" stroke-width="1"/>';
      }
      /* only the bookends carry a dollar label; the ledger has the rest.
         the FY 2025 label sits higher to clear the red arrow's landing */
      if (i === 0 || i === TAX.years.length - 1) {
        var labDy = i === TAX.years.length - 1 ? 34 : 12;
        g += '<text class="fn-step sv-sub" style="transition-delay:' + (i * 85 + n * 38) + 'ms" x="' + (x + cw / 2) + '" y="' + (base - n * ch - labDy) + '" text-anchor="middle">$' + v.toFixed(1) + 'B</text>';
      }
      g += '<text x="' + (x + cw / 2) + '" y="' + (base + 24) + '" text-anchor="middle" class="sv-y">FY' + String(yr).slice(2) + '</text></g>';
      parts.push(g);
    });
    parts.push('<rect x="14" y="' + (base + 5) + '" width="652" height="5" fill="#59462f"/>');
    /* the fall, drawn in red: an arrow sweeps down off the tall FY 2015 stack
       and lands on the short FY 2025 one, answering the section's question */
    var dropPct = Math.round((TAX.totalTaxCollections[0] - TAX.totalTaxCollections[TAX.years.length - 1]) / TAX.totalTaxCollections[0] * 100);
    var RED = "#a3271c";
    parts.push(
      '<path class="cs-arrow-line" pathLength="1" d="M72 -20 C 268 -46, 462 -22, 604 34" fill="none" stroke="' + RED + '" stroke-width="7.5" stroke-linecap="round"/>' +
      '<path class="cs-arrow-head" d="M632 58 L612 47 L630 31 Z" fill="' + RED + '"/>' +
      '<g class="cs-why" role="button" tabindex="0" aria-label="Why did collections fall ' + dropPct + ' percent">' +
        '<rect class="cs-why-hit" x="222" y="-30" width="168" height="34" rx="4" fill="transparent" pointer-events="all"/>' +
        '<text class="cs-arrow-tag" x="298" y="-8" text-anchor="middle" transform="rotate(-4 298 -8)">down ' + dropPct + '%<tspan class="cs-why-hint" dx="9">why?</tspan></text>' +
      '</g>'
    );
    box.innerHTML = '<svg viewBox="0 -48 680 288" role="img" aria-label="Total collections per fiscal year as coin stacks, falling from $25.5 billion in FY 2015 to $20.6 billion in FY 2025. A red arrow marks the drop; select it for why collections fell.\">' + parts.join("") + '</svg>';
    /* the red arrow answers the section's question: select it for why the take fell */
    var whyEl = box.querySelector(".cs-why");
    if (whyEl) {
      whyEl.addEventListener("click", function (e) { e.stopPropagation(); openWhy(); });
      whyEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); openWhy(); }
      });
    }
  })();

  /* two doors into the treasury: domestic vs the border */
  (function buildTwoDoors() {
    var box = document.getElementById("twoDoors");
    if (!box) return;
    var li = TAX.years.length - 1;
    function bill(k) { return "$" + (k / 1e6).toFixed(1) + "B"; }
    var t0 = TAX.totalTaxCollections[0], tN = TAX.totalTaxCollections[li];
    var i0 = TAX.importsCBP[0], iN = TAX.importsCBP[li];
    var domPct = [Math.round((t0 - i0) / t0 * 100), Math.round((tN - iN) / tN * 100)];
    var impPct = [Math.round(i0 / t0 * 100), Math.round(iN / tN * 100)];
    /* the saloon door, drawn for real */
    var saloon = '<g class="td-door" data-side="dom" role="button" tabindex="0" aria-label="The front door: domestic collections by TTB. Select for the year-by-year graph.">' +
      '<rect x="115" y="16" width="150" height="30" rx="3" fill="#7a5410"/>' +
      '<text x="190" y="36" text-anchor="middle" class="dr-sign" fill="#f6edd6">THE FRONT DOOR</text>' +
      '<rect x="123" y="54" width="10" height="164" fill="#59462f"/>' +
      '<rect x="247" y="54" width="10" height="164" fill="#59462f"/>' +
      '<rect x="123" y="48" width="134" height="8" fill="#59462f"/>' +
      '<path d="M137 96 Q137 88 145 88 H186 V176 H137 Z" fill="#96551b"/>' +
      '<path d="M243 96 Q243 88 235 88 H194 V176 H243 Z" fill="#96551b"/>';
    [147, 157, 167, 177].forEach(function (sx) {
      saloon += '<path d="M' + sx + ' 92 V172" stroke="#7a5410" stroke-width="1.6" opacity=".6"/>' +
        '<path d="M' + (380 - sx) + ' 92 V172" stroke="#7a5410" stroke-width="1.6" opacity=".6"/>';
    });
    saloon += '<rect x="133" y="100" width="6" height="12" fill="#3f2f16"/><rect x="133" y="148" width="6" height="12" fill="#3f2f16"/>' +
      '<rect x="241" y="100" width="6" height="12" fill="#3f2f16"/><rect x="241" y="148" width="6" height="12" fill="#3f2f16"/>' +
      '<text x="190" y="240" text-anchor="middle" class="sv-lab">domestic &middot; collected by TTB</text>' +
      '<text x="190" y="258" text-anchor="middle" class="sv-sub">' + domPct[0] + '% of FY 2015 collections &middot; ' + domPct[1] + '% of FY 2025</text></g>';
    /* the border gate, striped arm down */
    var gate = '<g class="td-door" data-side="imp" role="button" tabindex="0" aria-label="The border gate: import taxes collected by CBP. Select for the year-by-year graph.">' +
      '<rect x="415" y="16" width="150" height="30" rx="3" fill="#59462f"/>' +
      '<text x="490" y="36" text-anchor="middle" class="dr-sign" fill="#f6edd6">THE BORDER GATE</text>' +
      '<rect x="410" y="96" width="16" height="122" fill="#59462f"/>' +
      '<rect x="406" y="88" width="24" height="10" rx="2" fill="#3f2f16"/>' +
      '<rect x="566" y="150" width="10" height="68" fill="#59462f"/>' +
      '<rect x="420" y="118" width="152" height="16" rx="8" fill="#ece0c4" stroke="#59462f" stroke-width="1.6"/>';
    for (var k = 0; k < 4; k++) {
      var sx2 = 434 + k * 36;
      gate += '<path d="M' + sx2 + ' 119 h16 l-9 14 h-16 z" fill="#a3392a"/>';
    }
    gate += '<circle cx="426" cy="126" r="4" fill="#3f2f16"/>' +
      '<text x="490" y="240" text-anchor="middle" class="sv-lab">imports &middot; collected by CBP</text>' +
      '<text x="490" y="258" text-anchor="middle" class="sv-sub">' + impPct[0] + '% of FY 2015 collections &middot; ' + impPct[1] + '% of FY 2025</text></g>';
    box.innerHTML = '<svg viewBox="0 0 680 268" role="img" aria-label="Two doors: TTB\'s front door took in ' + domPct[0] +
      ' percent of FY 2015 collections and ' + domPct[1] + ' percent of FY 2025; the border gate grew from ' + impPct[0] +
      ' percent to ' + impPct[1] + ' percent. Select a door for the year-by-year graph.">' + saloon + gate + '</svg>' +
      '<p class="tm-total">click a door to see its take, year by year &middot; or open both</p>';
    var graph = document.createElement("div");
    graph.className = "doors-graph";
    graph.hidden = true;
    graph.innerHTML = '<p class="dg-note" id="dgNote"></p><div class="chart-box"><canvas id="chartDoors"></canvas></div>';
    box.parentNode.insertBefore(graph, box.nextSibling);
    var doorsChart = null;
    var openSides = { dom: false, imp: false };
    function openGraph(side) {
      openSides[side] = !openSides[side];
      box.querySelectorAll(".td-door").forEach(function (d) {
        d.classList.toggle("open", !!openSides[d.dataset.side]);
      });
      if (!openSides.dom && !openSides.imp) { graph.hidden = true; return; }
      graph.hidden = false;
      if (!doorsChart) {
        doorsChart = new Chart(document.getElementById("chartDoors"), {
          type: "line",
          data: {
            labels: TAX.years.map(function (y) { return "FY" + String(y).slice(2); }),
            datasets: [
              lineDS("Domestic, collected by TTB", TAX.totalTTBCollections.map(function (v) { return v / 1e6; }), "#96551b",
                { borderWidth: 3, hidden: !openSides.dom }),
              lineDS("Imports, collected by CBP", TAX.importsCBP.map(function (v) { return v / 1e6; }), "#a3392a",
                { borderWidth: 3, hidden: !openSides.imp })
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: false, animation: climb(11),
            interaction: { mode: "index", intersect: false },
            plugins: { legend: { position: "bottom" } },
            scales: (function () {
              var s = baseScales("Billions of dollars", function (v) { return "$" + v + "B"; });
              s.y.beginAtZero = true;
              return s;
            })()
          }
        });
      } else {
        doorsChart.setDatasetVisibility(0, openSides.dom);
        doorsChart.setDatasetVisibility(1, openSides.imp);
        doorsChart.update();
      }
      document.getElementById("dgNote").textContent =
        openSides.dom && openSides.imp ? "Both doors open: domestic and imports, side by side." :
        openSides.dom ? "The front door: what TTB collects domestically, year by year." :
        "The border gate: import taxes collected by CBP, year by year.";
    }
    box.querySelectorAll(".td-door").forEach(function (d) {
      d.addEventListener("click", function () { openGraph(d.dataset.side); });
      d.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGraph(d.dataset.side); }
      });
    });
  })();

  /* the changing of the guard: one scale, click a year to weigh it */
  (function buildTipScale() {
    var box = document.getElementById("tipScale");
    if (!box) return;
    var picks = [0, 6, TAX.years.length - 1];
    function alcK(i) { return TAX.byCommodity.distilledSpirits[i] + TAX.byCommodity.wine[i] + TAX.byCommodity.beer[i]; }
    var cx = 340, py = 92;
    var g = '<path d="M' + (cx - 54) + ' 218 L' + (cx + 54) + ' 218 L' + (cx + 36) + ' 200 L' + (cx - 36) + ' 200 Z" fill="#59462f"/>' +
      '<rect x="' + (cx - 5) + '" y="' + py + '" width="10" height="112" fill="#59462f"/>' +
      '<g class="sc-beam" id="tsBeam" style="transform-origin:' + cx + 'px ' + py + 'px; transform:rotate(0deg)">' +
      '<rect x="' + (cx - 118) + '" y="' + (py - 5) + '" width="236" height="10" rx="5" fill="#7a5410"/>';
    [-106, 106].forEach(function (dx, side) {
      var ex = cx + dx;
      g += '<path d="M' + ex + ' ' + (py + 3) + ' L' + (ex - 23) + ' ' + (py + 46) + ' M' + ex + ' ' + (py + 3) + ' L' + (ex + 23) + ' ' + (py + 46) + '" stroke="#59462f" stroke-width="2"/>' +
        '<path d="M' + (ex - 31) + ' ' + (py + 46) + ' A31 31 0 0 0 ' + (ex + 31) + ' ' + (py + 46) + ' Z" fill="#8a7853"/>';
      if (side === 0) {
        g += '<rect x="' + (ex - 21) + '" y="' + (py + 30) + '" width="19" height="16" fill="#59462f"/>' +
          '<rect x="' + (ex + 1) + '" y="' + (py + 26) + '" width="19" height="20" fill="#6d5638"/>';
      } else {
        g += '<rect x="' + (ex - 18) + '" y="' + (py + 18) + '" width="11" height="28" fill="#c2922a"/><rect x="' + (ex - 15) + '" y="' + (py + 10) + '" width="5" height="9" fill="#c2922a"/>' +
          '<rect x="' + (ex + 5) + '" y="' + (py + 22) + '" width="11" height="24" fill="#96551b"/><rect x="' + (ex + 8) + '" y="' + (py + 14) + '" width="5" height="9" fill="#96551b"/>';
      }
    });
    /* the pan labels sit still under the scale instead of tilting with the beam */
    g += '</g><circle cx="' + cx + '" cy="' + py + '" r="6" fill="#7a5410"/>' +
      '<text x="' + (cx - 106) + '" y="' + (py + 94) + '" text-anchor="middle" class="sv-lab">tobacco</text>' +
      '<text x="' + (cx + 106) + '" y="' + (py + 94) + '" text-anchor="middle" class="sv-lab">alcohol</text>' +
      '<text id="tsVals" x="' + cx + '" y="244" text-anchor="middle" class="sv-lab"></text>';
    box.innerHTML = '<svg viewBox="0 0 680 258" role="img" aria-label="A balance scale weighing tobacco against alcohol collections. Pick a fiscal year: tobacco wins FY 2015, FY 2021 is nearly level, alcohol wins FY 2025.">' + g + '</svg>';
    var tog = document.createElement("div");
    tog.className = "fig-toggle";
    tog.setAttribute("role", "group");
    tog.setAttribute("aria-label", "Pick a fiscal year to weigh");
    box.insertBefore(tog, box.firstChild);
    var beam = box.querySelector("#tsBeam"), vals = box.querySelector("#tsVals");
    function weigh(i) {
      var t = TAX.byCommodity.tobacco[i] / 1e6, a = alcK(i) / 1e6;
      var r = Math.max(-13, Math.min(13, (a - t) * 3));
      beam.style.transform = "rotate(" + r.toFixed(1) + "deg)";
      vals.textContent = "FY " + TAX.years[i] + " · tobacco $" + t.toFixed(1) + "B · alcohol $" + a.toFixed(1) + "B · " +
        (t > a ? "tobacco holds the floor" : "alcohol takes it");
    }
    picks.forEach(function (i, k) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "FY " + TAX.years[i];
      if (k === 0) btn.className = "active";
      btn.addEventListener("click", function () {
        tog.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        weigh(i);
      });
      tog.appendChild(btn);
    });
    weigh(picks[0]);
  })();

  /* the copper still and its two pipes */
  (function buildCopperStill() {
    var box = document.getElementById("copperStill");
    if (!box) return;
    var yi = SPIRITS.years.indexOf(2024);
    var prodB = SPIRITS.productionTotalProofGallons[yi] / 1e9;
    var wdM = SPIRITS.taxableWithdrawalsProofGallons[yi] / 1e6;
    var sharePct = SPIRITS.taxableWithdrawalsProofGallons[yi] / SPIRITS.productionTotalProofGallons[yi] * 100;
    var svg = '<svg viewBox="0 0 680 305" role="img" aria-label="A still distills ' + prodB.toFixed(1) +
      ' billion proof gallons in 2024. Over 98 percent flows to fuel and industrial use; ' + Math.round(wdM) +
      ' million proof gallons reach the taxed market.">' +
      /* the kettle */
      '<g class="fn-step"><path d="M85 255 L85 210 Q85 150 155 145 Q225 150 225 210 L225 255 Z" fill="#96551b" stroke="#7a5410" stroke-width="2"/>' +
      '<path d="M95 205 H215" stroke="#7a5410" stroke-width="1.4" opacity=".5"/>' +
      '<rect x="78" y="255" width="154" height="8" fill="#59462f"/>' +
      '<text x="155" y="283" text-anchor="middle" class="sv-lab">' + prodB.toFixed(1) + 'B proof gallons distilled &middot; 2024</text>' +
      '<path d="M155 145 C155 105 185 95 238 95" fill="none" stroke="#96551b" stroke-width="10"/></g>' +
      /* the big pipe to industry */
      '<g class="fn-step" style="transition-delay:170ms">' +
      '<rect x="238" y="78" width="270" height="34" fill="#4c5a60"/>' +
      '<text x="373" y="68" text-anchor="middle" class="sv-sub">the big pipe</text>' +
      '<rect x="508" y="56" width="145" height="82" rx="7" fill="#4c5a60"/>' +
      '<text x="580" y="90" text-anchor="middle" class="sv-tank">FUEL &amp; INDUSTRIAL</text>' +
      '<text x="580" y="112" text-anchor="middle" class="sv-tank">' + (100 - sharePct).toFixed(1) + '% of it</text></g>' +
      /* the thin coil to the glass */
      '<g class="fn-step" style="transition-delay:340ms">' +
      '<path d="M248 112 V148" fill="none" stroke="#96551b" stroke-width="3"/>' +
      '<circle cx="248" cy="160" r="9" fill="none" stroke="#96551b" stroke-width="3"/>' +
      '<circle cx="248" cy="178" r="9" fill="none" stroke="#96551b" stroke-width="3"/>' +
      '<circle cx="248" cy="196" r="9" fill="none" stroke="#96551b" stroke-width="3"/>' +
      '<path d="M248 205 V226" fill="none" stroke="#96551b" stroke-width="3"/>' +
      '<circle cx="248" cy="230" r="2.6" fill="#c2922a"/>' +
      '<rect x="236" y="234" width="24" height="26" fill="none" stroke="#221708" stroke-width="1.8"/>' +
      '<rect x="239" y="248" width="18" height="9" fill="#c2922a"/>' +
      '<text x="292" y="243" class="sv-lab">the taxed market</text>' +
      '<text x="292" y="259" class="sv-sub">' + Math.round(wdM) + 'M proof gallons withdrawn tax-paid</text>' +
      '<text x="292" y="274" class="sv-sub">' + sharePct.toFixed(1) + '% of everything the stills made</text></g></svg>';
    box.innerHTML = svg;
  })();

  /* the one-minute briefing: a five-stop tour for interviewers in a hurry */
  (function shortPour() {
    var btn = document.getElementById("shortPour");
    if (!btn) return;
    var stops = [
      { id: "coinStacks", text: "Collections fell 19 percent in a decade, from $25.5 billion to $20.6 billion. Tobacco did the falling." },
      { id: "burnDown", text: "Tobacco's decline is volume, not rates: the rate has sat at $1.01 a pack since 2009 while the tax base burns down." },
      { id: "waffleShare", text: "The tax base shifted: more than half of today's tax dollar is alcohol, and a third is distilled spirits alone." },
      { id: "permitMap", text: "Meanwhile the regulated industry keeps growing: 83,773 active permits across 50 states, DC, and Puerto Rico." },
      { id: "tab", text: "That is the briefing. Every figure here traces to a named TTB release, every disagreement between totals is explained in place, and every redaction shows as a gap, never a guess. That is how I work with federal data. The receipt has the sources, and the barkeep has my email." }
    ];
    var card = null, at = -1;
    function ensureCard() {
      if (card) return;
      card = document.createElement("div");
      card.id = "pourCard";
      card.innerHTML = '<div class="pc-glass" aria-hidden="true"><svg viewBox="0 0 26 32">' +
        '<rect class="pg-liq" x="4.5" y="6" width="15" height="22" fill="#c2922a" style="transform:scaleY(0)"/>' +
        '<path d="M3 3 h20 l-2.5 26 h-15 z" fill="none" stroke="#d4a017" stroke-width="1.8"/></svg></div>' +
        '<p id="pourText"></p><div class="pc-row"><span id="pourStep"></span>' +
        '<button id="pourNext" type="button">Next</button><button id="pourEnd" type="button">End tour</button></div>';
      document.body.appendChild(card);
      card.querySelector("#pourNext").addEventListener("click", function () { go(at + 1); });
      card.querySelector("#pourEnd").addEventListener("click", end);
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") end(); });
      /* wandering off by any in-page link ends the tour instead of leaving the card behind */
      document.addEventListener("click", function (e) {
        if (at < 0) return;
        var a = e.target.closest('a[href^="#"]');
        if (a && !e.target.closest("#pourCard")) end();
      });
    }
    function clearGlow() {
      document.querySelectorAll(".tour-glow").forEach(function (el) { el.classList.remove("tour-glow"); });
    }
    function end() {
      clearGlow();
      if (card) card.classList.remove("open");
      at = -1;
      document.body.classList.remove("touring");
    }
    function go(n) {
      if (n >= stops.length) { end(); return; }
      at = n;
      ensureCard();
      document.body.classList.add("touring");
      var s = stops[n];
      var el = document.getElementById(s.id);
      var fig = s.id === "tab" ? document.querySelector("#tab .receipt") : (el.closest(".figure") || el);
      clearGlow();
      fig.classList.add("tour-glow");
      fig.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      if (s.id === "burnDown") {
        var b = el.querySelector(".bn-btn");
        if (b && b.textContent.indexOf("match") >= 0) setTimeout(function () { b.click(); }, 700);
      }
      if (s.id === "waffleShare") pourFunnel("distilledSpirits", true);
      card.querySelector("#pourText").textContent = s.text;
      card.querySelector("#pourStep").textContent = (n + 1) + " of " + stops.length;
      card.querySelector("#pourNext").textContent = n === stops.length - 1 ? "Finish" : "Next";
      card.querySelector(".pg-liq").style.transform = "scaleY(" + ((n + 1) / stops.length) + ")";
      card.classList.add("open");
    }
    btn.addEventListener("click", function () { go(0); });
  })();

  function mugSVG(frac) {
    /* a mug that is frac full (0..1). Liquid starts at height 0; animatePictos fills it. */
    var innerTop = 7, innerBot = 27, h = Math.round((innerBot - innerTop) * frac);
    return '<svg width="36" height="36" viewBox="0 0 34 34" aria-hidden="true">' +
      '<rect class="liq" x="8.5" y="' + innerBot + '" width="12" height="0" data-h="' + h + '" data-y="' + (innerBot - h) + '" fill="' + V.beer + '"/>' +
      '<path d="M7 5h15v24H7z" fill="none" stroke="' + V.ink + '" stroke-width="1.7"/>' +
      '<path d="M22 11h4a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-4" fill="none" stroke="' + V.ink + '" stroke-width="1.7"/>' +
      '</svg>';
  }

  function cigSVG(frac) {
    /* a cigarette that is frac long (0..1), butt on the left */
    var maxLen = 44, len = Math.max(3, Math.round(maxLen * frac));
    return '<svg width="' + (len + 10) + '" height="14" viewBox="0 0 ' + (len + 10) + ' 14" aria-hidden="true">' +
      '<rect x="1" y="3" width="9" height="8" fill="' + V.spirits + '"/>' +
      '<rect x="10" y="3" width="' + len + '" height="8" fill="#f6edd6" stroke="' + V.ink + '" stroke-width="1.2"/>' +
      '</svg>';
  }

  (function buildPictos() {
    var mugRows = [
      { year: "2015", barrels: 177164772 },
      { year: "2025", barrels: 139219800 }
    ];
    var mugBox = document.getElementById("beerMugs");
    mugRows.forEach(function (r) {
      var mugs = r.barrels / 20e6;
      var row = document.createElement("div");
      row.className = "picto-row";
      var html = '<span class="py">' + r.year + '</span><span class="icons">';
      for (var i = 0; i < Math.floor(mugs); i++) html += mugSVG(1);
      if (mugs % 1 > 0.08) html += mugSVG(mugs % 1);
      html += '</span><span class="pv">' + (r.barrels / 1e6).toFixed(1) + "M barrels</span>";
      row.innerHTML = html;
      mugBox.appendChild(row);
    });

    var cigRowsData = [
      { year: "2012", sticks: 280160143382 },
      { year: "2025", sticks: 134231886768 }
    ];
    var cigBox = document.getElementById("cigRows");
    cigRowsData.forEach(function (r) {
      var cigs = r.sticks / 20e9;
      var row = document.createElement("div");
      row.className = "picto-row";
      var html = '<span class="py">' + r.year + '</span><span class="icons">';
      for (var i = 0; i < Math.floor(cigs); i++) html += cigSVG(1);
      if (cigs % 1 > 0.08) html += cigSVG(cigs % 1);
      html += '</span><span class="pv">' + (r.sticks / 1e9).toFixed(1) + "B sticks</span>";
      row.innerHTML = html;
      cigBox.appendChild(row);
    });
  })();

  function bottleSVG(frac) {
    /* a wine bottle frac full; liquid fills on reveal like the mugs */
    var top = 13, bot = 36, h = Math.round((bot - top) * frac);
    return '<svg width="22" height="42" viewBox="0 0 20 40" aria-hidden="true">' +
      '<rect class="liq" x="6" y="' + bot + '" width="8" height="0" data-h="' + h + '" data-y="' + (bot - h) + '" fill="' + V.wine + '"/>' +
      '<path d="M8.5 2.5h3v7c0 1.5 3 2 3 4.5v22a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 5.5 36V14c0-2.5 3-3 3-4.5z" fill="none" stroke="' + V.ink + '" stroke-width="1.4"/>' +
      '<path d="M8.5 4.6h3" stroke="' + V.ink + '" stroke-width="1"/>' +
      '</svg>';
  }

  function barrelSVG(frac) {
    var top = 8, bot = 30, h = Math.round((bot - top) * frac);
    return '<svg width="38" height="38" viewBox="0 0 36 36" aria-hidden="true">' +
      '<rect class="liq" x="9" y="' + bot + '" width="18" height="0" data-h="' + h + '" data-y="' + (bot - h) + '" fill="' + V.spirits + '"/>' +
      '<rect x="7" y="6" width="22" height="26" rx="7" fill="none" stroke="' + V.ink + '" stroke-width="1.6"/>' +
      '<path d="M7.5 13h21M7.5 25h21" stroke="' + V.ink + '" stroke-width="1.2"/>' +
      '</svg>';
  }

  function cartridgeSVG(frac) {
    /* a cartridge frac long, casing first then the nose */
    var maxLen = 40, len = Math.max(4, Math.round(maxLen * frac));
    var caseLen = Math.min(len, 27);
    var svg = '<svg width="' + (len + 4) + '" height="15" viewBox="0 0 ' + (len + 4) + ' 15" aria-hidden="true">' +
      '<rect x="1.5" y="3" width="' + caseLen + '" height="9" fill="' + V.beer + '" stroke="' + V.ink + '" stroke-width="1.1"/>' +
      '<rect x="1.5" y="3" width="2.5" height="9" fill="' + V.ink + '"/>';
    if (len > 27) {
      var tip = len - 27;
      svg += '<path d="M' + (caseLen + 1.5) + ' 3.6 q' + tip + ' 3.9 0 7.8 z" fill="' + V.firearms + '" stroke="' + V.ink + '" stroke-width="1"/>';
    }
    return svg + '</svg>';
  }

  (function buildMorePictos() {
    var wineRows = [
      { year: "2015", gal: 701484678 },
      { year: "2025", gal: 554428785 }
    ];
    var box = document.getElementById("wineBottles");
    wineRows.forEach(function (r) {
      var n = r.gal / 100e6;
      var row = document.createElement("div");
      row.className = "picto-row";
      var html = '<span class="py">' + r.year + '</span><span class="icons">';
      for (var i = 0; i < Math.floor(n); i++) html += bottleSVG(1);
      if (n % 1 > 0.08) html += bottleSVG(n % 1);
      html += '</span><span class="pv">' + (r.gal / 1e6).toFixed(1) + "M gallons</span>";
      row.innerHTML = html;
      box.appendChild(row);
    });

    var spiritRows = [
      { year: "2015", pg: 323581763 },
      { year: "2024", pg: 375057071 }
    ];
    box = document.getElementById("spiritBarrels");
    spiritRows.forEach(function (r) {
      var n = r.pg / 50e6;
      var row = document.createElement("div");
      row.className = "picto-row";
      var html = '<span class="py">' + r.year + '</span><span class="icons">';
      for (var i = 0; i < Math.floor(n); i++) html += barrelSVG(1);
      if (n % 1 > 0.08) html += barrelSVG(n % 1);
      html += '</span><span class="pv">' + (r.pg / 1e6).toFixed(1) + "M proof gallons</span>";
      row.innerHTML = html;
      box.appendChild(row);
    });

    var faetRows = [
      { year: "FY15", k: 638518 },
      { year: "FY22", k: 1150842 },
      { year: "FY25", k: 807506 }
    ];
    box = document.getElementById("faetCartridges");
    faetRows.forEach(function (r) {
      var n = r.k / 100000; /* $100M per cartridge, values in thousands */
      var row = document.createElement("div");
      row.className = "picto-row";
      var html = '<span class="py">' + r.year + '</span><span class="icons">';
      for (var i = 0; i < Math.floor(n); i++) html += cartridgeSVG(1);
      if (n % 1 > 0.08) html += cartridgeSVG(n % 1);
      var txt = r.k >= 1e6 ? "$" + (r.k / 1e6).toFixed(2) + "B" : "$" + Math.round(r.k / 1000) + "M";
      html += '</span><span class="pv">' + txt + "</span>";
      row.innerHTML = html;
      box.appendChild(row);
    });
  })();

  /* one pictogram, five taxed goods: the toggle swaps the unit story */
  (function unitPictos() {
    var fig = document.getElementById("unitFigure");
    if (!fig) return;
    var tog = document.getElementById("pictoToggle");
    var title = document.getElementById("puTitle");
    var keyEl = document.getElementById("puKey");
    var srcEl = document.getElementById("puSource");
    var PU = [
      { id: "beerMugs", btn: "Beer", title: "Taxable beer, poured out in mugs",
        key: "Each mug is 20 million barrels of taxable removals. A barrel is 31 gallons.",
        source: "<b>Source:</b> TTB National Statistical Report, Beer (TTB S 5130), yearly data, calendar years 2015 and 2025." },
      { id: "wineBottles", btn: "Wine", title: "Taxable wine, by the bottle",
        key: "Each bottle is 100 million wine gallons of taxable withdrawals.",
        source: "<b>Source:</b> TTB National Statistical Report, Wine (TTB S 5120), yearly data, calendar years 2015 and 2025." },
      { id: "spiritBarrels", btn: "Spirits", title: "Spirits, by the barrel",
        key: "Each barrel is 50 million proof gallons of taxable withdrawals. TTB redacts the 2025 national total, so the newer row is 2024.",
        source: "<b>Source:</b> TTB National Statistical Report, Distilled Spirits (TTB S 5110), yearly data, calendar years 2015 and 2024." },
      { id: "cigRows", btn: "Tobacco", title: "Cigarettes removed for the taxed market, 2012 versus 2025",
        key: "Each cigarette is 20 billion sticks. Removals include those from Puerto Rico.",
        source: "<b>Source:</b> TTB National Statistical Report, Tobacco, yearly data, taxable removals, calendar years 2012 and 2025." },
      { id: "faetCartridges", btn: "Firearms", title: "The take, in cartridges",
        key: "Each cartridge is $100 million of firearms and ammunition excise tax collections.",
        source: "<b>Source:</b> TTB Statistical Release TTB S 5630, Tax Collections, final annual cumulative summaries, FY 2015, FY 2022, and FY 2025." }
    ];
    var current = PU[0];
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "ledger-link";
    chip.textContent = "Here's the ledger (source)";
    chip.addEventListener("click", function () {
      var data = MANUAL_LEDGERS[current.id];
      if (data) showLedger(data, current.title, current.source, null, null, current.id);
    });
    srcEl.appendChild(chip);
    function pick(p, btn) {
      current = p;
      tog.querySelectorAll("button").forEach(function (b) { b.classList.toggle("active", b === btn); });
      PU.forEach(function (q) {
        var el = document.getElementById(q.id);
        if (el) el.hidden = q.id !== p.id;
      });
      title.textContent = p.title;
      keyEl.textContent = p.key;
      animatePictos(fig);
    }
    PU.forEach(function (p, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = p.btn;
      if (i === 0) btn.className = "active";
      btn.addEventListener("click", function () { pick(p, btn); });
      tog.appendChild(btn);
    });
  })();

  function animatePictos(scope) {
    requestAnimationFrame(function () {
      scope.querySelectorAll(".liq").forEach(function (rect) {
        rect.setAttribute("height", rect.dataset.h);
        rect.setAttribute("y", rect.dataset.y);
      });
    });
  }

  /* ============================================================
     Charts (created lazily as their figure scrolls into view)
     ============================================================ */
  Chart.defaults.font.family = '"Special Elite","Courier New",monospace';
  Chart.defaults.font.size = 11;
  Chart.defaults.color = V.tick;
  Chart.defaults.plugins.legend.labels.boxWidth = 11;
  Chart.defaults.plugins.legend.labels.boxHeight = 11;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.pointStyle = "rect";
  Chart.defaults.plugins.tooltip.backgroundColor = "#151009";
  Chart.defaults.plugins.tooltip.borderColor = V.gold;
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 0;
  Chart.defaults.animation.duration = 0;
  /* hover markers glide to the next point instead of jumping */
  Chart.defaults.transitions.active = { animation: { duration: 150, easing: "easeOutQuad" } };
  Chart.defaults.plugins.tooltip.animation = { duration: 160, easing: "easeOutQuad" };

  /* the ink pulls across the chart in one smooth stroke when it first
     draws (and again when a toggle redraws it) */
  function sweepEase(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  var sweep = {
    id: "sweep",
    afterUpdate: function (chart, args) {
      if (reduced) return;
      var mode = args && args.mode;
      if (mode === "resize" || mode === "reset" || mode === "none" || mode === "active") return;
      var n = 0;
      chart.data.datasets.forEach(function (d) { n = Math.max(n, (d.data || []).length); });
      chart.$sweep = { t0: null, p: 0, raf: 0, dur: Math.min(1800, 800 + n * 22) };
    },
    beforeDatasetsDraw: function (chart) {
      var s = chart.$sweep;
      if (!s) return;
      var now = performance.now();
      if (s.t0 === null) s.t0 = now;
      s.p = Math.min(1, (now - s.t0) / s.dur);
      var a = chart.chartArea, ctx = chart.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.rect(a.left - 14, 0, (a.right - a.left + 28) * sweepEase(s.p), chart.height);
      ctx.clip();
    },
    afterDatasetsDraw: function (chart) {
      var s = chart.$sweep;
      if (!s) return;
      chart.ctx.restore();
      if (s.p >= 1) { chart.$sweep = null; return; }
      if (!s.raf) {
        s.raf = requestAnimationFrame(function () {
          if (chart.$sweep) { chart.$sweep.raf = 0; chart.draw(); }
        });
      }
    }
  };
  Chart.register(sweep);

  /* click a dot: the ledger opens with that year's row circled */
  var FIG_LEDGERS = {};
  Chart.defaults.onHover = function (evt, els) {
    if (evt.native && evt.native.target) evt.native.target.style.cursor = els.length ? "pointer" : "";
  };
  Chart.defaults.onClick = function (evt, els, chart) {
    var ex = evt.x != null ? evt.x : evt.offsetX, ey = evt.y != null ? evt.y : evt.offsetY;
    /* milestone diamonds on the rates chart outrank the ledger */
    if (chart.$miles) {
      var hit = null, best = 18;
      chart.$miles.forEach(function (mm) {
        var d = Math.sqrt((ex - mm.x) * (ex - mm.x) + (ey - mm.y) * (ey - mm.y));
        if (d < best) { best = d; hit = mm; }
      });
      if (hit) { openStory(hit.m); return; }
    }
    /* anywhere inside the shaded dry years opens the Prohibition card */
    if (chart.$dryRect) {
      var dr = chart.$dryRect;
      if (ex >= dr.x1 && ex <= dr.x2 && ey >= dr.top && ey <= dr.bottom) {
        var pm = null;
        MILESTONES.forEach(function (m) { if (m.y === 1920) pm = m; });
        if (pm) { openStory(pm); return; }
      }
    }
    var hits = els && els.length ? els
      : chart.getElementsAtEventForMode(evt, "nearest", { intersect: false }, true);
    if (!hits || !hits.length) return;
    var info = FIG_LEDGERS[chart.canvas.id];
    if (!info) return;
    var data = chartLedger(chart.canvas.id);
    if (data) showLedger(data, info.title, info.sourceHTML, chart.canvas, hits[0].index, chart.canvas.id);
  };

  /* the rate history's timeline, told through diamonds on the chart itself */
  var MILESTONES = [
    { y: 1791, t: "The ledger opens.", d: "Hamilton's whiskey tax gives the new republic its first tax income." },
    { y: 1910, t: "The saloon era.", d: "Beer $1.00 a barrel, spirits $1.10 a proof gallon, wine untaxed." },
    { y: 1919, t: "War taxes stack up.", d: "By February 1919 beer is $6.00 and beverage spirits $6.40, six times the 1910 rates." },
    { y: 1920, dry: true, t: "Prohibition, January 17.", stamp: "No Beer", stampSub: "january 17, 1920",
      d: "The products go dark but the rate tables run straight through: beer holds at $6.00 a barrel with almost nothing legal to tax, and spirits carry a $6.40 penalty rate for anything diverted to beverage use. The ban was only affordable because the new income tax of 1913 had taken over as the Treasury's workhorse; before it, taxes on drink had carried roughly a third of federal revenue.",
      factsHead: "The back room", factsSub: "what they kept behind the bar, 1920 to 1933",
      factsSrc: "Sources: Federal Judicial Center, Prohibition in the Federal Courts timeline; Beer Institute, TTB policy overview.",
      facts: [
        ["The courts drowned in it.", "Federal criminal filings ran about 17,000 a year before Prohibition and 75,000 a year during it; Volstead Act cases alone were nearly two-thirds of the docket."],
        ["Capone fell to the ledger, not the badge.", "In October 1931 Al Capone was convicted of tax evasion, not bootlegging, and drew eleven years."],
        ["The whiskey ration was real.", "A doctor's prescription bought one pint of medicinal spirits every ten days, tax paid, a limit the Supreme Court upheld by a single vote."],
        ["Two states never said yes.", "Connecticut and Rhode Island never ratified the Eighteenth Amendment; the other 46 of 48 did."],
        ["The felony upgrade.", "The 1929 Jones Act turned first-offense bootlegging from a misdemeanor into a felony worth up to $10,000 and five years."],
        ["The bureau at the end of it.", "The regulator that grew out of repeal, today's TTB, is the federal government's third-biggest revenue agency, behind only the IRS and Customs."]
      ] },
    { y: 1933, dry: true, t: "Repeal, December 5.", d: "Five weeks later: beer $5.00, spirits $2.00, wine a dime. Beer had actually come back early: the Cullen-Harrison Act let 3.2 percent beer pour that April, taxed from the first barrel, eight months before repeal itself. A Depression-broke Treasury wanted its bar tab back." },
    { y: 1934, t: "The machinery gets built.", d: "Enforcement folds into Treasury's new Alcohol Tax Unit, and the 1935 FAA Act brings the permits and label approvals TTB still runs today." },
    { y: 1951, t: "Two more wars, two more raises.", d: "Spirits $10.50, beer $9.00, and cigarettes join the table at $4.00 per thousand, about 8 cents a pack." },
    { y: 1991, t: "The last big raise.", d: "Beer jumps to $18.00, spirits to $13.50, wine to $1.07, all effective January 1, 1991. That spike on the chart is Congress's 1990 deficit-reduction budget deal, which doubled the beer rate in one stroke. Those general rates still stand today." },
    { y: 2003, t: "TTB is born.", d: "The Homeland Security Act splits ATF, the bureau that had carried these taxes since 1972: enforcement goes to Justice, and the tax ledger stays at Treasury as TTB, open for business January 24, 2003." },
    { y: 2009, t: "The last cigarette raise.", d: "The rate lands at $50.33 per thousand, $1.01 a pack, and has not moved since." },
    { y: 2018, t: "The craft carve-out.", d: "$3.50 on a small brewer's first 60,000 barrels, $2.70 on a distiller's first 100,000 proof gallons." }
  ];
  function openStory(m) {
    document.querySelectorAll(".mile-tip").forEach(function (t) { t.hidden = true; });
    document.getElementById("stYear").textContent = m.y + " · " + m.t;
    document.getElementById("stText").textContent = m.d;
    /* the dry-years card gets the NO BEER stamp from the reel; rebuilding
       the node replays the slam each time the card opens */
    var st = document.getElementById("stStamp");
    if (st) {
      st.innerHTML = m.stamp
        ? '<span class="stamp s-red">' + m.stamp + '<small>' + (m.stampSub || "") + '</small></span>'
        : "";
    }
    var sc = document.querySelector("#storyModal .modal-card");
    if (sc) sc.classList.toggle("has-stamp", !!m.stamp);
    /* the card with a back room becomes a hidden speakeasy */
    if (sc) sc.classList.toggle("speakeasy", !!m.facts);
    /* some stories carry a back room of facts */
    var fx = document.getElementById("stFacts");
    if (fx) {
      if (m.facts) {
        fx.className = "st-facts";
        fx.hidden = false;
        fx.innerHTML = '<p class="sf-head">' + (m.factsHead || "The back room") +
          (m.factsSub ? " · " + m.factsSub : "") + '</p>' +
          '<ul>' + m.facts.map(function (f) { return "<li><b>" + f[0] + "</b> " + f[1] + "</li>"; }).join("") + '</ul>' +
          (m.factsSrc ? '<p class="sf-src">' + m.factsSrc + '</p>' : "");
      } else {
        fx.hidden = true;
        fx.innerHTML = "";
      }
    }
    openModal("storyModal");
  }
  var milestones = {
    id: "milestones",
    afterDatasetsDraw: function (chart) {
      var x = chart.scales.x;
      if (!x) return;
      var a = chart.chartArea, ctx = chart.ctx, r = 7;
      var py = a.bottom + 38; /* the timeline gets its own lane under the axis years */
      chart.$miles = [];
      ctx.save();
      /* faint dotted verticals tie each milestone up into the graph;
         the red band already marks the dry years */
      MILESTONES.forEach(function (m) {
        if (m.dry) return;
        var px = Math.max(a.left, Math.min(a.right, x.getPixelForValue(m.y)));
        ctx.strokeStyle = "rgba(122,84,16,.13)";
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(px, a.top + 4);
        ctx.lineTo(px, py - 10);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      /* the rail, with a start cap and an arrow pointing at today */
      ctx.strokeStyle = "rgba(122,84,16,.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.left - 4, py - 6);
      ctx.lineTo(a.left - 4, py + 6);
      ctx.moveTo(a.left - 4, py);
      ctx.lineTo(a.right - 8, py);
      ctx.stroke();
      ctx.fillStyle = "rgba(122,84,16,.75)";
      ctx.beginPath();
      ctx.moveTo(a.right - 9, py - 5);
      ctx.lineTo(a.right + 2, py);
      ctx.lineTo(a.right - 9, py + 5);
      ctx.closePath();
      ctx.fill();
      /* the current rate, named where the line runs off the right edge */
      var ds0 = chart.data.datasets[0];
      if (ds0 && ds0.data && ds0.data.length) {
        var lastPt = ds0.data[ds0.data.length - 1];
        var ly = chart.scales.y.getPixelForValue(lastPt.y);
        /* sit below the line when it runs along the chart's ceiling */
        var ty = ly - 9 < a.top + 12 ? ly + 18 : ly - 9;
        ctx.fillStyle = ds0.borderColor;
        ctx.font = '11px "Special Elite","Courier New",monospace';
        ctx.textAlign = "right";
        ctx.fillText("$" + lastPt.y.toFixed(2) + " today", a.right - 6, ty);
      }
      /* the nodes, each carrying its year on a staggered row; on narrow
         screens neighboring years would overlap, so a year that cannot
         fit beside the last one drawn on its row stays quiet (the diamond
         itself still opens the story) */
      var rowRight = [-Infinity, -Infinity];
      ctx.font = '10px "Special Elite","Courier New",monospace';
      ctx.textAlign = "center";
      MILESTONES.forEach(function (m, i) {
        var px = Math.max(a.left, Math.min(a.right, x.getPixelForValue(m.y)));
        chart.$miles.push({ x: px, y: py, m: m });
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = m.dry ? "#a3271c" : "#7a5410";
        ctx.strokeStyle = "#f6edd6";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(-r * 0.72, -r * 0.72, r * 1.44, r * 1.44);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        var row = i % 2;
        var hw = ctx.measureText(String(m.y)).width / 2;
        if (px - hw > rowRight[row] + 4) {
          ctx.fillStyle = m.dry ? "#a3271c" : "#8a7853";
          ctx.fillText(String(m.y), px, py + (row ? 30 : 18));
          rowRight[row] = px + hw;
        }
      });
      ctx.restore();
    }
  };

  function lineDS(label, data, color, extra) {
    return Object.assign({
      label: label, data: data, borderColor: color, backgroundColor: color,
      borderWidth: 2.4, pointRadius: 2.5, pointHoverRadius: 5,
      tension: 0.32, fill: false
    }, extra || {});
  }

  function baseScales(yTitle, yFmt) {
    return {
      x: { grid: { display: false }, ticks: { maxRotation: 0 } },
      y: {
        grid: { color: V.grid }, border: { display: false },
        title: yTitle ? { display: true, text: yTitle, color: V.tick, font: { size: 10 } } : undefined,
        ticks: { callback: yFmt }
      }
    };
  }

  /* the first draw is handled by the sweep plugin above; element-level
     animation stays off so nothing pops point by point */
  function climb() {
    return { duration: 0 };
  }

  var fy = TAX.years.map(function (y) { return "FY" + String(y).slice(2); });
  var cy = BEER.years.map(String);
  var last = TAX.years.length - 1;

  /* prologue: stepped rate history with the dry years shaded */
  var dryBand = {
    id: "dryBand",
    beforeDatasetsDraw: function (chart) {
      var x = chart.scales.x, y = chart.scales.y, ctx = chart.ctx;
      if (!x || !y) return;
      var x1 = x.getPixelForValue(RATES.prohibition.start);
      var x2 = x.getPixelForValue(RATES.prohibition.end);
      ctx.save();
      ctx.fillStyle = "rgba(163,39,28,.08)";
      ctx.fillRect(x1, y.top, x2 - x1, y.bottom - y.top);
      ctx.strokeStyle = "rgba(163,39,28,.55)";
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(x1, y.top); ctx.lineTo(x1, y.bottom);
      ctx.moveTo(x2, y.top); ctx.lineTo(x2, y.bottom);
      ctx.stroke();
      ctx.fillStyle = "#a3271c";
      ctx.font = '10px "Special Elite","Courier New",monospace';
      ctx.textAlign = "center";
      ctx.fillText("PROHIBITION", (x1 + x2) / 2, y.top + 14);
      ctx.fillText("1920 to 1933", (x1 + x2) / 2, y.top + 27);
      ctx.restore();
      /* remembered so a click anywhere in the band opens the 1920 story */
      chart.$dryRect = { x1: x1, x2: x2, top: y.top, bottom: y.bottom };
    }
  };

  /* small on-chart marker: dashed line at a category index with a caption */
  function markerAt(index, lines, side, yFrac) {
    return {
      id: "markerAt" + index,
      afterDatasetsDraw: function (chart) {
        var x = chart.scales.x, y = chart.scales.y, ctx = chart.ctx;
        if (!x || !y) return;
        var px = x.getPixelForValue(index);
        ctx.save();
        ctx.strokeStyle = "rgba(122,84,16,.55)";
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(px, y.top); ctx.lineTo(px, y.bottom);
        ctx.stroke();
        ctx.fillStyle = "#7a5410";
        ctx.font = '10px "Special Elite","Courier New",monospace';
        ctx.textAlign = side === "left" ? "right" : side === "right" ? "left" : "center";
        var tx = side === "left" ? px - 7 : side === "right" ? px + 7 : px;
        var ty = y.top + (y.bottom - y.top) * (yFrac == null ? 0.12 : yFrac);
        lines.forEach(function (t, i) { ctx.fillText(t, tx, ty + i * 13); });
        ctx.restore();
      }
    };
  }

  chartFactories.chartRates = function () {
    var keys = ["beer", "spirits", "wine"];
    var current = "beer";
    function ds(key) {
      var r = RATES[key];
      return {
        label: r.label,
        data: r.points.map(function (p) { return { x: p[0], y: p[1] }; }),
        borderColor: r.color, backgroundColor: r.color,
        borderWidth: 2.6, pointRadius: 3, pointHoverRadius: 6,
        stepped: true, fill: false
      };
    }
    var chart = new Chart(document.getElementById("chartRates"), {
      type: "line",
      data: { datasets: [ds(current)] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: climb(12),
        layout: { padding: { bottom: 50 } }, /* room for the timeline lane */
        interaction: { mode: "nearest", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function (items) {
                if (!items.length) return "";
                var yr = Math.floor(items[0].parsed.x);
                /* the last point of each series is a synthetic extension of the
                   current rate, not a rate change effective that year */
                return yr >= 2026 ? "Still in effect today" : "Effective " + yr;
              },
              label: function (c) {
                return "$" + c.parsed.y.toFixed(2) + " " + RATES[current].unit;
              }
            }
          }
        },
        scales: {
          x: {
            type: "linear", min: 1908, max: 2027,
            grid: { display: false },
            ticks: { maxRotation: 0, callback: function (v) { return Math.round(v); }, maxTicksLimit: 13 }
          },
          y: {
            beginAtZero: true, grid: { color: V.grid }, border: { display: false },
            title: { display: true, text: "Dollars " + RATES[current].unit, color: V.tick, font: { size: 10 } },
            ticks: { callback: function (v) { return "$" + v; } }
          }
        }
      },
      plugins: [dryBand, milestones]
    });
    /* hover a diamond: a small paper tag names the milestone */
    var cvs = document.getElementById("chartRates");
    var mtip = document.createElement("div");
    mtip.className = "mile-tip";
    mtip.hidden = true;
    cvs.parentNode.appendChild(mtip);
    cvs.addEventListener("mousemove", function (e) {
      var rct = cvs.getBoundingClientRect();
      var ex = e.clientX - rct.left, ey = e.clientY - rct.top;
      var hit = null, best = 18;
      (chart.$miles || []).forEach(function (mm) {
        var d = Math.sqrt((ex - mm.x) * (ex - mm.x) + (ey - mm.y) * (ey - mm.y));
        if (d < best) { best = d; hit = mm; }
      });
      if (hit) {
        mtip.textContent = hit.m.y + " · " + hit.m.t;
        mtip.style.left = hit.x + "px";
        mtip.style.top = (hit.y - 16) + "px";
        mtip.hidden = false;
        cvs.style.cursor = "pointer";
      } else if (chart.$dryRect && ex >= chart.$dryRect.x1 && ex <= chart.$dryRect.x2 &&
                 ey >= chart.$dryRect.top && ey <= chart.$dryRect.bottom) {
        mtip.textContent = "Prohibition, 1920 to 1933 · click for the story";
        mtip.style.left = ex + "px";
        mtip.style.top = (ey - 14) + "px";
        mtip.hidden = false;
        cvs.style.cursor = "pointer";
      } else {
        mtip.hidden = true;
      }
    });
    cvs.addEventListener("mouseleave", function () { mtip.hidden = true; });
    /* the timeline lane lives below the chart area, where Chart.js
       stops listening, so the lane handles its own clicks */
    cvs.addEventListener("click", function (e) {
      if (!chart.chartArea || e.clientY - cvs.getBoundingClientRect().top <= chart.chartArea.bottom) return;
      var rct2 = cvs.getBoundingClientRect();
      var ex = e.clientX - rct2.left, ey = e.clientY - rct2.top;
      var hit = null, best = 20;
      (chart.$miles || []).forEach(function (mm) {
        var d = Math.sqrt((ex - mm.x) * (ex - mm.x) + (ey - mm.y) * (ey - mm.y));
        if (d < best) { best = d; hit = mm; }
      });
      if (hit) openStory(hit.m);
    });
    var box = document.getElementById("ratesToggle");
    keys.forEach(function (key) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = RATES[key].label;
      if (key === current) btn.className = "active";
      btn.addEventListener("click", function () {
        current = key;
        box.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        chart.data.datasets = [ds(key)];
        chart.options.scales.y.title.text = "Dollars " + RATES[key].unit;
        chart.update();
      });
      box.appendChild(btn);
    });
  };

  chartFactories.chartStacked = function () {
    new Chart(document.getElementById("chartStacked"), {
      type: "bar",
      data: {
        labels: fy,
        datasets: TAX.commodityMeta.map(function (m) {
          return {
            label: m.label, data: TAX.byCommodity[m.key].map(kToB),
            backgroundColor: COLORS[m.key], stack: "all"
          };
        })
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "bottom" },
          tooltip: { callbacks: { label: function (c) { return c.dataset.label + ": " + money2(c.parsed.y); } } }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: {
            stacked: true, grid: { color: V.grid }, border: { display: false },
            ticks: { callback: function (v) { return "$" + v + "B"; } }
          }
        }
      },
      plugins: [markerAt(3, ["CBMA rates take effect"], "right", 0.06)]
    });
  };


  /* the ledger table is plain HTML, built immediately */
  (function buildTable() {
    var t = document.getElementById("tableCommodity");
    if (!t) return; /* the table now lives in its ledger popup only */
    var kToM = function (v) { return fmt.format(Math.round(v / 1000)); };
    var html = "<thead><tr><th>Product</th><th>FY 2015 ($M)</th><th>FY 2025 ($M)</th><th>Change</th></tr></thead><tbody>";
    TAX.commodityMeta.forEach(function (m) {
      var s = TAX.byCommodity[m.key];
      var pct = (s[last] - s[0]) / s[0] * 100;
      html += "<tr><td>" + m.label + "</td><td>" + kToM(s[0]) + "</td><td>" + kToM(s[last]) + "</td><td>" +
        (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%</td></tr>";
    });
    var tot0 = TAX.totalTaxCollections[0], tot1 = TAX.totalTaxCollections[last];
    html += "<tr><td>Total tax collections</td><td>" + kToM(tot0) + "</td><td>" + kToM(tot1) + "</td><td>" +
      ((tot1 - tot0) / tot0 * 100).toFixed(1) + "%</td></tr></tbody>";
    t.innerHTML = html;
  })();

  chartFactories.chartBeerVol = function () {
    new Chart(document.getElementById("chartBeerVol"), {
      type: "line",
      data: {
        labels: cy,
        datasets: [
          lineDS("Production", BEER.productionBarrels.map(function (v) { return v / 1e6; }), V.beer),
          lineDS("Taxable removals", BEER.taxableRemovalsBarrels.map(function (v) { return v / 1e6; }), V.ink)
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: climb(14),
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "bottom" },
          tooltip: { callbacks: { label: function (c) { return c.dataset.label + ": " + c.parsed.y.toFixed(1) + "M barrels"; } } }
        },
        scales: baseScales("Millions of barrels", function (v) { return v + "M"; })
      }
    });
  };


  chartFactories.chartWineVol = function () {
    new Chart(document.getElementById("chartWineVol"), {
      type: "line",
      data: {
        labels: cy,
        datasets: [
          lineDS("Production", WINE.productionGallons.map(function (v) { return v / 1e6; }), V.wine),
          lineDS("Taxable withdrawals", WINE.taxableWithdrawalsGallons.map(function (v) { return v / 1e6; }), V.ink)
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: climb(14),
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "bottom" },
          tooltip: { callbacks: { label: function (c) { return c.dataset.label + ": " + Math.round(c.parsed.y) + "M gallons"; } } }
        },
        scales: baseScales("Millions of wine gallons", function (v) { return v + "M"; })
      }
    });
  };


  chartFactories.chartSpirits = function () {
    new Chart(document.getElementById("chartSpirits"), {
      type: "line",
      data: {
        labels: cy,
        datasets: [
          lineDS("Whisky production", SPIRITS.productionWhiskyProofGallons.map(function (v) { return v / 1e6; }), V.spirits),
          lineDS("Taxable withdrawals, all spirits",
            SPIRITS.taxableWithdrawalsProofGallons.map(function (v) { return v == null ? null : v / 1e6; }), V.ink)
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: climb(14), spanGaps: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "bottom" },
          tooltip: { callbacks: { label: function (c) { return c.dataset.label + ": " + Math.round(c.parsed.y) + "M proof gallons"; } } }
        },
        scales: baseScales("Millions of proof gallons", function (v) { return v + "M"; })
      }
    });
  };



  /* firearms and ammunition (FAET) */

  chartFactories.chartFaetQ = function () {
    var labels = [], vals = [];
    FAET_Q.years.forEach(function (y, i) {
      FAET_Q.quarters[i].forEach(function (v, q) {
        labels.push("FY" + String(y).slice(2) + " Q" + (q + 1));
        vals.push(v / 1000);
      });
    });
    /* on a phone-width canvas, a year label every four quarters collides;
       every other year still tells the story */
    var faetCvs = document.getElementById("chartFaetQ");
    var lstep = (faetCvs.parentNode.clientWidth || 600) < 520 ? 8 : 4;
    new Chart(document.getElementById("chartFaetQ"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          lineDS("FAET per quarter", vals, V.firearms, { pointRadius: 1.5, borderWidth: 2 })
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: climb(44),
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: function (c) { return "$" + Math.round(c.parsed.y) + "M"; } } }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 0, autoSkip: false,
              callback: function (v, i) { return i % lstep === 0 ? labels[i].slice(0, 4) : ""; }
            }
          },
          y: {
            grid: { color: V.grid }, border: { display: false }, beginAtZero: true,
            title: { display: true, text: "Millions of dollars", color: V.tick, font: { size: 10 } },
            ticks: { callback: function (v) { return "$" + v + "M"; } }
          }
        }
      },
      plugins: [markerAt(22, ["COVID filing", "postponements"], "left", 0.14)]
    });
  };

  chartFactories.chartPermits = function () {
    var start = 2010, end = 2024, years = [];
    for (var y = start; y <= end; y++) years.push(y);
    var align = function (pc) {
      return years.map(function (yy) {
        var i = pc.years.indexOf(yy);
        return i === -1 ? null : pc.counts[i];
      });
    };
    new Chart(document.getElementById("chartPermits"), {
      type: "line",
      data: {
        labels: years.map(String),
        datasets: [
          lineDS("Registered breweries", align(BEER.permitCounts), V.beer),
          lineDS("Bonded wine producers", align(WINE.permitCounts), V.wine),
          lineDS("Beverage distillery permits", align(SPIRITS.permitCounts), V.spirits)
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: climb(15), spanGaps: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "bottom" },
          tooltip: { callbacks: { label: function (c) { return c.dataset.label + ": " + fmt.format(c.parsed.y); } } }
        },
        scales: baseScales("Count at end of year", function (v) { return fmt.format(v); })
      }
    });
  };

  /* ============================================================
     Modals: the ledger popups and the wall-box
     ============================================================ */
  var modalReturn = null;   /* where focus goes when the dialog closes */
  var trapModal = null;     /* the currently open dialog, for the Tab trap */
  function modalFocusables(container) {
    return Array.prototype.slice.call(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(function (el) { return el.offsetWidth > 0 || el.offsetHeight > 0; });
  }
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    modalReturn = document.activeElement;
    m.classList.add("open");
    trapModal = m;
    /* land the keyboard inside the dialog so it reads its label, not the page behind */
    var card = m.querySelector(".modal-card");
    if (card) { card.tabIndex = -1; card.focus(); }
    else { var cb = m.querySelector(".modal-close"); if (cb) cb.focus(); }
  }
  function closeModals() {
    var any = false;
    document.querySelectorAll(".modal.open").forEach(function (m) { m.classList.remove("open"); any = true; });
    if (!any) return;
    trapModal = null;
    if (modalReturn && modalReturn.focus) { try { modalReturn.focus(); } catch (e) {} }
    modalReturn = null;
  }
  document.querySelectorAll(".modal").forEach(function (m) {
    m.addEventListener("click", function (e) { if (e.target === m) closeModals(); });
    m.querySelector(".modal-close").addEventListener("click", closeModals);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModals(); closeBooklet(); return; }
    /* keep Tab inside the open dialog */
    if (e.key === "Tab" && trapModal && trapModal.classList.contains("open")) {
      var f = modalFocusables(trapModal);
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (f.indexOf(a) === -1) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* the "down 19%, why?" tag on the coin chart opens the reason card */
  function openWhy() { openModal("whyModal"); }

  /* the working notes live behind a chip above the receipt */
  (function wireWorkNotes() {
    var btn = document.getElementById("workOpen");
    if (!btn) return;
    btn.addEventListener("click", function () { openModal("workModal"); });
  })();

  /* "spent on wildlife" in the firearms headline opens the Pittman-Robertson card */
  (function wireWildlife() {
    var wl = document.querySelector(".wl-open");
    if (!wl) return;
    wl.addEventListener("click", function () { openModal("wildModal"); });
    wl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal("wildModal"); }
    });
  })();


  var lgNum = function (v) {
    if (v == null) return "redacted";
    if (typeof v !== "number") return v;
    if (Math.abs(v) >= 1000) return fmt.format(Math.round(v));
    if (v === Math.round(v)) return fmt.format(v);
    return v.toFixed(2);
  };

  /* hand-kept ledgers for the pictogram figures */
  var MANUAL_LEDGERS = {
    waffleShare: { head: ["Product", "FY 2025 ($ thousands)", "Share"],
      rows: TAX.commodityMeta.map(function (m) {
        var v = TAX.byCommodity[m.key][TAX.years.length - 1];
        return [m.label, fmt.format(v), (v / TAX.totalTaxCollections[TAX.years.length - 1] * 100).toFixed(1) + "%"];
      }) },
    alcoholFunnel: { head: ["Stage", "FY 2025 ($ thousands)", "Share of total"],
      rows: (function () {
        var li = TAX.years.length - 1;
        var total = TAX.totalTaxCollections[li];
        var alcohol = TAX.byCommodity.distilledSpirits[li] + TAX.byCommodity.wine[li] + TAX.byCommodity.beer[li];
        var spirits = TAX.byCommodity.distilledSpirits[li];
        return [
          ["Total tax collections", fmt.format(total), "100%"],
          ["Alcohol (spirits, wine, beer)", fmt.format(alcohol), (alcohol / total * 100).toFixed(1) + "%"],
          ["Distilled spirits", fmt.format(spirits), (spirits / total * 100).toFixed(1) + "%"]
        ];
      })() },
    breweriesReporting: { head: ["Calendar year", "Breweries filing operational reports"],
      rows: BEER.years.map(function (y, i) { return [String(y), fmt.format(BEER.breweriesReporting[i])]; }) },
    wineriesReporting: { head: ["Calendar year", "Wineries filing operational reports"],
      rows: WINE.years.map(function (y, i) { return [String(y), fmt.format(WINE.wineriesReporting[i])]; }) },
    cigsByYear: { head: ["Calendar year", "Cigarettes removed (sticks)"],
      rows: TOBACCO.years.map(function (y, i) { return [String(y), fmt.format(TOBACCO.cigaretteSticks[i])]; }) },
    tapMenu: { head: ["Product", "FY 2025 collections ($ thousands)", "Change since FY 2015"],
      rows: TAX.commodityMeta.map(function (m) {
        var s = TAX.byCommodity[m.key];
        var pct = (s[s.length - 1] - s[0]) / s[0] * 100;
        return [m.label, fmt.format(s[s.length - 1]), (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%"];
      }) },
    agencyFigures: { head: ["Measure, FY 2025", "Value"],
      rows: [
        ["Authorized industry members", "more than 132,000"],
        ["Label applications received", "nearly 163,000"],
        ["Permit applications received", "nearly 7,200"],
        ["Employees (full-time equivalent)", "502"],
        ["Budget authority", "$157.8 million"],
        ["Revenue collected per program dollar spent on collection", "$199"]
      ] },
    coinStacks: { head: ["Fiscal year", "Total tax collections ($ thousands)"],
      rows: TAX.years.map(function (y, i) { return ["FY " + y, fmt.format(TAX.totalTaxCollections[i])]; }) },
    twoDoors: { head: ["Fiscal year", "Domestic ($ thousands)", "Imports via CBP ($ thousands)", "Import share"],
      rows: [0, TAX.years.length - 1].map(function (i) {
        var tot = TAX.totalTaxCollections[i], imp = TAX.importsCBP[i];
        return ["FY " + TAX.years[i], fmt.format(tot - imp), fmt.format(imp), (imp / tot * 100).toFixed(1) + "%"];
      }) },
    tipScale: { head: ["Fiscal year", "Tobacco ($ thousands)", "Alcohol ($ thousands)"],
      rows: [0, 6, TAX.years.length - 1].map(function (i) {
        var a = TAX.byCommodity.distilledSpirits[i] + TAX.byCommodity.wine[i] + TAX.byCommodity.beer[i];
        return ["FY " + TAX.years[i], fmt.format(TAX.byCommodity.tobacco[i]), fmt.format(a)];
      }) },
    copperStill: { head: ["Measure, calendar year 2024", "Proof gallons"],
      rows: (function () {
        var yi = SPIRITS.years.indexOf(2024);
        var p = SPIRITS.productionTotalProofGallons[yi], w = SPIRITS.taxableWithdrawalsProofGallons[yi];
        return [
          ["Total production, all uses", fmt.format(p)],
          ["Taxable withdrawals", fmt.format(w)],
          ["Taxable share of production", (w / p * 100).toFixed(2) + "%"]
        ];
      })() },
    permitMap: { head: ["State", "Importers", "Wholesalers", "Spirits producers", "Wine producers", "Total"],
      rows: (function () {
        if (typeof PERMITTEES === "undefined") return [];
        var rows = Object.keys(PERMITTEES.states).map(function (st) {
          var a = PERMITTEES.states[st];
          return [st, a[0], a[1], a[2], a[3], a[0] + a[1] + a[2] + a[3]];
        }).sort(function (x, y) { return y[5] - x[5]; });
        var tot = [0, 0, 0, 0, 0];
        rows.forEach(function (r) { for (var i = 1; i <= 5; i++) tot[i - 1] += r[i]; });
        rows.push(["US (incl. DC and PR)"].concat(tot));
        return rows.map(function (r) { return [r[0]].concat(r.slice(1).map(function (v) { return fmt.format(v); })); });
      })() },
    burnDown: { head: ["Fiscal year", "Tobacco collections ($ thousands)"],
      rows: [
        ["FY 2015", fmt.format(TAX.byCommodity.tobacco[0])],
        ["FY 2025", fmt.format(TAX.byCommodity.tobacco[TAX.years.length - 1])],
        ["Change", fmt.format(TAX.byCommodity.tobacco[TAX.years.length - 1] - TAX.byCommodity.tobacco[0])]
      ] },
    beerMugs: { head: ["Year", "Taxable removals (barrels)"],
      rows: [["2015", "177,164,772"], ["2025", "139,219,800"]] },
    cigRows: { head: ["Year", "Cigarettes removed (sticks)"],
      rows: [["2012", "280,160,143,382"], ["2025", "134,231,886,768"]] },
    wineBottles: { head: ["Year", "Taxable withdrawals (wine gallons)"],
      rows: [["2015", "701,484,678"], ["2025", "554,428,785"]] },
    spiritBarrels: { head: ["Year", "Taxable withdrawals (proof gallons)"],
      rows: [["2015", "323,581,763"], ["2024", "375,057,071"]] },
    faetCartridges: { head: ["Fiscal year", "FAET collected ($ thousands)"],
      rows: [["FY 2015", "638,518"], ["FY 2022", "1,150,842"], ["FY 2025", "807,506"]] },
    tableCommodity: { head: ["Product", "FY 2015 ($M)", "FY 2025 ($M)", "Change"],
      rows: TAX.commodityMeta.map(function (m) {
        var s = TAX.byCommodity[m.key];
        var pct = (s[s.length - 1] - s[0]) / s[0] * 100;
        return [m.label, fmt.format(Math.round(s[0] / 1000)), fmt.format(Math.round(s[s.length - 1] / 1000)),
          (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%"];
      }).concat([["Total tax collections",
        fmt.format(Math.round(TAX.totalTaxCollections[0] / 1000)),
        fmt.format(Math.round(TAX.totalTaxCollections[TAX.totalTaxCollections.length - 1] / 1000)),
        ((TAX.totalTaxCollections[TAX.totalTaxCollections.length - 1] - TAX.totalTaxCollections[0]) / TAX.totalTaxCollections[0] * 100).toFixed(1) + "%"]])
    }
  };

  function chartLedger(canvasId) {
    if (chartFactories[canvasId] && !madeCharts[canvasId]) { madeCharts[canvasId] = true; chartFactories[canvasId](); }
    var ch = Chart.getChart(document.getElementById(canvasId));
    if (!ch) return null;
    var ds = ch.data.datasets;
    var labels = ch.data.labels && ch.data.labels.length ? ch.data.labels
      : ds[0].data.map(function (p) { return Math.floor(p.x); });
    return {
      head: [""].concat(ds.map(function (d) { return d.label || "Series"; })),
      rows: labels.map(function (lab, i) {
        return [lab].concat(ds.map(function (d) {
          var v = d.data[i];
          if (v && typeof v === "object") v = v.y;
          return lgNum(v);
        }));
      })
    };
  }

  var currentLedger = null;

  /* every ledger names its units and links straight to the release it came from */
  var LEDGER_META = {
    chartRates: { units: "dollars per unit named on the chart; general rates only", url: RATES.sourceUrl },
    coinStacks: { units: "thousands of nominal dollars per federal fiscal year (October through September)", url: TAX.sourceUrl },
    twoDoors: { units: "thousands of nominal dollars, federal fiscal years", url: TAX.sourceUrl },
    chartDoors: { units: "billions of nominal dollars, federal fiscal years", url: TAX.sourceUrl },
    waffleShare: { units: "thousands of nominal dollars, FY 2025", url: TAX.sourceUrl },
    alcoholFunnel: { units: "thousands of nominal dollars, FY 2025", url: TAX.sourceUrl },
    tapMenu: { units: "thousands of nominal dollars, federal fiscal years", url: TAX.sourceUrl },
    burnDown: { units: "thousands of nominal dollars, federal fiscal years", url: TAX.sourceUrl },
    chartFaetQ: { units: "millions of nominal dollars per fiscal quarter", url: TAX.sourceUrl },
    faetCartridges: { units: "thousands of nominal dollars, federal fiscal years", url: TAX.sourceUrl },
    chartBeerVol: { units: "millions of barrels per calendar year; a barrel is 31 gallons", url: BEER.sourceUrl },
    beerMugs: { units: "barrels per calendar year; a barrel is 31 gallons", url: BEER.sourceUrl },
    chartWineVol: { units: "millions of wine gallons per calendar year", url: WINE.sourceUrl },
    wineBottles: { units: "wine gallons per calendar year", url: WINE.sourceUrl },
    chartSpirits: { units: "millions of proof gallons per calendar year; redacted years stay blank, not imputed", url: SPIRITS.sourceUrl },
    spiritBarrels: { units: "proof gallons per calendar year", url: SPIRITS.sourceUrl },
    copperStill: { units: "proof gallons, calendar year 2024", url: SPIRITS.sourceUrl },
    cigRows: { units: "cigarette sticks per calendar year", url: TOBACCO.sourceUrl },
    chartPermits: { units: "count of premises or permits at end of calendar year", url: "https://www.ttb.gov/data" },
    permitMap: { units: "count of active permits, April 2025", url: PERMITTEES.sourceUrl },
    agencyFigures: { units: "as published; TTB's own rounding retained", url: AGENCY.sourceUrl }
  };

  function showLedger(data, title, sourceHTML, canvas, hotRow, metaKey) {
    var meta = LEDGER_META[metaKey];
    document.getElementById("lgSub").textContent = title + (meta && meta.units ? " · units: " + meta.units : "");
    var t = document.getElementById("lgTable");
    var html = "<thead><tr>" + data.head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>";
    data.rows.forEach(function (r) {
      html += "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
    });
    t.innerHTML = html + "</tbody>";
    if (hotRow != null) {
      var tr = t.querySelectorAll("tbody tr")[hotRow];
      if (tr) {
        tr.classList.add("lg-hot");
        setTimeout(function () {
          var card = tr.closest(".modal-card");
          if (card) card.scrollTop = Math.max(0, tr.offsetTop - card.clientHeight / 2);
        }, 120);
      }
    }
    document.getElementById("lgSource").innerHTML = sourceHTML +
      (meta && meta.url ? ' <a class="lg-visit" href="' + meta.url + '" target="_blank" rel="noopener">Open the source at ttb.gov</a>' : "");
    currentLedger = { data: data, title: title, canvas: canvas || null, sourceHTML: sourceHTML || "" };
    document.getElementById("lgPng").style.display = canvas ? "" : "none";
    openModal("ledgerModal");
  }

  /* take-home copies: CSV of the figures, PNG of the chart */
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "ledger"; }
  function download(name, blob) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  }
  document.getElementById("lgCsv").addEventListener("click", function () {
    if (!currentLedger) return;
    var q = function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; };
    var lines = [currentLedger.data.head.map(q).join(",")];
    currentLedger.data.rows.forEach(function (r) { lines.push(r.map(q).join(",")); });
    download(slug(currentLedger.title) + ".csv", new Blob([lines.join("\n")], { type: "text/csv" }));
  });
  document.getElementById("lgPng").addEventListener("click", function () {
    if (!currentLedger || !currentLedger.canvas) return;
    var c = currentLedger.canvas;
    var s = Math.max(1, c.width / Math.max(1, c.clientWidth || c.width));
    var pad = Math.round(26 * s);
    var titleFont = Math.round(19 * s) + "px Limelight, serif";
    var srcFont = Math.round(10.5 * s) + 'px "Special Elite", "Courier New", monospace';
    var titleLH = Math.round(26 * s), srcLH = Math.round(16 * s);

    var tmp = document.createElement("div");
    tmp.innerHTML = currentLedger.sourceHTML;
    var srcText = tmp.textContent.replace(/\s+/g, " ").trim();

    var mc = document.createElement("canvas").getContext("2d");
    function wrapText(text, font, maxW) {
      mc.font = font;
      var words = text.split(" "), lines = [], line = "";
      words.forEach(function (w) {
        var t = line ? line + " " + w : w;
        if (mc.measureText(t).width > maxW && line) { lines.push(line); line = w; }
        else line = t;
      });
      if (line) lines.push(line);
      return lines;
    }
    var titleLines = wrapText(currentLedger.title, titleFont, c.width);
    var srcLines = srcText ? wrapText(srcText, srcFont, c.width) : [];

    var out = document.createElement("canvas");
    out.width = c.width + pad * 2;
    out.height = pad + titleLines.length * titleLH + Math.round(12 * s) + c.height +
      (srcLines.length ? Math.round(16 * s) + srcLines.length * srcLH : 0) + pad;
    var ctx = out.getContext("2d");
    ctx.fillStyle = "#f6edd6";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.strokeStyle = "#9d8a5c";
    ctx.lineWidth = Math.max(1, Math.round(s));
    ctx.strokeRect(6 * s, 6 * s, out.width - 12 * s, out.height - 12 * s);
    ctx.strokeRect(10 * s, 10 * s, out.width - 20 * s, out.height - 20 * s);
    ctx.textBaseline = "top";
    var y = pad;
    ctx.fillStyle = "#221708";
    ctx.font = titleFont;
    titleLines.forEach(function (line) { ctx.fillText(line, pad, y); y += titleLH; });
    y += Math.round(12 * s);
    ctx.drawImage(c, pad, y);
    y += c.height;
    if (srcLines.length) {
      y += Math.round(16 * s);
      ctx.fillStyle = "#8a7853";
      ctx.font = srcFont;
      srcLines.forEach(function (line) { ctx.fillText(line, pad, y); y += srcLH; });
    }
    out.toBlob(function (blob) { if (blob) download(slug(currentLedger.title) + ".png", blob); }, "image/png");
  });

  /* every graph gets a plain-terms explainer, folded away until asked */
  (function addExplainers() {
    var EXPLAIN = {
      chartRates: "Each line is the federal tax rate on one product; pick beer, spirits, or wine above. A flat stretch means years of no change, each step up is Congress raising the rate, and the shaded band is Prohibition, when the products were banned but the tax stayed on the books.",
      coinStacks: "Each column of coins is one fiscal year of total collections, one coin per billion dollars. The stacks get shorter across the decade: these products bring in less than they did in 2015, mostly because far fewer cigarettes are sold.",
      twoDoors: "The money arrives two ways: taxes on products made in the U.S. (the front door, collected by TTB) and taxes on imports (the border gate, collected by Customs at the border). Click a door to see its year-by-year line; the import share keeps growing.",
      waffleShare: "All of FY 2025's collections drawn as 100 icons, so each icon is 1 percent of the money. Count a product's icons to see its share: tobacco and spirits carry most of it.",
      unitFigure: "Two rows of icons compare an early year against the latest one, so the change is visible at a glance. Fewer icons in the newer row means less of the product entered the taxed market.",
      chartBeerVol: "The upper line is how much beer breweries made; the lower line is how much left the brewery with tax paid, which is what actually reached shelves and taps. Both drifting down means America buys less beer than it used to.",
      chartWineVol: "Production is what wineries made that year; withdrawals are what left the winery for the market with tax paid. Both lines falling together means the wine market is shrinking.",
      chartSpirits: "Whisky production roughly tripled over a decade, then cooled after the 2023 peak. The withdrawals line counts all spirits leaving for the taxed market; it stops at 2024 because TTB redacted the 2025 total rather than expose a single company's data.",
      copperStill: "Of everything American stills produce, only the small pipe goes to drinks; the big pipe is industrial and fuel alcohol, which pays no drink tax. The beverage pipe is the part this page's tax story is about.",
      burnDown: "The full cigarette is drawn to the size of 2015's tobacco tax money. Striking the match burns it down to 2025's take; the ash is revenue that disappeared as smoking declined. The tax rate never changed, so the whole drop is fewer cigarettes.",
      chartFaetQ: "Each point is three months of firearms and ammunition tax. The rises and falls track gun and ammunition buying; the strange 2020 shape is partly a COVID filing deadline that pushed one quarter's payments into the next.",
      chartPermits: "Each line counts producers registered or permitted to operate at the end of each year. All three keep climbing even though total volumes are falling, which means the industry is splitting into more, smaller producers.",
      permitMap: "Each tile is a state, colored by how many active federal alcohol permits it holds; darker means more. The buttons switch permit types, and clicking a state shows its full breakdown."
    };
    document.querySelectorAll(".figure").forEach(function (fig) {
      var key = null;
      var canvas = fig.querySelector("canvas");
      if (canvas && EXPLAIN[canvas.id]) key = canvas.id;
      if (!key) {
        var el = fig.querySelector(".svgfig, .waffle, .burn, .tilemap");
        if (el && EXPLAIN[el.id]) key = el.id;
      }
      if (!key && fig.id && EXPLAIN[fig.id]) key = fig.id;
      if (!key) return;
      var d = document.createElement("details");
      d.className = "explain";
      d.innerHTML = "<summary>What this means</summary><p>" + EXPLAIN[key] + "</p>";
      var src = fig.querySelector(".fig-source");
      fig.insertBefore(d, src || null);
    });
  })();

  /* figures carry only the ledger chip; the full source line lives in the popup */
  document.querySelectorAll(".figure").forEach(function (fig) {
    if (fig.dataset.multi) return; /* the unified pictogram wires its own chip */
    var srcEl = fig.querySelector(".fig-source");
    if (!srcEl) return;
    var canvas = fig.querySelector("canvas");
    var picto = fig.querySelector(".picto-rows, .waffle, .alc-funnel, .burn, .tilemap, .svgfig");
    var table = fig.querySelector("table.data-table");
    if (!canvas && !picto && !table) return;
    var titleEl = fig.querySelector(".fig-title");
    var title = titleEl ? titleEl.textContent : "";
    var sourceHTML = srcEl.innerHTML;
    srcEl.innerHTML = "";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ledger-link";
    btn.textContent = "Here's the ledger (source)";
    btn.addEventListener("click", function () {
      /* fall through the sources: a chart not yet built (the doors graph
         opens on demand) still has a hand-kept ledger to show */
      var chartData = canvas ? chartLedger(canvas.id) : null;
      var data = chartData ||
        (picto ? MANUAL_LEDGERS[picto.id] : null) ||
        (table ? MANUAL_LEDGERS[table.id] : null);
      var key = chartData ? canvas.id : (picto ? picto.id : (table ? table.id : null));
      if (data) showLedger(data, title, sourceHTML, chartData ? canvas : null, null, key);
    });
    srcEl.appendChild(btn);
    if (canvas) FIG_LEDGERS[canvas.id] = { title: title, sourceHTML: sourceHTML };
  });

  /* standalone source lines outside figures get the same chip */
  document.querySelectorAll("p.fig-source[data-ledger]").forEach(function (srcEl) {
    var key = srcEl.dataset.ledger;
    var title = srcEl.dataset.title || "";
    var sourceHTML = srcEl.innerHTML;
    srcEl.innerHTML = "";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ledger-link";
    var chip = srcEl.dataset.chip;
    btn.textContent = chip ? chip + " \u00b7 ledger (source)" : "Here's the ledger (source)";
    btn.addEventListener("click", function () {
      var data = MANUAL_LEDGERS[key];
      if (data) showLedger(data, title, sourceHTML, null, null, key);
    });
    srcEl.appendChild(btn);
  });


  /* The house band: one quiet YouTube track that starts after the knock, only
     if the door's sound switch is on, and can be paused any time. */
  var musicStarted = false, ytPlayer = null, ytLoading = false, musicWantPlay = false;
  function loadYT() {
    if (ytLoading) return;
    ytLoading = true;
    var s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  }
  window.onYouTubeIframeAPIReady = function () {
    if (!document.getElementById("ytHolder")) return;
    ytPlayer = new YT.Player("ytHolder", {
      videoId: "dKbPHrJRnE4", /* Shaboozey, A Bar Song (Tipsy) */
      playerVars: { autoplay: 1, controls: 0, disablekb: 1, playsinline: 1 },
      events: {
        onReady: function (e) { try { e.target.setVolume(52); if (musicWantPlay) e.target.playVideo(); } catch (x) {} },
        onStateChange: function (e) { if (e.data === YT.PlayerState.ENDED) { try { ytPlayer.playVideo(); } catch (x) {} } }
      }
    });
  };
  function musicControl() {
    if (document.getElementById("musicBtn")) return;
    var b = document.createElement("button");
    b.id = "musicBtn"; b.type = "button";
    b.setAttribute("aria-label", "Pause or play the house band");
    b.innerHTML = '<span class="mb-ico" aria-hidden="true">&#9835;</span><span class="mb-txt">Pause the music</span>';
    b.addEventListener("click", function () {
      if (!ytPlayer || !ytPlayer.getPlayerState) return;
      if (ytPlayer.getPlayerState() === 1) {
        ytPlayer.pauseVideo(); musicWantPlay = false;
        b.classList.add("paused"); b.querySelector(".mb-txt").textContent = "Play the music";
      } else {
        ytPlayer.playVideo(); musicWantPlay = true;
        b.classList.remove("paused"); b.querySelector(".mb-txt").textContent = "Pause the music";
      }
    });
    document.body.appendChild(b);
  }
  function startHouseMusic() {
    if (musicStarted) return;
    if (!wantSound()) return; /* the house-band switch at the door is off */
    musicStarted = true; musicWantPlay = true;
    musicControl();
    if (!ytPlayer) loadYT();
    else try { ytPlayer.playVideo(); } catch (x) {}
    /* if the browser blocked autoplay, the first tap anywhere starts the record */
    document.addEventListener("pointerdown", function () {
      if (musicWantPlay && ytPlayer && ytPlayer.getPlayerState && ytPlayer.getPlayerState() !== 1) {
        try { ytPlayer.playVideo(); } catch (x) {}
      }
    });
  }

  if (document.documentElement.classList.contains("locked")) {
    window.addEventListener("speakeasyUnlocked", function () {
      dressForGuest(); /* the name was just written at the door */
      ensureAudio();
      playIntro();
    }, { once: true });
  } else {
    playIntro();
  }

  /* ============================================================
     A closer look: on small screens the drawn figures shrink to
     fit, and this magnifier opens them big enough to read
     ============================================================ */
  (function closerLook() {
    var targets = document.querySelectorAll(".tilemap, .alc-funnel, .burn, .svgfig");
    if (!targets.length) return;
    var view = document.createElement("div");
    view.id = "zoomView";
    view.setAttribute("role", "dialog");
    view.setAttribute("aria-modal", "true");
    view.setAttribute("aria-label", "A closer look");
    view.innerHTML =
      '<div class="zv-bar"><span class="zv-title" id="zvTitle"></span>' +
      '<button class="zv-close" type="button" aria-label="Close">&#10005;</button></div>' +
      '<p class="zv-hint">Slide the picture around with a finger.</p>' +
      '<div class="zv-body" id="zvBody"></div>';
    document.body.appendChild(view);
    function closeZoom() {
      view.classList.remove("on");
      document.body.style.overflow = "";
      document.getElementById("zvBody").innerHTML = "";
    }
    view.querySelector(".zv-close").addEventListener("click", closeZoom);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && view.classList.contains("on")) closeZoom();
    });
    targets.forEach(function (box) {
      var fig = box.closest(".figure");
      var titleEl = fig ? fig.querySelector(".fig-title") : null;
      var row = document.createElement("div");
      row.className = "zoom-row";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fig-zoom";
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">' +
        '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.6 15.6L21 21M7.5 10.5h6M10.5 7.5v6"/></svg>Take a closer look';
      btn.addEventListener("click", function () {
        var clone = box.cloneNode(true);
        clone.removeAttribute("id");
        clone.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
        document.getElementById("zvTitle").textContent = titleEl ? titleEl.textContent : "A closer look";
        var body = document.getElementById("zvBody");
        body.innerHTML = "";
        body.appendChild(clone);
        view.classList.add("on");
        document.body.style.overflow = "hidden";
      });
      row.appendChild(btn);
      box.parentNode.insertBefore(row, box);
    });
  })();

  /* ============================================================
     The fork: beer, wine, or spirits
     ============================================================ */
  (function fork() {
    var caps = Array.prototype.slice.call(document.querySelectorAll(".fork-caps .cap"));
    if (!caps.length) return;
    function choose(cap) {
      caps.forEach(function (c) {
        var on = c === cap;
        c.classList.toggle("active", on);
        c.setAttribute("aria-selected", String(on));
        c.tabIndex = on ? 0 : -1;
        var panel = document.getElementById("path-" + c.dataset.path);
        if (panel) panel.hidden = !on;
      });
    }
    caps.forEach(function (cap, i) {
      cap.tabIndex = cap.classList.contains("active") ? 0 : -1;
      cap.addEventListener("click", function () { choose(cap); });
      cap.addEventListener("keydown", function (e) {
        var to = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (i + 1) % caps.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = (i - 1 + caps.length) % caps.length;
        else if (e.key === "Home") to = 0;
        else if (e.key === "End") to = caps.length - 1;
        if (to < 0) return;
        e.preventDefault();
        caps[to].focus();
        choose(caps[to]);
      });
    });
  })();

})();
