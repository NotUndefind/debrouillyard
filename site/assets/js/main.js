/* ==========================================================
   LA DÉBROUILL'YARD — scripts communs
   Aucune donnée n'est insérée via innerHTML : tout le contenu
   dynamique passe par textContent (pas d'injection possible).
   ========================================================== */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Crée un élément : h("div", { class: "x" }, "texte", enfant…)
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") el.className = v;
      else el.setAttribute(k, v);
    }
    children.forEach(c => c != null && el.append(c));
    return el;
  }
  const normalize = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

  /* ---------- Nav : fond au scroll + menu mobile ---------- */
  const nav = $(".nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger = $(".burger");
  const setMenu = open => {
    document.body.classList.toggle("menu-open", open);
    burger?.setAttribute("aria-expanded", String(open));
  };
  if (burger) {
    burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
    $$(".nav-links a").forEach(a => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) { setMenu(false); burger.focus(); }
    });
  }

  // Lien actif : déduit de l'URL (fonctionne avec ou sans « .html »)
  const page = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "") || "index";
  $$(".nav-links a:not(.nav-cta)").forEach(a => {
    const target = a.getAttribute("href").split("#")[0].replace(/\.html$/, "");
    const on = target === page;
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });

  /* ---------- Apparition au scroll ---------- */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.12 })
    : null;
  const observeReveal = root => $$(".reveal", root).forEach(el => (io ? io.observe(el) : el.classList.add("in")));
  observeReveal(document);

  /* ---------- Année footer ---------- */
  $$("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- Compte à rebours ---------- */
  const cd = $("[data-countdown]");
  if (cd && window.EVENT) {
    const target = new Date(EVENT.start).getTime();
    const set = (k, v) => { const el = $(`[data-cd="${k}"]`, cd); if (el) el.textContent = String(v).padStart(2, "0"); };
    let timer;
    const tick = () => {
      const left = target - Date.now();
      let diff = Math.max(0, left);
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const hh = Math.floor(diff / 36e5); diff -= hh * 36e5;
      const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      set("d", d); set("h", hh); set("m", m); set("s", Math.floor(diff / 1e3));
      if (left <= 0) {
        clearInterval(timer);
        const t = $(".cd-title", cd);
        if (t) t.textContent = "La cloche a sonné. Bonne course à tous.";
      }
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Grille des 25 premiers tours ---------- */
  const hoursEl = $("[data-hours]");
  if (hoursEl && window.EVENT) {
    const startHour = 12; // Tour 1 à 12h00
    const isDay = hr => hr >= 9 && hr < 17; // soleil ~8h45 → ~17h en janvier dans les Ardennes
    for (let tour = 1; tour <= 25; tour++) {
      const hour = (startHour + tour - 1) % 24;
      const km = (tour * EVENT.loopKm).toFixed(1).replace(".", ",");
      const cls = ["hour", isDay(hour) ? "day" : "", [6, 13, 15, 24].includes(tour) ? "milestone" : ""].join(" ");
      hoursEl.append(h("div", { class: cls, title: `Tour ${tour} : départ ${hour}h00, ${km} km à l'arrivée` },
        h("span", null, `T${tour}`), h("b", null, `${hour}h`), h("span", null, km)));
    }
  }

  /* ---------- Photos participants ---------- */
  const initials = name => String(name).trim().charAt(0).toUpperCase();
  const SAFE_ID = /^[a-z0-9-]+$/;

  // Photo = assets/img/participants/<id>.jpg (préparée par outils/preparer_images.py).
  // Si elle n'existe pas, l'initiale reste affichée.
  function loadPhoto(container, id, alt) {
    if (!SAFE_ID.test(id)) return;
    const img = new Image();
    img.alt = alt;
    img.decoding = "async";
    img.loading = "lazy";
    img.onload = () => { $(".initials", container)?.remove(); container.prepend(img); };
    img.src = `${window.PHOTO_DIR}${id}.jpg`;
  }

  const people = Array.isArray(window.PARTICIPANTS) ? window.PARTICIPANTS : [];

  const slots = Math.max(people.length, (window.EVENT && EVENT.maxRunners) || people.length);

  /* Accueil : pastilles (inscrits puis places vierges) */
  const faces = $("[data-faces]");
  if (faces) {
    for (let i = 0; i < slots; i++) {
      const p = people[i];
      if (!p) { faces.append(h("div", { class: "face blank", "aria-hidden": "true" })); continue; }
      const el = h("div", { class: "face", title: p.name, role: "img", "aria-label": p.name },
        h("span", { class: "initials", "aria-hidden": "true" }, initials(p.name)));
      faces.append(el);
      loadPhoto(el, p.id, p.name);
    }
  }

  /* Page participants : cartes + recherche */
  const grid = $("[data-runners]");
  if (grid) {
    for (let idx = 0; idx < slots; idx++) {
      const p = people[idx];
      if (!p) {
        // Carte vierge : place pas encore attribuée
        grid.append(h("article", { class: "runner blank reveal", "aria-hidden": "true" },
          h("div", { class: "runner-photo" }),
          h("div", { class: "runner-body" }, h("span", { class: "sk sk-1" }), h("span", { class: "sk sk-2" }))));
        continue;
      }
      const n = String(idx + 1).padStart(2, "0");
      const photo = h("div", { class: "runner-photo" },
        h("span", { class: "initials", "aria-hidden": "true" }, initials(p.name)),
        h("div", { class: "runner-bib" }, "N°", h("b", null, n)));
      const card = h("article", { class: "runner reveal" },
        photo,
        h("div", { class: "runner-body" },
          h("h2", { class: "name" }, p.name),
          h("div", { class: "meta" }, `Dossard ${n} · Box ${n}${p.note ? " · " + p.note : ""}`)));
      card.dataset.search = normalize(`${p.name} ${p.note || ""} ${n} ${idx + 1}`);
      grid.append(card);
      loadPhoto(photo, p.id, p.name);
    }
    observeReveal(grid);

    const count = $("[data-count]");
    const empty = $("[data-empty]");
    const input = $("[data-search]");
    const update = () => {
      const q = normalize(input?.value || "");
      let shown = 0;
      $$(".runner:not(.blank)", grid).forEach(c => {
        const ok = !q || c.dataset.search.includes(q);
        c.hidden = !ok;
        if (ok) { shown++; c.classList.add("in"); }
      });
      // Pendant une recherche, on masque les cartes vierges
      $$(".runner.blank", grid).forEach(c => (c.hidden = !!q));
      if (count) count.textContent = q ? `${shown} résultat${shown > 1 ? "s" : ""}` : `${people.length} / ${slots} inscrits`;
      if (empty) empty.hidden = !q || shown > 0;
    };
    input?.addEventListener("input", update);
    update();
  }

  /* ---------- Carte Google Maps : chargée uniquement sur clic ---------- */
  // Évite d'envoyer l'IP des visiteurs à Google (et ses cookies) sans leur accord.
  $$("[data-map]").forEach(box => {
    const btn = $("button", box);
    btn?.addEventListener("click", () => {
      const iframe = h("iframe", {
        title: box.dataset.title || "Carte",
        src: box.dataset.map,
        loading: "lazy",
        referrerpolicy: "no-referrer",
        sandbox: "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",
      });
      box.replaceChildren(iframe);
    });
  });

  /* ---------- Checklist matériel (mémorisée dans le navigateur) ---------- */
  const items = $$(".item input");
  if (items.length) {
    const KEY = "debrouillyard-checklist-v1";
    let saved = {};
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (raw && typeof raw === "object" && !Array.isArray(raw)) saved = raw;
    } catch (e) { /* stockage indisponible ou corrompu : on repart de zéro */ }
    const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };

    const bar = $("[data-progress-bar]");
    const txt = $("[data-progress-txt]");
    const refresh = () => {
      const done = items.filter(i => i.checked).length;
      if (bar) bar.style.width = (done / items.length) * 100 + "%";
      if (txt) txt.textContent = `${done} / ${items.length} dans le sac`;
    };
    items.forEach((input, i) => {
      const key = input.name || "i" + i;
      input.checked = saved[key] === true;
      input.closest(".item").classList.toggle("checked", input.checked);
      input.addEventListener("change", () => {
        input.closest(".item").classList.toggle("checked", input.checked);
        saved[key] = input.checked;
        persist();
        refresh();
      });
    });
    $("[data-reset]")?.addEventListener("click", () => {
      if (!confirm("Tout décocher ?")) return;
      items.forEach(i => { i.checked = false; i.closest(".item").classList.remove("checked"); });
      saved = {};
      try { localStorage.removeItem(KEY); } catch (e) {}
      refresh();
    });
    refresh();
  }
})();
