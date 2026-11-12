/* =========================================================
   Ąžuolo Baldai — bendras visų puslapių kodas
   antraštė, meniu, „Baldai“ sąrašas, lightbox, slapukai
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = () => typeof window.gsap !== "undefined";
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const plural = (n, one, few, many) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 9 && (m100 < 11 || m100 > 19)) return few;
    return many;
  };
  /* nuotraukų dydžiai: img/photo-*.jpg (1600 px) turi lengvesnę kopiją *-800.jpg telefonams */
  const srcset = (src) => (/^img\/photo-[^/]+\.jpg$/.test(src) && !/-800\.jpg$/.test(src) ? `${src.replace(/\.jpg$/, "-800.jpg")} 800w, ${src} 1600w` : "");
  window.AB = { $, $$, reduceMotion, hasGsap, store, esc, plural, srcset };

  /* ---------- Metai, nuotraukų atsarginis variantas ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  $$("img").forEach((img) => img.addEventListener("error", () => (img.style.opacity = "0"), { once: true }));

  /* ---------- Kategorijų skaičiai meniu ---------- */
  const projects = window.AB_PROJECTS || [];
  $$("[data-cat-count]").forEach((el) => {
    const n = projects.filter((p) => p.category === el.dataset.catCount).length;
    el.textContent = n ? `${n} ${plural(n, "projektas", "projektai", "projektų")}` : "Užklausa su pasirinkta kategorija";
  });

  /* ---------- Antraštė, plaukiojantys mygtukai, mobili juosta ---------- */
  const header = $("#siteHeader");
  const floatActions = $(".float-actions");
  const mobileBar = $("#mobileBar");
  const contact = $("#kontaktai");
  const onScroll = () => {
    const sy = window.scrollY;
    header && header.classList.toggle("is-scrolled", sy > 40);
    const past = sy > window.innerHeight * 0.7;
    floatActions && floatActions.classList.toggle("is-visible", past);
    if (mobileBar) {
      const nearForm = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.6 : false;
      mobileBar.classList.toggle("is-visible", past && !nearForm && !document.body.classList.contains("no-scroll"));
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  AB.refreshChrome = onScroll;

  /* Aktyvi nuoroda meniu (tik vidinės nuorodos) */
  const navLinks = $$(".nav__links > a[href^='#']");
  if (navLinks.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach((a) => { const s = $(a.getAttribute("href")); if (s) io.observe(s); });
  }

  /* ---------- „Baldai“ išskleidžiamas meniu (kompiuteris) ---------- */
  const dd = $(".dd");
  if (dd) {
    const btn = $(".dd__btn", dd);
    const menu = $(".dd__menu", dd);
    const items = () => $$(".dd__item", menu);
    const setOpen = (open, focusBtn = false) => {
      btn.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      dd.classList.toggle("is-open", open);
      if (open && hasGsap() && !reduceMotion()) gsap.fromTo(menu, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
      if (!open && focusBtn) btn.focus();
    };
    btn.addEventListener("click", () => setOpen(btn.getAttribute("aria-expanded") !== "true"));
    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); items()[0].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); setOpen(true); items().at(-1).focus(); }
    });
    menu.addEventListener("keydown", (e) => {
      const list = items();
      const i = list.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      if (e.key === "Home") { e.preventDefault(); list[0].focus(); }
      if (e.key === "End") { e.preventDefault(); list.at(-1).focus(); }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") setOpen(false, dd.contains(document.activeElement));
    });
    document.addEventListener("click", (e) => { if (!dd.contains(e.target)) setOpen(false); });
    dd.addEventListener("focusout", (e) => { if (e.relatedTarget && !dd.contains(e.relatedTarget)) setOpen(false); });
    items().forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }

  /* ---------- Mobilus meniu ---------- */
  const burger = $(".burger");
  const mmenu = $("#mobileMenu");
  const setMenu = (open) => {
    if (!burger || !mmenu) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Uždaryti meniu" : "Atidaryti meniu");
    mmenu.setAttribute("aria-hidden", String(!open));
    mmenu.inert = !open;
    document.body.classList.toggle("no-scroll", open);
    onScroll();
    if (hasGsap() && !reduceMotion()) {
      gsap.to(mmenu, { autoAlpha: open ? 1 : 0, duration: 0.3, ease: "power2.out" });
      if (open) gsap.fromTo(".mobile-menu__links > *, .mobile-menu__foot > *", { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.5, ease: "power3.out", delay: 0.05, clearProps: "transform,opacity" });
    } else {
      mmenu.style.visibility = open ? "visible" : "hidden";
      mmenu.style.opacity = open ? "1" : "0";
    }
  };
  AB.closeMobileMenu = () => setMenu(false);
  if (burger && mmenu) {
    mmenu.inert = true;
    burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
    $$("a", mmenu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") { setMenu(false); burger.focus(); } });
    /* „Baldai“ grupė mobiliajame meniu */
    $$(".mm-group__btn", mmenu).forEach((b) => {
      const list = $("#" + b.getAttribute("aria-controls"));
      b.addEventListener("click", () => {
        const open = b.getAttribute("aria-expanded") !== "true";
        b.setAttribute("aria-expanded", String(open));
        list.hidden = !open;
        if (open && hasGsap() && !reduceMotion()) gsap.fromTo(list.children, { x: -10, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.04, duration: 0.35, ease: "power2.out", clearProps: "transform,opacity" });
      });
    });
  }

  /* ---------- Lightbox (bendras) ---------- */
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.id = "lightbox";
  lb.hidden = true;
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Nuotraukos peržiūra");
  lb.innerHTML = `
    <button class="lb__close" aria-label="Uždaryti"><svg><use href="#i-close"/></svg></button>
    <button class="lb__nav lb__prev" aria-label="Ankstesnė nuotrauka"><svg><use href="#i-left"/></svg></button>
    <figure class="lb__fig">
      <img class="lb__img" alt="">
      <figcaption><span class="lb__tag"></span><strong class="lb__title"></strong><em class="lb__desc"></em><small class="lb__count"></small></figcaption>
    </figure>
    <button class="lb__nav lb__next" aria-label="Kita nuotrauka"><svg><use href="#i-right"/></svg></button>`;
  document.body.appendChild(lb);
  const lbImg = $(".lb__img", lb);
  let lbItems = [], lbIndex = 0, lbOpener = null;
  const showLb = (i) => {
    lbIndex = (i + lbItems.length) % lbItems.length;
    const it = lbItems[lbIndex];
    lbImg.src = it.src;
    lbImg.alt = it.alt || "";
    $(".lb__tag", lb).textContent = it.tag || "";
    $(".lb__title", lb).textContent = it.title || "";
    $(".lb__desc", lb).textContent = it.desc || "";
    $(".lb__count", lb).textContent = lbItems.length > 1 ? `${lbIndex + 1} / ${lbItems.length}` : "";
    $$(".lb__nav", lb).forEach((b) => (b.hidden = lbItems.length < 2));
    if (hasGsap() && !reduceMotion()) gsap.fromTo(".lb__fig", { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" });
  };
  const closeLb = () => {
    lb.hidden = true;
    document.body.classList.remove("no-scroll");
    onScroll();
    lbOpener && lbOpener.focus();
  };
  AB.lightbox = {
    open(items, index = 0, opener = null) {
      if (!items.length) return;
      lbItems = items; lbOpener = opener || document.activeElement;
      lb.hidden = false;
      document.body.classList.add("no-scroll");
      onScroll();
      showLb(index);
      $(".lb__close", lb).focus();
    },
    close: closeLb,
  };
  $(".lb__close", lb).addEventListener("click", closeLb);
  $(".lb__prev", lb).addEventListener("click", () => showLb(lbIndex - 1));
  $(".lb__next", lb).addEventListener("click", () => showLb(lbIndex + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft" && lbItems.length > 1) showLb(lbIndex - 1);
    if (e.key === "ArrowRight" && lbItems.length > 1) showLb(lbIndex + 1);
    if (e.key === "Tab") { /* fokusas lieka dialoge */
      const f = $$("button:not([hidden])", lb);
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  let tx = 0;
  lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50 && lbItems.length > 1) showLb(lbIndex + (dx < 0 ? 1 : -1)); });

  /* ---------- Modaliniai langai (paieška, krepšelis, paskyra) ---------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
  const stack = [];
  const visibleFocusables = (el) => $$(FOCUSABLE, el).filter((x) => x.offsetParent !== null && !x.closest("[hidden]"));
  const openers = {};
  AB.modal = {
    open(el, focusEl) {
      if (!el || !el.hidden) return;
      setMenu(false);
      stack.forEach((m) => this.close(m, false));
      el._opener = this._lastOpener || document.activeElement;
      this._lastOpener = null;
      el.hidden = false;
      stack.push(el);
      document.body.classList.add("no-scroll");
      onScroll();
      const panel = el.firstElementChild;
      if (hasGsap() && !reduceMotion() && panel) {
        const fromRight = el.classList.contains("drawer");
        gsap.fromTo(panel, fromRight ? { x: 40, opacity: 0 } : { y: -14, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.35, ease: "power3.out", clearProps: "transform,opacity" });
      }
      (focusEl || visibleFocusables(el)[0] || el).focus();
      el.dispatchEvent(new CustomEvent("ab:open"));
    },
    close(el, restore = true) {
      if (!el || el.hidden) return;
      el.hidden = true;
      stack.splice(stack.indexOf(el), 1);
      if (!stack.length && lb.hidden) document.body.classList.remove("no-scroll");
      onScroll();
      if (restore && el._opener && document.contains(el._opener)) el._opener.focus();
      el.dispatchEvent(new CustomEvent("ab:close"));
    },
    top: () => stack[stack.length - 1],
    register(name, fn) { openers[name] = fn; },
  };
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (opener && openers[opener.dataset.open]) {
      e.preventDefault();
      /* mobiliajame meniu esantis mygtukas paslepiamas, todėl fokusą grąžiname į meniu mygtuką */
      AB.modal._lastOpener = opener.closest(".mobile-menu") ? $(".burger") : opener;
      openers[opener.dataset.open](opener);
      return;
    }
    const top = AB.modal.top();
    if (!top) return;
    if (e.target === top || e.target.closest("[data-close]")) AB.modal.close(top);
    else if (e.target.closest("[data-close-link]")) AB.modal.close(top, false);
  });
  document.addEventListener("keydown", (e) => {
    const top = AB.modal.top();
    if (!top || !lb.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); AB.modal.close(top); }
    if (e.key === "Tab") {
      const f = visibleFocusables(top);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Trumpas pranešimas ---------- */
  let toastTimer;
  AB.toast = (text, opts = {}) => {
    const t = $("#toast");
    if (!t) return;
    $("#toastText").textContent = text;
    $(".toast__btn", t).hidden = !opts.cart; /* „Peržiūrėti“ rodomas tik krepšelio pranešimuose */
    t.hidden = false;
    if (hasGsap() && !reduceMotion()) gsap.fromTo(t, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), 4000);
  };

  /* ---------- Slapukai ir išorinis turinys (žemėlapis) ---------- */
  /* Sutikimo versija: pakeitus sutikimo lango turinį, padidinkite skaičių —
     langas vėl bus parodytas visiems lankytojams. */
  const CONSENT_KEY = "ab-consent-v2";
  try { localStorage.removeItem("ab-cookies"); } catch {} /* senos versijos įrašas */
  const map = $("#map");
  const loadMap = () => {
    if (!map || map.dataset.loaded || !map.dataset.src) return;
    map.dataset.loaded = "1";
    const f = document.createElement("iframe");
    f.title = "Dirbtuvės vieta žemėlapyje";
    f.src = map.dataset.src;
    f.loading = "lazy";
    f.referrerPolicy = "no-referrer-when-downgrade";
    map.innerHTML = "";
    map.appendChild(f);
  };
  if (map) {
    const b = $("#mapLoad");
    b && b.addEventListener("click", loadMap);
    if (store.get(CONSENT_KEY) === "all") loadMap();
  }
  const mapPlaceholder = map ? map.innerHTML : "";
  const unloadMap = () => {
    if (!map || !map.dataset.loaded) return;
    delete map.dataset.loaded;
    map.innerHTML = mapPlaceholder;
    const b = $("#mapLoad");
    b && b.addEventListener("click", loadMap);
  };
  const cookie = $("#cookie");
  if (cookie) {
    const prefs = $("#cookiePrefs", cookie);
    const ext = $("#ckExternal", cookie);
    const showBanner = (withPrefs = false) => {
      cookie.hidden = false;
      prefs.hidden = !withPrefs;
      ext.checked = store.get(CONSENT_KEY) === "all";
      $("[data-cookie='prefs']", cookie).setAttribute("aria-expanded", String(withPrefs));
    };
    const decide = (value) => {
      store.set(CONSENT_KEY, value);
      cookie.hidden = true;
      value === "all" ? loadMap() : unloadMap();
    };
    if (!store.get(CONSENT_KEY)) setTimeout(() => showBanner(false), 1200);
    $$("[data-cookie]", cookie).forEach((b) => b.addEventListener("click", () => {
      const v = b.dataset.cookie;
      if (v === "prefs") return showBanner(prefs.hidden);
      if (v === "save") return decide(ext.checked ? "all" : "necessary");
      decide(v);
    }));
    const open = $("#cookieOpen");
    open && open.addEventListener("click", () => showBanner(true));
  }
})();
