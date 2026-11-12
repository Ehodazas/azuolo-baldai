/* =========================================================
   Ąžuolo Baldai — pagrindinio puslapio kodas
   (bendras kodas: js/site.js, formos: js/forms.js)
   ========================================================= */
(() => {
  const { $, $$, reduceMotion, hasGsap, esc, plural } = window.AB;
  const hasST = hasGsap() && typeof window.ScrollTrigger !== "undefined";
  if (hasST) gsap.registerPlugin(ScrollTrigger, ...(window.SplitText ? [SplitText] : []));
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const PROJECTS = window.AB_PROJECTS || [];
  const CATS = window.AB_CATEGORIES || {};

  /* ---------- Kainų skirtukai ---------- */
  const tabs = $$(".tab");
  const activateTab = (id, animate = true) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      if (on && t.parentElement.scrollWidth > t.parentElement.clientWidth) t.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
    $$(".price-panel").forEach((p) => p.classList.toggle("is-active", p.id === id));
    if (animate && hasGsap() && !reduceMotion()) gsap.fromTo(`#${id} .row`, { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.45, ease: "power2.out", clearProps: "all" });
  };
  tabs.forEach((tab) => tab.addEventListener("click", () => activateTab(tab.dataset.tab)));
  $$(".card[data-tab]").forEach((c) => c.addEventListener("click", () => activateTab(c.dataset.tab, false)));

  /* ---------- Stalo skaičiuoklė ---------- */
  const priceEl = $("#calcPrice");
  const lenInput = $("#calcLen");
  const tpTop = $("#tpTop");
  const tpLegs = $("#tpLegs");
  const woodColors = { "1": "#b88a58", "0.85": "#d9c3a0", "1.45": "#5c3e2a", "0.7": "#e6d6b8" };
  const val = (name) => $(`input[name="${name}"]:checked`).value;
  const price = { v: 1350 };
  const calc = () => {
    const len = +lenInput.value;
    const area = (len / 100) * (+val("width") / 100);
    const total = Math.round((area * 600 * +val("wood") + 380 + +val("legs") + +val("finish")) / 10) * 10;
    $("#lenOut").textContent = len;
    const pct = 34 + ((len - 120) / 180) * 56;
    tpTop.style.width = pct + "%";
    tpTop.style.background = woodColors[val("wood")];
    tpLegs.style.width = pct - 8 + "%";
    tpLegs.classList.toggle("is-metal", val("legs") !== "0");
    if (hasGsap() && !reduceMotion()) gsap.to(price, { v: total, duration: 0.5, ease: "power2.out", onUpdate: () => (priceEl.textContent = fmt(price.v)) });
    else priceEl.textContent = fmt(total);
  };
  $$(".calc input").forEach((i) => i.addEventListener("input", calc));
  calc();
  $("#calcAdd").addEventListener("click", () => {
    const wood = $(`input[name="wood"]:checked`).nextElementSibling.textContent;
    const legs = val("legs") === "0" ? "medinės kojos" : "metalinės kojos";
    const finish = val("finish") === "0" ? "alyva" : "lakas";
    const detail = `${wood}, ${lenInput.value} × ${val("width")} cm, ${legs}, ${finish}`;
    const area = (+lenInput.value / 100) * (+val("width") / 100);
    const total = Math.round((area * 600 * +val("wood") + 380 + +val("legs") + +val("finish")) / 10) * 10;
    AB.cart.add({ id: "stalas-" + detail.toLowerCase().replace(/[^a-z0-9ąčęėįšųūž]+/g, "-"), title: "Valgomojo stalas pagal skaičiuoklę", detail, price: total, unit: "vnt", from: false });
  });

  /* ---------- Kainoraštis: „Į krepšelį“ prie kiekvienos eilutės su kaina ---------- */
  $$(".price-panel").forEach((panel) => {
    const tabLabel = $(`.tab[data-tab="${panel.id}"]`).textContent.trim();
    $$(".row", panel).forEach((row) => {
      const h = $("h4", row).cloneNode(true); $$("b", h).forEach((b) => b.remove());
      const title = h.textContent.trim();
      const priceStr = $(":scope > span", row).textContent;
      const m = priceStr.replace(/\s| /g, "").match(/(\d+)€(\/m)?/);
      if (!m) { row.insertAdjacentHTML("beforeend", '<div class="row__add-ph" aria-hidden="true"></div>'); return; }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "row__add";
      btn.setAttribute("aria-label", `Į krepšelį: ${title}`);
      btn.innerHTML = '<svg><use href="#i-plus"/></svg><span>Į krepšelį</span>';
      btn.addEventListener("click", () => {
        AB.cart.add({ id: "kaina-" + panel.id + "-" + title.toLowerCase().replace(/[^a-z0-9ąčęėįšųūž]+/g, "-"), title, detail: `${tabLabel} · ${$("p", row).textContent}`, price: +m[1], unit: m[2] ? "m" : "vnt", from: /nuo/i.test(priceStr) });
        btn.classList.add("is-added");
        btn.innerHTML = '<svg><use href="#i-check"/></svg><span>Įdėta</span>';
        setTimeout(() => { btn.classList.remove("is-added"); btn.innerHTML = '<svg><use href="#i-plus"/></svg><span>Į krepšelį</span>'; }, 1800);
      });
      row.appendChild(btn);
    });
  });

  /* DUK atsakymams — adresai paieškai (#duk-1 …) */
  $$(".faq__item").forEach((d, i) => (d.id = `duk-${i + 1}`));

  $("#calcCta").addEventListener("click", () => {
    const woodName = $(`input[name="wood"]:checked`).nextElementSibling.textContent;
    $("#f-msg").value = `Domina valgomojo stalas: ${woodName.toLowerCase()}, ${lenInput.value} × ${val("width")} cm, ${val("legs") === "0" ? "medinės" : "metalinės"} kojos, ${val("finish") === "0" ? "alyva" : "lakas"}. Orientacinė kaina ${priceEl.textContent} €.`;
    AB.forms.setType("stalai");
  });

  /* =========================================================
     Darbų galerija: kortelės, filtrai, padidinimas
     ========================================================= */
  const gallery = $("#gallery");
  gallery.innerHTML = PROJECTS.map((p, i) => {
    const cat = CATS[p.category] || { one: "" };
    const img = p.images[0];
    return `<li class="pcard" data-cat="${esc(p.category)}" data-slug="${esc(p.slug)}">
      <button class="fav" type="button" data-fav="${esc(p.slug)}" data-title="${esc(p.title)}" aria-pressed="false" aria-label="Įsiminti projektą: ${esc(p.title)}"><svg aria-hidden="true"><use href="#i-heart"/></svg></button>
      <button class="pcard__zoom" type="button" data-index="${i}" aria-label="Padidinti nuotrauką: ${esc(p.title)}">
        <img src="${esc(img.src)}" srcset="${AB.srcset(img.src)}" sizes="(max-width: 640px) 92vw, (max-width: 900px) 46vw, 30vw" alt="${esc(img.alt)}" loading="lazy" decoding="async">
        <span class="pcard__zi"><svg><use href="#i-zoom"/></svg></span>
      </button>
      <div class="pcard__body">
        <span class="pcard__tag">${esc(cat.one)}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.summary)}</p>
        <a class="btn btn--sm btn--ghost pcard__link" href="projektas.html#${encodeURIComponent(p.slug)}">Peržiūrėti projektą <svg><use href="#i-arrow"/></svg></a>
      </div>
    </li>`;
  }).join("");
  const cards = $$(".pcard", gallery);
  const chips = $$("#filters .chip");
  const total = PROJECTS.length;
  $("#projTotal").textContent = total;
  chips.forEach((c) => {
    if (c.dataset.filter === "favs") return;
    const n = c.dataset.filter === "all" ? total : PROJECTS.filter((p) => p.category === c.dataset.filter).length;
    $(".chip__n", c).textContent = n;
    if (!n) c.hidden = true; /* filtras be projektų nerodomas */
  });
  const visibleCards = () => cards.filter((c) => !c.hidden);
  const updateCount = () => {
    const n = visibleCards().length;
    $("#projCur").textContent = n;
    $("#projBar").style.transform = `scaleX(${n / total})`;
  };
  let currentFilter = "all";
  const applyFilter = (f, animate = true) => {
    if (!chips.some((c) => c.dataset.filter === f && !c.hidden)) f = "all";
    currentFilter = f;
    chips.forEach((c) => { const on = c.dataset.filter === f; c.classList.toggle("is-active", on); c.setAttribute("aria-pressed", String(on)); });
    /* išdėstymas keičiamas iš karto; animacija tik papildoma */
    if (hasGsap()) gsap.killTweensOf(cards);
    cards.forEach((c) => {
      c.hidden = f === "favs" ? !AB.favs.has(c.dataset.slug) : f !== "all" && c.dataset.cat !== f;
      c.style.opacity = ""; c.style.transform = "";
    });
    updateCount();
    if (hasST) ScrollTrigger.refresh();
    if (animate && hasGsap() && !reduceMotion()) {
      gsap.fromTo(visibleCards(), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out", clearProps: "opacity,transform" });
    }
  };
  chips.forEach((c) => c.addEventListener("click", () => applyFilter(c.dataset.filter)));
  updateCount();

  /* mėgstami projektai: filtras, juosta ir prisegimas prie užklausos */
  const favChip = $('#filters [data-filter="favs"]');
  const syncFavUi = () => {
    const n = AB.favs.list().length;
    $(".chip__n", favChip).textContent = n;
    favChip.hidden = n === 0;
    $("#favbar").hidden = n === 0;
    $("#favCount").textContent = `${n} ${plural(n, "projektas", "projektai", "projektų")}`;
    if (currentFilter === "favs") applyFilter(n ? "favs" : "all", false);
  };
  AB.favs.onChange(syncFavUi);
  AB.favs.sync();
  syncFavUi();
  $("#favSend").addEventListener("click", () => {
    AB.forms.attachFavs(AB.favs.titles());
    scrollToEl($("#kontaktai"));
    setTimeout(() => $("#f-name").focus({ preventScroll: true }), reduceMotion() ? 0 : 700);
  });

  /* padidinimas: naršoma tik tarp matomų kortelių */
  gallery.addEventListener("click", (e) => {
    const b = e.target.closest(".pcard__zoom");
    if (!b) return;
    const vis = visibleCards();
    const items = vis.map((c) => {
      const p = PROJECTS[+$(".pcard__zoom", c).dataset.index];
      return { src: p.images[0].src, alt: p.images[0].alt, tag: (CATS[p.category] || {}).one, title: p.title, desc: p.summary };
    });
    AB.lightbox.open(items, vis.indexOf(b.closest(".pcard")), b);
  });

  /* =========================================================
     Medienos pavyzdžiai: padidinimas ir palyginimas
     ========================================================= */
  const samples = $$(".sample");
  const sampleData = (li) => ({
    id: li.dataset.id,
    src: $("img", li).getAttribute("src"),
    alt: $("img", li).alt,
    title: $("h4", li).textContent,
    desc: $("p", li).textContent,
  });
  $$(".sample__zoom").forEach((b, i) => b.addEventListener("click", () => {
    const items = samples.map((li) => { const d = sampleData(li); return { src: d.src, alt: d.alt, tag: "Iliustracinė tekstūra", title: d.title, desc: d.desc }; });
    AB.lightbox.open(items, i, b);
  }));
  const picked = [];
  const cmp = $("#compare");
  const renderCompare = () => {
    const boxes = $$(".sample__cmp input");
    boxes.forEach((cb) => {
      cb.checked = picked.includes(cb.value);
      cb.disabled = picked.length >= 2 && !cb.checked;
      cb.closest(".sample").classList.toggle("is-picked", cb.checked);
    });
    $("#cmpStatus").textContent = `Pasirinkta ${picked.length} iš 2`;
    if (picked.length === 2) {
      const ds = picked.map((id) => sampleData(samples.find((s) => s.dataset.id === id)));
      $("#compareGrid").innerHTML = ds.map((d) => `
        <figure class="compare__item">
          <button class="compare__zoom" type="button" data-id="${esc(d.id)}" aria-label="Padidinti: ${esc(d.title)}"><img src="${esc(d.src)}" alt="${esc(d.alt)}"><span class="sample__badge">Iliustracija</span></button>
          <figcaption><strong>${esc(d.title)}</strong><span>${esc(d.desc)}</span>
            <button class="compare__remove" type="button" data-id="${esc(d.id)}">Pašalinti</button></figcaption>
        </figure>`).join("");
      const wasHidden = cmp.hidden;
      cmp.hidden = false;
      if (wasHidden) {
        if (hasGsap() && !reduceMotion()) gsap.fromTo(cmp, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" });
        const r = cmp.getBoundingClientRect();
        if (r.top > window.innerHeight * 0.75) cmp.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "nearest" });
      }
    } else {
      cmp.hidden = true;
    }
  };
  $$(".sample__cmp input").forEach((cb) => cb.addEventListener("change", () => {
    const i = picked.indexOf(cb.value);
    if (cb.checked && i < 0 && picked.length < 2) picked.push(cb.value);
    if (!cb.checked && i >= 0) picked.splice(i, 1);
    renderCompare();
  }));
  $("#compareGrid").addEventListener("click", (e) => {
    const rm = e.target.closest(".compare__remove");
    if (rm) { picked.splice(picked.indexOf(rm.dataset.id), 1); renderCompare(); $(`#cmp-${rm.dataset.id}`).focus(); return; }
    const z = e.target.closest(".compare__zoom");
    if (z) {
      const items = picked.map((id) => { const d = sampleData(samples.find((s) => s.dataset.id === id)); return { src: d.src, alt: d.alt, tag: "Iliustracinė tekstūra", title: d.title, desc: d.desc }; });
      AB.lightbox.open(items, picked.indexOf(z.dataset.id), z);
    }
  });
  $("#cmpClear").addEventListener("click", () => { picked.length = 0; renderCompare(); $(".sample__cmp input").focus(); });

  /* =========================================================
     „Baldai“ meniu nuorodos ir projekto perdavimas į formą
     ========================================================= */
  let instantScroll = false; /* atėjus iš kito puslapio — be animacijos, kad jos nenutrauktų išdėstymo perskaičiavimas */
  const scrollToEl = (el) => el && el.scrollIntoView({ behavior: reduceMotion() || instantScroll ? "instant" : "smooth", block: "start" });
  const goFilter = (cat) => { applyFilter(cat, false); scrollToEl($("#darbai")); };
  const goForm = (type) => {
    if (type === "vizitas" || type === "matavimas") AB.forms.setVisit(type);
    else AB.forms.setType(type);
    scrollToEl($("#kontaktai"));
    setTimeout(() => $("#f-name").focus({ preventScroll: true }), reduceMotion() ? 0 : 700);
  };
  $$("[data-filter-link]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    AB.closeMobileMenu && AB.closeMobileMenu();
    goFilter(a.dataset.filterLink);
    history.replaceState(null, "", "#f-" + a.dataset.filterLink);
  }));
  $$("[data-form-link]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    AB.closeMobileMenu && AB.closeMobileMenu();
    goForm(a.dataset.formLink);
    history.replaceState(null, "", "#u-" + a.dataset.formLink);
  }));
  /* specialūs adresai: #f-<kategorija>, #u-<gaminys>, #u-krepselis, #k-<kainų skirtukas>, #duk-<n>, #p-<projektas> */
  const route = (h) => {
    if (h.startsWith("p-")) {
      const pr = PROJECTS.find((p) => p.slug === h.slice(2));
      if (pr) { AB.forms.setProject(pr); scrollToEl($("#kontaktai")); setTimeout(() => $("#f-name").focus({ preventScroll: true }), reduceMotion() || instantScroll ? 0 : 700); return true; }
    }
    if (h.startsWith("f-")) { goFilter(h.slice(2)); return true; }
    if (h === "u-krepselis") { if (AB.cart && AB.cart.count) AB.forms.attachCart(AB.cart.summary()); goForm(null); return true; }
    if (h.startsWith("u-")) { goForm(h.slice(2)); return true; }
    if (h.startsWith("k-") && $("#" + h.slice(2))) { activateTab(h.slice(2), false); scrollToEl($("#kainos")); return true; }
    if (/^duk-\d+$/.test(h) && $("#" + h)) { const d = $("#" + h); d.open = true; d.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" }); $("summary", d).focus({ preventScroll: true }); return true; }
    return false;
  };
  AB.route = route;
  const handleHash = () => route(decodeURIComponent(location.hash.slice(1)));
  window.addEventListener("hashchange", handleHash);

  /* senas formatas: index.html?projektas=<slug>#kontaktai (naujas — #p-<slug>) */
  const params = new URLSearchParams(location.search);
  const fromProject = PROJECTS.find((p) => p.slug === params.get("projektas"));
  if (fromProject) AB.forms.setProject(fromProject);
  const initialHash = location.hash;
  window.addEventListener("load", () => setTimeout(() => {
    instantScroll = true;
    if (/^#([fukp]|duk)-/.test(initialHash)) handleHash();
    else if (fromProject) { scrollToEl($("#kontaktai")); $("#f-name").focus({ preventScroll: true }); }
    instantScroll = false;
  }, 200));

  /* =========================================================
     GSAP animacijos
     ========================================================= */
  const setCount = (el, n) => (el.textContent = fmt(n) + (el.dataset.suffix || ""));
  if (!hasST) { $$("[data-count]").forEach((el) => setCount(el, +el.dataset.count)); return; }

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduce) { $$("[data-count]").forEach((el) => setCount(el, +el.dataset.count)); return; }
    const splits = [];
    const hasSplit = !!window.SplitText;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".hero__bg img", { scale: 1.15, duration: 2.2, ease: "expo.out" }, 0)
      .from(".nav", { y: -20, opacity: 0, duration: 0.8, clearProps: "transform,opacity" }, 0.1)
      .from(".hero__eyebrow", { y: 16, opacity: 0, duration: 0.6 }, 0.3);
    if (hasSplit) {
      const s = SplitText.create(".hero__title", { type: "lines", mask: "lines" });
      splits.push(s);
      tl.from(s.lines, { yPercent: 105, duration: 1.1, stagger: 0.1, onComplete: () => s.revert() }, 0.4);
    } else tl.from(".hero__title", { y: 30, opacity: 0, duration: 1 }, 0.4);
    tl.from(".hero__list li", { x: -16, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.9)
      .from(".hero__actions .btn", { y: 16, opacity: 0, duration: 0.6, stagger: 0.08 }, 1.1)
      .from(".hero__card", { y: 20, opacity: 0, duration: 0.8 }, 1.2)
      .from(".quick__card", { y: 40, opacity: 0, duration: 1, clearProps: "transform,opacity" }, 1.0);

    gsap.to(".hero__bg img", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    $$("[data-count]").forEach((el) => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 1.8, ease: "power2.out", onUpdate: () => setCount(el, o.v), scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });

    $$(".reveal-title").forEach((h) => {
      if (hasSplit) {
        const s = SplitText.create(h, { type: "words", mask: "words" });
        splits.push(s);
        /* pasibaigus animacijai rėmeliai pašalinami, kad niekas nenukirptų raidžių */
        gsap.from(s.words, { yPercent: 110, duration: 0.9, stagger: 0.04, ease: "power3.out", onComplete: () => s.revert(), scrollTrigger: { trigger: h, start: "top 88%", once: true } });
      } else gsap.from(h, { y: 24, opacity: 0, duration: 0.8, scrollTrigger: { trigger: h, start: "top 88%", once: true } });
    });

    const batchIn = (sel, opts = {}) => ScrollTrigger.batch(sel, {
      start: "top 90%", once: true,
      onEnter: (els) => gsap.from(els.filter((e) => !e.hidden), { y: 36, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", clearProps: "opacity,transform", ...opts }),
    });
    batchIn(".card");
    batchIn(".benefit", { y: 20 });
    batchIn(".wood");
    batchIn(".sample", { y: 24 });
    batchIn(".pcard", { y: 28 });
    batchIn(".quote");
    batchIn(".faq__item", { y: 14 });
    batchIn(".partners__list li", { y: 14, stagger: 0.05 });
    batchIn(".contact__list li", { x: -16, y: 0 });
    batchIn(".price-panel.is-active .row", { y: 12, duration: 0.6, stagger: 0.05 });

    gsap.from(".about__img--main", { clipPath: "inset(100% 0% 0% 0% round 22px)", duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".about", start: "top 75%", once: true } });
    gsap.from(".about__img--small", { y: 60, opacity: 0, duration: 1.1, delay: 0.3, ease: "power3.out", scrollTrigger: { trigger: ".about", start: "top 75%", once: true } });
    gsap.from(".about__since", { scale: 0.8, opacity: 0, duration: 0.8, delay: 0.6, ease: "back.out(1.6)", scrollTrigger: { trigger: ".about", start: "top 75%", once: true } });

    $$(".wood dd i").forEach((bar) => gsap.from(bar, { "--v": 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: bar, start: "top 94%", once: true } }));

    gsap.to("#processBar", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".steps", start: "top 60%", end: "bottom 60%", scrub: 0.5 } });
    $$(".step").forEach((step) => gsap.fromTo(step, { opacity: 0.3 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: step, start: "top 80%", end: "top 50%", scrub: true } }));

    gsap.from(".calc", { y: 48, opacity: 0, duration: 1, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: { trigger: ".calc", start: "top 88%", once: true } });
    gsap.fromTo(".cta-band__bg", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".cta-band", start: "top bottom", end: "bottom top", scrub: true } });

    return () => splits.forEach((s) => s.revert());
  });

  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
