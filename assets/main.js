/* Wenjie HUANG — site interactions
   1. Light/dark theme toggle (persisted)
   2. Publication filter + keyword search on the Research page
   3. Masthead photo: drop assets/img/profile.jpg in and it replaces the monogram
   Vanilla JS, no dependencies. */

(function () {
  "use strict";

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  /* ---------- Theme ---------- */
  var SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-13V1m0 22v-3m9-8h3M0 12h3m15.36-6.36 2.12-2.12M3.52 20.48l2.12-2.12m12.72 0 2.12 2.12M3.52 3.52l2.12 2.12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.innerHTML = t === "dark" ? SUN : MOON;
      btn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  var saved = store.get("wh-theme");
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("#theme-toggle") : null;
    if (!btn) return;
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    store.set("wh-theme", next);
  });

  /* ---------- Masthead photo (optional) ---------- */
  (function () {
    var img = document.getElementById("avatar-img");
    var ph = document.getElementById("avatar-ph");
    if (!img || !ph) return;
    function show() {
      if (!img.naturalWidth) return;       // never loaded -> keep monogram
      img.hidden = false;
      ph.style.display = "none";
    }
    img.addEventListener("load", show);
    img.addEventListener("error", function () { img.hidden = true; });
    if (img.complete) show();
  })();

  /* ---------- Artwork images (optional, same trick as the photo) ---------- */
  (function () {
    Array.prototype.forEach.call(document.querySelectorAll("[data-art]"), function (img) {
      var ph = img.parentNode.querySelector(".art-ph");
      function show() {
        if (!img.naturalWidth) return;
        img.hidden = false;
        if (ph) ph.style.display = "none";
      }
      img.addEventListener("load", show);
      img.addEventListener("error", function () { img.hidden = true; });
      if (img.complete) show();
    });
  })();

  /* ---------- Publication filter / search ---------- */
  var search = document.getElementById("pub-search");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-filter]"));
  var items = Array.prototype.slice.call(document.querySelectorAll("ol.pubs > li"));
  if (!items.length) return;
  document.documentElement.classList.add("js");

  function norm(s) { return (s || "").toLowerCase(); }

  function apply() {
    var q = norm(search ? search.value.trim() : "");
    var activeChip = chips.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; })[0];
    var cat = activeChip ? activeChip.getAttribute("data-filter") : "all";

    var visible = 0;
    items.forEach(function (li) {
      var okCat = cat === "all" || li.getAttribute("data-cat") === cat;
      var okQ = !q || norm(li.textContent).indexOf(q) !== -1;
      var show = okCat && okQ;
      li.style.display = show ? "" : "none";
      if (show) visible++;
    });

    // renumber visible entries (numbering restarts in each list)
    Array.prototype.forEach.call(document.querySelectorAll("ol.pubs"), function (list) {
      var n = 0;
      Array.prototype.forEach.call(list.children, function (li) {
        if (li.style.display === "none") return;
        n++;
        li.style.setProperty("--n", '"' + n + '"');
      });
    });

    // hide empty section headings
    document.querySelectorAll("[data-section]").forEach(function (sec) {
      var any = Array.prototype.slice.call(sec.querySelectorAll("ol.pubs > li"))
        .some(function (li) { return li.style.display !== "none"; });
      sec.style.display = any ? "" : "none";
    });

    var counter = document.getElementById("pub-count");
    if (counter) counter.textContent = visible + " shown";
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      chip.setAttribute("aria-pressed", "true");
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", apply);
    // "/" focuses the search box
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== search) {
        e.preventDefault();
        search.focus();
      }
    });
  }

  apply();
})();

/* ---------- Footer visit stats (plain numbers, Abacus counter API) ---------- */
(function () {
  var pv = document.getElementById("stat-pv");
  var uv = document.getElementById("stat-uv");
  if (!pv || !uv) return;

  var NS = "wenjiehuangwayne-github-io";
  var BASE = "https://abacus.jasoncameron.dev";
  var SESSION_KEY = "wh-visit-counted";

  function fmt(n) { return Number(n).toLocaleString("en-US"); }

  function paint(el, value) {
    var slot = el.querySelector(".stat-num");
    if (!slot) return;
    slot.textContent = fmt(value);
    el.hidden = false;
  }

  // The counter service is a small hobby endpoint and occasionally answers 5xx,
  // so give it one retry before giving up (the number simply stays hidden).
  function ask(path, key, tries) {
    tries = tries || 0;
    return fetch(BASE + path + NS + "/" + key, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (d) {
        if (!d || d.value == null) throw new Error("no value");
        return d.value;
      })
      .catch(function (err) {
        if (tries < 1) {
          return new Promise(function (res) { setTimeout(res, 700); })
            .then(function () { return ask(path, key, tries + 1); });
        }
        throw err;
      });
  }

  // Page views: count every load of any page on the site.
  ask("/hit/", "pageviews").then(function (v) { paint(pv, v); }).catch(function () {});

  // Visitors: count once per browser session.
  var seen = false;
  try { seen = sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) {}
  ask(seen ? "/get/" : "/hit/", "visitors").then(function (v) {
    paint(uv, v);
    if (!seen) { try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {} }
  }).catch(function () {});
})();
