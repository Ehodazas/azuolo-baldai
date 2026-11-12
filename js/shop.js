/* =========================================================
   Ąžuolo Baldai — paieška, krepšelis, paskyra
   ========================================================= */
(() => {
  const { $, $$, esc, store, plural, reduceMotion } = window.AB;
  const { isHome, P } = window.AB_PAGE || { isHome: false, P: "index.html" };
  const PROJECTS = window.AB_PROJECTS || [];
  const CATS = window.AB_CATEGORIES || {};
  const fmtNum = (n) => (Math.round(n * 100) / 100).toString().replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const eur = (n) => fmtNum(Math.round(n)) + " €";

  /* navigacija iš paieškos ar krepšelio: tame pačiame puslapyje — be perkrovimo */
  const go = (url) => {
    if (isHome && url.startsWith("#")) {
      const h = url.slice(1);
      if (AB.route && AB.route(h)) { history.replaceState(null, "", url); return; }
      const el = document.getElementById(h);
      if (el) { el.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" }); history.replaceState(null, "", url); return; }
    }
    location.href = url;
  };

  /* =========================================================
     PAIEŠKA
     ========================================================= */
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
  const STATIC = [
    ["Skiltis", "Apie mus", "Šeimos dirbtuvė Kaune, meistras nuo matavimo iki montavimo", `${P}#apie`, "imone dirbtuve"],
    ["Skiltis", "Paslaugos", "Virtuvės, spintos, stalai, kėdės, miegamojo ir svetainės baldai, restauravimas", `${P}#paslaugos`, ""],
    ["Skiltis", "Mūsų darbai", "Įgyvendintų projektų galerija su filtrais", `${P}#darbai`, "projektai galerija nuotraukos"],
    ["Skiltis", "Mediena", "Ąžuolas, uosis, riešutmedis, beržas", `${P}#mediena`, "medis masyvas"],
    ["Skiltis", "Tekstūrų ir apdailos pavyzdžiai", "Palyginkite du pavyzdžius greta", `${P}#pavyzdziai`, "apdaila spalva alyva lakas"],
    ["Skiltis", "Kaip dirbame", "Konsultacija, matavimas, 3D projektas, gamyba, montavimas", `${P}#procesas`, "procesas etapai terminai"],
    ["Skiltis", "Kainoraštis", "Orientacinės kainos 2026 m.", `${P}#kainos`, "kaina kainos"],
    ["Skiltis", "Stalo kainos skaičiuoklė", "Pasirinkite medieną, ilgį, plotį ir apdailą", `${P}#skaiciuokle`, "skaiciuokle stalas kaina"],
    ["Skiltis", "Atsiliepimai", "Ką sako mūsų klientai", `${P}#atsiliepimai`, ""],
    ["Skiltis", "DUK", "Dažniausiai užduodami klausimai", `${P}#duk`, "klausimai"],
    ["Skiltis", "Kontaktai ir užklausos forma", "Telefonas, el. paštas, dirbtuvės adresas, žemėlapis", `${P}#kontaktai`, "susisiekti adresas telefonas forma"],
    ["Baldai", "Spintos", "Užklausa su pasirinkta kategorija", `${P}#u-spinta`, "spinta drabuzine"],
    ["Informacija", "Pirkimo sąlygos", "Kaip užsakomi baldai pagal individualų užsakymą", "informacija.html#pirkimo-salygos", "sutartis uzsakymas"],
    ["Informacija", "Apmokėjimo sąlygos", "Avansas ir likusios sumos apmokėjimas", "informacija.html#apmokejimas", "mokejimas avansas"],
    ["Informacija", "Pristatymo sąlygos", "Pristatymas ir montavimas", "informacija.html#pristatymas", "pristatymas montavimas"],
    ["Informacija", "Akcijų sąlygos", "Akcijų ir nuolaidų taisyklės", "informacija.html#akcijos", "nuolaida"],
    ["Informacija", "Prekių grąžinimas", "Grąžinimo taisyklės", "informacija.html#grazinimas", "grazinti"],
    ["Informacija", "Garantija", "10 metų garantija masyvo konstrukcijoms", "informacija.html#garantija", ""],
    ["Informacija", "Baldų priežiūros vadovas", "Kaip prižiūrėti alyvuotą ir lakuotą medieną", "informacija.html#prieziura", "valymas alyva"],
    ["Informacija", "Garantinio aptarnavimo užklausa", "Praneškite apie defektą", `${P}#u-garantija`, "defektas gedimas pretenzija"],
    ["Informacija", "Naujienos", "Dirbtuvės naujienos", "informacija.html#naujienos", ""],
    ["Informacija", "Karjera", "Darbas dirbtuvėje", "informacija.html#karjera", "darbas cv"],
    ["Informacija", "Parama", "Paramos prašymai", "informacija.html#parama", ""],
    ["Informacija", "Privatumo politika", "Kaip tvarkomi jūsų duomenys", "privatumas.html", "duomenys slapukai"],
  ].map(([type, title, text, url, kw]) => ({ type, title, text, url, kw }));

  let index = null;
  const buildIndex = async () => {
    if (index) return index;
    const entries = [...STATIC];
    Object.entries(CATS).forEach(([k, c]) => {
      const n = PROJECTS.filter((p) => p.category === k).length;
      entries.push({ type: "Baldai", title: c.label, text: `${n} ${plural(n, "projektas", "projektai", "projektų")} galerijoje`, url: `${P}#f-${k}`, kw: c.one });
    });
    PROJECTS.forEach((p) => entries.push({ type: "Projektas", title: p.title, text: p.summary, url: `projektas.html#${encodeURIComponent(p.slug)}`, kw: (CATS[p.category] || {}).one }));
    let doc = isHome ? document : null;
    if (!doc) {
      try { doc = new DOMParser().parseFromString(await (await fetch("index.html", { cache: "force-cache" })).text(), "text/html"); } catch { doc = null; }
    }
    if (doc) {
      $$(".price-panel", doc).forEach((panel) => {
        const tab = $(`.tab[data-tab="${panel.id}"]`, doc);
        $$(".row", panel).forEach((r) => {
          const h = $("h4", r).cloneNode(true); $$("b", h).forEach((b) => b.remove());
          entries.push({ type: "Kaina", title: h.textContent.trim(), text: `${$("p", r)?.textContent || ""} · ${$(":scope > span", r)?.textContent || ""}`, url: `${P}#k-${panel.id}`, kw: tab ? tab.textContent : "" });
        });
      });
      $$(".faq__item", doc).forEach((d, i) => entries.push({ type: "DUK", title: $("summary", d).textContent, text: $(".faq__a", d).textContent.trim(), url: `${P}#duk-${i + 1}`, kw: "" }));
      $$(".wood", doc).forEach((w) => entries.push({ type: "Mediena", title: $("h3", w).textContent, text: $("p", w).textContent, url: `${P}#mediena`, kw: "mediena medis" }));
      $$(".sample", doc).forEach((s) => entries.push({ type: "Apdaila", title: $("h4", s).textContent, text: $("p", s).textContent, url: `${P}#pavyzdziai`, kw: "tekstura pavyzdys" }));
      $$(".card", doc).forEach((c) => entries.push({ type: "Paslauga", title: $(".card__tag", c).textContent, text: $("p", c).textContent, url: `${P}#paslaugos`, kw: "" }));
    }
    entries.forEach((e) => { e.nt = norm(e.title); e.nx = norm(`${e.text} ${e.kw} ${e.type}`); });
    return (index = entries);
  };
  const search = (q) => {
    const terms = norm(q).split(" ").filter(Boolean);
    if (!terms.length || !index) return [];
    return index.map((e) => {
      let score = 0;
      for (const t of terms) {
        const stem = t.length > 4 ? t.slice(0, -1) : t; /* paprasta lietuviškų galūnių tolerancija */
        if (e.nt.includes(t)) score += e.nt.startsWith(t) ? 6 : 4;
        else if (e.nt.includes(stem)) score += 3;
        else if (e.nx.includes(t) || e.nx.includes(stem)) score += 1;
        else return null;
      }
      return { e, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12).map((r) => r.e);
  };

  const sBox = $("#search");
  const sInput = $("#searchInput");
  const sList = $("#searchResults");
  const sHint = $("#searchHint");
  let results = [], active = -1;
  const SUGGEST = ["Virtuvės", "Valgomojo stalas", "Garantija", "Pristatymas", "Ąžuolas"];
  const renderResults = () => {
    const q = sInput.value.trim();
    if (!q) {
      results = [];
      sHint.innerHTML = `Populiaru: ${SUGGEST.map((s) => `<button type="button" class="search__chip">${esc(s)}</button>`).join("")}`;
    } else if (!results.length) {
      sHint.innerHTML = `Pagal „${esc(q)}“ nieko neradome. Pabandykite kitą žodį arba <a href="${P}#kontaktai" data-search-go>parašykite mums</a>.`;
    } else {
      sHint.textContent = `Rasta: ${results.length}`;
    }
    sList.innerHTML = results.map((r, i) => `
      <li role="option" id="sr-${i}" aria-selected="${i === active}">
        <a href="${esc(r.url)}" data-search-go tabindex="-1">
          <span class="sr__type">${esc(r.type)}</span>
          <span class="sr__main"><strong>${esc(r.title)}</strong><span>${esc(r.text)}</span></span>
          <svg aria-hidden="true"><use href="#i-arrow"/></svg>
        </a>
      </li>`).join("");
    sInput.setAttribute("aria-expanded", String(results.length > 0));
    if (active >= 0) sInput.setAttribute("aria-activedescendant", `sr-${active}`); else sInput.removeAttribute("aria-activedescendant");
  };
  const runSearch = async () => {
    if (!index) { sHint.textContent = "Ruošiama paieška…"; await buildIndex(); }
    results = search(sInput.value);
    active = results.length ? 0 : -1;
    renderResults();
  };
  let tmr;
  sInput.addEventListener("input", () => { clearTimeout(tmr); tmr = setTimeout(runSearch, 80); });
  sInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && results.length) { e.preventDefault(); active = (active + 1) % results.length; renderResults(); $(`#sr-${active}`).scrollIntoView({ block: "nearest" }); }
    if (e.key === "ArrowUp" && results.length) { e.preventDefault(); active = (active - 1 + results.length) % results.length; renderResults(); $(`#sr-${active}`).scrollIntoView({ block: "nearest" }); }
    if (e.key === "Enter") { e.preventDefault(); if (results[active]) { AB.modal.close(sBox, false); go(results[active].url); } }
  });
  sBox.addEventListener("click", (e) => {
    const chip = e.target.closest(".search__chip");
    if (chip) { sInput.value = chip.textContent; runSearch(); sInput.focus(); return; }
    const a = e.target.closest("[data-search-go]");
    if (a) { e.preventDefault(); AB.modal.close(sBox, false); go(a.getAttribute("href")); }
  });
  const openSearch = () => { AB.modal.open(sBox, sInput); sInput.select(); renderResults(); buildIndex(); };
  AB.modal.register("search", openSearch);
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
      if (AB.modal.top()) return;
      e.preventDefault(); openSearch();
    }
  });

  /* =========================================================
     KREPŠELIS (užsakymo užklausa, be apmokėjimo)
     ========================================================= */
  const KEY = "ab-cart";
  const valid = (i) => i && typeof i.id === "string" && typeof i.title === "string" && isFinite(i.price) && isFinite(i.qty) && i.qty > 0;
  const load = () => { try { const v = JSON.parse(store.get(KEY) || "[]"); return Array.isArray(v) ? v.filter(valid) : []; } catch { return []; } };
  let items = load();
  const stepOf = (i) => (i.unit === "m" ? 0.5 : 1);
  const qtyText = (i) => (i.unit === "m" ? `${fmtNum(i.qty)} m` : `${fmtNum(i.qty)} vnt.`);
  const priceText = (i) => `${i.from ? "nuo " : ""}${eur(i.price)}${i.unit === "m" ? "/m" : ""}`;
  const totals = () => ({
    sum: items.reduce((s, i) => s + i.price * i.qty, 0),
    from: items.some((i) => i.from),
    count: items.reduce((s, i) => s + (i.unit === "m" ? 1 : i.qty), 0),
  });
  const save = () => { store.set(KEY, JSON.stringify(items)); render(); };

  const cBox = $("#cart");
  const render = () => {
    const t = totals();
    $$("[data-cart-badge]").forEach((b) => { b.textContent = t.count; b.hidden = t.count === 0; });
    $$('[data-open="cart"].tool').forEach((b) => b.setAttribute("aria-label", t.count ? `Krepšelis, prekių: ${t.count}` : "Krepšelis tuščias"));
    $("#cartCount").textContent = t.count ? `(${t.count})` : "";
    $("#cartEmpty").hidden = items.length > 0;
    $("#cartFoot").hidden = items.length === 0;
    $("#cartTotal").textContent = `${t.from ? "nuo " : ""}${eur(t.sum)}`;
    $("#cartList").innerHTML = items.map((i) => `
      <li class="ci" data-id="${esc(i.id)}">
        <div class="ci__main">
          <strong>${esc(i.title)}</strong>
          ${i.detail ? `<span class="ci__detail">${esc(i.detail)}</span>` : ""}
          <span class="ci__price">${priceText(i)}</span>
        </div>
        <div class="ci__side">
          <div class="stepper" role="group" aria-label="Kiekis: ${esc(i.title)}">
            <button type="button" data-qty="-1" aria-label="Mažinti kiekį"><svg><use href="#i-minus"/></svg></button>
            <output aria-live="polite">${qtyText(i)}</output>
            <button type="button" data-qty="1" aria-label="Didinti kiekį"><svg><use href="#i-plus"/></svg></button>
          </div>
          <strong class="ci__sum">${i.from ? "nuo " : ""}${eur(i.price * i.qty)}</strong>
          <button class="ci__remove" type="button" data-remove aria-label="Pašalinti: ${esc(i.title)}"><svg><use href="#i-trash"/></svg></button>
        </div>
      </li>`).join("");
  };
  $("#cartList").addEventListener("click", (e) => {
    const li = e.target.closest(".ci");
    if (!li) return;
    const it = items.find((x) => x.id === li.dataset.id);
    const q = e.target.closest("[data-qty]");
    if (q && it) {
      const step = stepOf(it);
      it.qty = Math.max(step, Math.round((it.qty + step * +q.dataset.qty) * 2) / 2);
      if (it.unit !== "m") it.qty = Math.min(99, it.qty); else it.qty = Math.min(30, it.qty);
      save();
      $(`.ci[data-id="${CSS.escape(it.id)}"] [data-qty="${q.dataset.qty}"]`)?.focus();
    }
    if (e.target.closest("[data-remove]")) {
      const idx = items.indexOf(it);
      items.splice(idx, 1);
      save();
      const next = $$(".ci [data-remove]")[Math.min(idx, items.length - 1)];
      (next || $("#cartEmpty a") || cBox).focus();
    }
  });
  $("#cartClear").addEventListener("click", () => { items = []; save(); $("#cartEmpty a").focus(); });

  const summary = () => {
    const t = totals();
    const lines = items.map((i) => `• ${i.title}${i.detail ? ` (${i.detail})` : ""}: ${qtyText(i)} × ${priceText(i)} = ${i.from ? "nuo " : ""}${eur(i.price * i.qty)}`);
    lines.push(`Orientacinė suma: ${t.from ? "nuo " : ""}${eur(t.sum)}`);
    return { text: lines.join("\n").replace(/ /g, " "), count: t.count, total: `${t.from ? "nuo " : ""}${eur(t.sum)}` };
  };
  $("#cartCheckout").addEventListener("click", () => {
    if (!items.length) return;
    if (isHome && AB.forms) {
      AB.modal.close(cBox, false);
      AB.forms.attachCart(summary());
      $("#kontaktai").scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
      setTimeout(() => $("#f-name").focus({ preventScroll: true }), reduceMotion() ? 0 : 700);
    } else location.href = "index.html#u-krepselis";
  });

  AB.cart = {
    add(item) {
      const ex = items.find((x) => x.id === item.id);
      if (ex) ex.qty = Math.round((ex.qty + stepOf(ex)) * 2) / 2;
      else items.push({ qty: 1, ...item });
      save();
      AB.toast(`„${item.title}“ įdėta į krepšelį`, { cart: true });
    },
    clear() { items = []; save(); },
    summary,
    get count() { return totals().count; },
  };
  AB.modal.register("cart", () => AB.modal.open(cBox));
  window.addEventListener("storage", (e) => { if (e.key === KEY) { items = load(); render(); } });
  render();

  /* =========================================================
     MĖGSTAMI PROJEKTAI (saugoma naršyklėje)
     ========================================================= */
  const FKEY = "ab-favs";
  const loadFavs = () => {
    try { const v = JSON.parse(store.get(FKEY) || "[]"); return Array.isArray(v) ? v.filter((s) => PROJECTS.some((p) => p.slug === s)) : []; }
    catch { return []; }
  };
  let favs = loadFavs();
  const favListeners = [];
  const syncFavButtons = () => {
    $$("[data-fav]").forEach((b) => {
      const on = favs.includes(b.dataset.fav);
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-label", `${on ? "Pašalinti iš mėgstamų" : "Įsiminti projektą"}: ${b.dataset.title}`);
      const t = $(".fav__text", b); if (t) t.textContent = on ? "Įsiminta" : "Įsiminti";
    });
  };
  AB.favs = {
    has: (s) => favs.includes(s),
    list: () => favs.slice(),
    titles: () => favs.map((s) => (PROJECTS.find((p) => p.slug === s) || {}).title).filter(Boolean),
    toggle(s) {
      const i = favs.indexOf(s);
      if (i < 0) favs.push(s); else favs.splice(i, 1);
      store.set(FKEY, JSON.stringify(favs));
      syncFavButtons();
      favListeners.forEach((f) => f());
      return i < 0;
    },
    onChange: (f) => favListeners.push(f),
    sync: syncFavButtons,
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fav]");
    if (!b) return;
    e.preventDefault();
    const added = AB.favs.toggle(b.dataset.fav);
    AB.toast(added ? `„${b.dataset.title}“ įsimintas` : `„${b.dataset.title}“ pašalintas iš mėgstamų`);
  });
  window.addEventListener("storage", (e) => { if (e.key === FKEY) { favs = loadFavs(); syncFavButtons(); favListeners.forEach((f) => f()); } });

  /* =========================================================
     PASKYRA (reikia serverio; kol neprijungta — aiškus pranešimas)
     ========================================================= */
  const aBox = $("#account");
  const views = { login: $("#accLogin"), register: $("#accRegister"), reset: $("#accReset") };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const setView = (v) => {
    Object.entries(views).forEach(([k, f]) => (f.hidden = k !== v));
    $$(".acc__tab", aBox).forEach((t) => { const on = t.dataset.view === v; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", String(on)); });
    $(".acc__tabs", aBox).hidden = v === "reset";
    const first = $("input", views[v]); first && first.focus();
  };
  aBox.addEventListener("click", (e) => {
    const v = e.target.closest("[data-view]");
    if (v) setView(v.dataset.view);
    const pw = e.target.closest(".pw-toggle");
    if (pw) {
      const inp = $("input", pw.closest(".field"));
      const show = inp.type === "password";
      inp.type = show ? "text" : "password";
      pw.setAttribute("aria-pressed", String(show));
      pw.setAttribute("aria-label", show ? "Slėpti slaptažodį" : "Rodyti slaptažodį");
    }
  });
  const fieldErr = (input, msg) => {
    const wrap = input.closest(".field") || input.closest(".check");
    wrap.classList.toggle("is-error", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    let el = $(".field__msg", wrap);
    if (msg) { if (!el) { el = document.createElement("small"); el.className = "field__msg"; wrap.appendChild(el); } el.textContent = msg; }
    else if (el) el.remove();
  };
  const validateAcc = (f) => {
    const el = f.elements; let first = null;
    const mark = (i, m) => { fieldErr(i, m); if (m && !first) first = i; };
    if (el.name) mark(el.name, el.name.value.trim().length < 2 ? "Įrašykite vardą." : "");
    if (el.email) mark(el.email, !EMAIL_RE.test(el.email.value.trim()) ? "Įrašykite teisingą el. pašto adresą." : "");
    if (el.phone) { const v = el.phone.value.trim(); mark(el.phone, v && !/^\+?[0-9 ()-]{6,20}$/.test(v) ? "Patikrinkite telefono numerį." : ""); }
    if (el.password) {
      const v = el.password.value;
      if (f.dataset.action === "register") mark(el.password, v.length < 8 || !/[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]/.test(v) || !/\d/.test(v) ? "Slaptažodis turi būti bent 8 simbolių, su raidėmis ir skaičiais." : "");
      else mark(el.password, !v ? "Įrašykite slaptažodį." : "");
    }
    if (el.password2) mark(el.password2, el.password2.value !== el.password.value ? "Slaptažodžiai nesutampa." : "");
    if (el.consent) mark(el.consent, el.consent.checked ? "" : "Pažymėkite sutikimą.");
    return first;
  };
  const USER_KEY = "ab-user";
  const getUser = () => { try { return JSON.parse(sessionStorage.getItem(USER_KEY) || "null"); } catch { return null; } };
  const setUser = (u) => { try { u ? sessionStorage.setItem(USER_KEY, JSON.stringify(u)) : sessionStorage.removeItem(USER_KEY); } catch {} showUser(); };
  const showUser = () => {
    const u = getUser();
    $("#accUser").hidden = !u;
    $("#accForms").hidden = !!u;
    if (u) { $("#accName").textContent = u.name || u.email; $("#accEmail").textContent = u.email || ""; }
    $$(".tool--account").forEach((b) => { b.classList.toggle("is-in", !!u); b.setAttribute("aria-label", u ? `Paskyra: ${u.name || u.email}` : "Paskyra"); });
  };
  const call = async (payload) => {
    const endpoint = String((window.AB_CONFIG && window.AB_CONFIG.accountEndpoint) || "").trim();
    if (!endpoint) return { notConnected: true };
    const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(endpoint, { method: "POST", credentials: "same-origin", signal: ctrl.signal, headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
      let body = null; try { body = await res.json(); } catch {}
      return { res, body };
    } catch (e) { return { netError: e.name === "AbortError" ? "Serveris per ilgai neatsakė." : "Nepavyko susisiekti su serveriu." }; }
    finally { clearTimeout(tm); }
  };
  Object.values(views).forEach((f) => {
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (f.dataset.sending) return;
      const err = $(".form__err", f), ok = $(".form__ok", f);
      err.hidden = true; if (ok) ok.hidden = true;
      const bad = validateAcc(f);
      if (bad) { bad.focus(); return; }
      const btn = $('button[type="submit"]', f);
      f.dataset.sending = "1"; btn.disabled = true; const label = btn.innerHTML; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Palaukite…';
      const data = Object.fromEntries(new FormData(f)); delete data.password2;
      const r = await call({ action: f.dataset.action, ...data });
      f.dataset.sending = ""; btn.disabled = false; btn.innerHTML = label;
      if (r.notConnected) {
        err.textContent = "Paskyrų sistema dar neprijungta, todėl prisijungti ar užsiregistruoti kol kas negalima. Užklausą galite pateikti ir be paskyros.";
        err.hidden = false; return;
      }
      if (r.netError) { err.textContent = `${r.netError} Pabandykite dar kartą.`; err.hidden = false; return; }
      if (r.res.ok && r.body && r.body.ok === true) {
        if (f.dataset.action === "reset") { ok.hidden = false; return; }
        $$("input[type=password]", f).forEach((i) => (i.value = ""));
        setUser(r.body.user || { email: data.email, name: data.name });
        return;
      }
      if (r.body && r.body.errors) Object.entries(r.body.errors).forEach(([k, v]) => f.elements[k] && fieldErr(f.elements[k], String(v)));
      err.textContent = (r.body && r.body.error) || (r.res.status === 401 ? "Neteisingas el. paštas arba slaptažodis." : `Nepavyko (${r.res.status}). Pabandykite vėliau.`);
      err.hidden = false;
    });
    $$("input", f).forEach((i) => i.addEventListener(i.type === "checkbox" ? "change" : "input", () => fieldErr(i, "")));
  });
  $("#accLogout").addEventListener("click", async () => { await call({ action: "logout" }); setUser(null); setView("login"); });
  AB.modal.register("account", () => { showUser(); AB.modal.open(aBox, getUser() ? $("#accLogout") : null); if (!getUser()) setView("login"); });
  showUser();
})();
