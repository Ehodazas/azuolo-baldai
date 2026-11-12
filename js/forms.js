/* =========================================================
   Ąžuolo Baldai — užklausų formos
   ---------------------------------------------------------
   - tikrina laukus naršyklėje (serveris tikrina dar kartą)
   - siunčia FormData į AB_CONFIG.formEndpoint
   - sėkmė rodoma TIK po teigiamo serverio atsakymo
   - nepavykus duomenys lieka formoje
   ========================================================= */
(() => {
  const { $, $$, reduceMotion, hasGsap } = window.AB;
  const cfg = Object.assign({ formEndpoint: "", maxFileSizeMB: 10, maxFiles: 5, maxTotalMB: 20 }, window.AB_CONFIG || {});
  const MB = 1024 * 1024;
  const ALLOWED_EXT = ["jpg", "jpeg", "png", "pdf"];
  const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"];
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/;
  const CONTACT_FALLBACK = "Paskambinkite +370 600 00000 arba rašykite info@azuolobaldai.lt.";
  const loadedAt = Date.now();

  /* ---------- Matavimo / vizito data ---------- */
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const dayOffset = (n) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  const visitDateError = (v) => {
    if (!v) return "Pasirinkite pageidaujamą datą.";
    const [y, m, d] = v.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (isNaN(date)) return "Patikrinkite datą.";
    if (date < dayOffset(1)) return "Pasirinkite datą nuo rytojaus.";
    if (date > dayOffset(90)) return "Pasirinkite datą per artimiausius 3 mėnesius.";
    if (date.getDay() === 0) return "Sekmadieniais nedirbame. Pasirinkite kitą dieną.";
    return "";
  };

  const fmtSize = (b) => (b >= MB ? (b / MB).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");

  /* ---------- Lauko klaidos ---------- */
  const setFieldError = (input, msg) => {
    const wrap = input.closest(".field") || input.closest(".check");
    if (!wrap) return;
    wrap.classList.toggle("is-error", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    let el = $(".field__msg", wrap);
    if (msg) {
      if (!el) {
        el = document.createElement("small");
        el.className = "field__msg";
        el.id = (input.id || input.name) + "-err";
        wrap.appendChild(el);
      }
      el.textContent = msg;
      input.setAttribute("aria-describedby", el.id);
    } else if (el) {
      el.remove();
      input.removeAttribute("aria-describedby");
    }
  };

  /* ---------- Failų patikra ---------- */
  const checkFiles = (input) => {
    const files = [...(input.files || [])];
    const problems = [];
    let total = 0;
    const rows = files.map((f) => {
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      total += f.size;
      let err = "";
      if (!ALLOWED_EXT.includes(ext) || (f.type && !ALLOWED_MIME.includes(f.type))) err = "netinkamas formatas (leidžiama JPG, PNG, PDF)";
      else if (f.size > cfg.maxFileSizeMB * MB) err = `per didelis (daugiau nei ${cfg.maxFileSizeMB} MB)`;
      if (err) problems.push(`${f.name}: ${err}`);
      return { f, err };
    });
    if (files.length > cfg.maxFiles) problems.push(`Galima pridėti ne daugiau kaip ${cfg.maxFiles} failus.`);
    if (total > cfg.maxTotalMB * MB) problems.push(`Bendras failų dydis viršija ${cfg.maxTotalMB} MB.`);
    return { rows, problems };
  };
  const renderFileList = (input) => {
    const list = $("#fileList");
    if (!list) return;
    const { rows, problems } = checkFiles(input);
    list.innerHTML = rows.map(({ f, err }) =>
      `<li class="${err ? "is-bad" : ""}"><svg><use href="#i-file"/></svg><span class="upload__name">${AB.esc(f.name)}</span><span class="upload__size">${err ? AB.esc(err) : fmtSize(f.size)}</span></li>`).join("");
    list.hidden = rows.length === 0;
    const t = $(".upload__text", input.closest(".upload"));
    if (t) t.innerHTML = rows.length
      ? `${rows.length} ${AB.plural(rows.length, "failas pasirinktas", "failai pasirinkti", "failų pasirinkta")} <small>Spauskite, jei norite pakeisti</small>`
      : `Pridėti eskizą ar nuotrauką <small>JPG, PNG arba PDF, iki ${cfg.maxFileSizeMB} MB kiekvienas, ne daugiau kaip ${cfg.maxFiles} failai</small>`;
    setFieldError(input, problems.length ? problems.join(" ") : "");
    return problems.length === 0;
  };

  /* ---------- Visos formos tikrinimas ---------- */
  const validate = (form) => {
    let firstBad = null;
    const mark = (input, msg) => { setFieldError(input, msg); if (msg && !firstBad) firstBad = input; };
    const name = form.elements.name, phone = form.elements.phone, email = form.elements.email, consent = form.elements.consent, msg = form.elements.msg;
    if (name) { const v = name.value.trim(); mark(name, !v ? "Įrašykite vardą." : v.length < 2 ? "Vardas per trumpas." : ""); }
    if (phone) { const v = phone.value.trim(); mark(phone, !v ? "Įrašykite telefono numerį." : !PHONE_RE.test(v) || v.replace(/\D/g, "").length < 6 ? "Patikrinkite telefono numerį, pvz. +370 600 00000." : ""); }
    if (email) { const v = email.value.trim(); mark(email, v && !EMAIL_RE.test(v) ? "Patikrinkite el. pašto adresą, pvz. vardas@pastas.lt." : ""); }
    if (msg) mark(msg, msg.value.length > 3000 ? "Žinutė per ilga (daugiausia 3000 simbolių)." : "");
    if (consent) mark(consent, consent.checked ? "" : "Pažymėkite sutikimą, kad galėtume atsakyti į užklausą.");
    const vt = form.querySelector('input[name="visit_type"]:checked');
    if (vt && vt.value && form.elements.visit_date) mark(form.elements.visit_date, visitDateError(form.elements.visit_date.value));
    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput && !renderFileList(fileInput) && !firstBad) firstBad = fileInput;
    return firstBad;
  };

  /* ---------- Būsenos ---------- */
  const showError = (form, text) => {
    const el = $(".form__err", form);
    $(".form__ok", form).hidden = true;
    el.textContent = text;
    el.hidden = false;
    if (hasGsap() && !reduceMotion()) gsap.fromTo(el, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
  };
  const setSending = (form, on) => {
    const btn = form.querySelector('button[type="submit"]');
    form.dataset.sending = on ? "1" : "";
    form.setAttribute("aria-busy", String(on));
    btn.disabled = on;
    if (on) { btn.dataset.label = btn.innerHTML; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Siunčiama…'; }
    else if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
  };

  const submit = async (form) => {
    if (form.dataset.sending) return; /* apsauga nuo pakartotinio paspaudimo */
    $(".form__ok", form).hidden = true;
    $(".form__err", form).hidden = true;

    const bad = validate(form);
    if (bad) {
      bad.focus();
      if (hasGsap() && !reduceMotion()) gsap.fromTo($$(".is-error", form), { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.35)" });
      return;
    }
    /* brukalo apsauga: užpildytas paslėptas laukas — nesiunčiame */
    if (form.elements.website && form.elements.website.value) return;

    const endpoint = String((window.AB_CONFIG && window.AB_CONFIG.formEndpoint) || "").trim();
    if (!endpoint) {
      showError(form, `Užklausų siuntimas dar neprijungtas, todėl jūsų užklausa neišsiųsta. Duomenys liko formoje. ${CONTACT_FALLBACK}`);
      return;
    }

    const data = new FormData(form);
    data.set("form_type", form.dataset.form || "full");
    data.set("elapsed_ms", String(Date.now() - loadedAt));
    data.set("page", location.pathname + location.search);

    setSending(form, true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    try {
      const res = await fetch(endpoint, { method: "POST", body: data, signal: ctrl.signal, headers: { Accept: "application/json" } });
      let body = null;
      try { body = await res.json(); } catch {}
      if (res.ok && body && body.ok === true) {
        form.reset();
        const fi = form.querySelector('input[type="file"]'); if (fi) renderFileList(fi);
        if (form.id === "form") {
          AB.forms.syncVisit();
          AB.forms.detachFavs();
          const hadCart = !!$("#f-cart").value;
          AB.forms.clearProject();
          AB.forms.detachCart();
          if (hadCart && AB.cart) AB.cart.clear(); /* krepšelis išvalomas tik po sėkmingo išsiuntimo */
        }
        $$(".is-error", form).forEach((w) => w.classList.remove("is-error"));
        const ok = $(".form__ok", form);
        ok.hidden = false;
        if (hasGsap() && !reduceMotion()) gsap.from(ok, { y: 8, opacity: 0, duration: 0.4 });
        ok.focus?.();
        return;
      }
      if (body && body.errors && typeof body.errors === "object") {
        let first = null;
        Object.entries(body.errors).forEach(([k, v]) => {
          const input = form.elements[k] || form.elements[k + "[]"];
          if (input && input.nodeType === 1) { setFieldError(input, String(v)); first = first || input; }
        });
        first && first.focus();
      }
      const reason = res.status === 429 ? "Per daug užklausų per trumpą laiką. Pabandykite po kelių minučių."
        : (body && body.error) ? body.error
        : `Serveris atsakė klaida (${res.status}).`;
      showError(form, `Užklausos išsiųsti nepavyko. ${reason} Duomenys liko formoje. ${CONTACT_FALLBACK}`);
    } catch (e) {
      const reason = e.name === "AbortError" ? "Serveris per ilgai neatsakė." : "Nepavyko susisiekti su serveriu. Patikrinkite interneto ryšį.";
      showError(form, `Užklausos išsiųsti nepavyko. ${reason} Duomenys liko formoje. ${CONTACT_FALLBACK}`);
    } finally {
      clearTimeout(timer);
      setSending(form, false);
    }
  };

  $$(".js-form").forEach((form) => {
    form.addEventListener("submit", (e) => { e.preventDefault(); submit(form); });
    $$("input, select, textarea", form).forEach((i) => {
      if (i.type === "file") i.addEventListener("change", () => renderFileList(i));
      else i.addEventListener(i.type === "checkbox" ? "change" : "input", () => setFieldError(i, ""));
    });
    /* el. paštas tikrinamas palikus lauką */
    const em = form.elements.email;
    em && em.addEventListener("blur", () => { const v = em.value.trim(); setFieldError(em, v && !EMAIL_RE.test(v) ? "Patikrinkite el. pašto adresą, pvz. vardas@pastas.lt." : ""); });
  });

  /* ---------- Projekto ir kategorijos perdavimas į formą ---------- */
  const full = $("#form");
  AB.forms = {
    setType(type) {
      $$("select[name='type']").forEach((s) => { if ([...s.options].some((o) => o.value === type)) s.value = type; });
    },
    setProject(project) {
      if (!full || !project) return;
      $("#f-project").value = project.title;
      $("#projectChipName").textContent = `„${project.title}“`;
      $("#projectChip").hidden = false;
      const cat = (window.AB_CATEGORIES || {})[project.category];
      if (cat) this.setType(cat.formType);
      const msg = $("#f-msg");
      const line = `Domina panašus baldas kaip projekte „${project.title}“.`;
      if (!msg.value.includes(line)) msg.value = msg.value ? `${line}\n${msg.value}` : `${line}\n`;
    },
    clearProject() {
      if (!full) return;
      const name = $("#f-project").value;
      $("#f-project").value = "";
      $("#projectChip").hidden = true;
      const msg = $("#f-msg");
      if (name) msg.value = msg.value.replace(`Domina panašus baldas kaip projekte „${name}“.\n`, "").replace(`Domina panašus baldas kaip projekte „${name}“.`, "");
    },
  };
  /* krepšelis siunčiamas atskiru lauku „cart“; formoje rodoma santrauka */
  AB.forms.attachCart = (s) => {
    if (!full || !s || !s.count) return;
    $("#f-cart").value = s.text;
    $("#cartChipText").textContent = `${s.count} ${AB.plural(s.count, "prekė", "prekės", "prekių")}, ${s.total.replace(/ /g, " ")}`;
    $("#cartChip").hidden = false;
  };
  AB.forms.detachCart = () => {
    if (!full) return;
    $("#f-cart").value = "";
    $("#cartChip").hidden = true;
  };
  /* matavimas / vizitas */
  const visitWhen = $("#visitWhen");
  const visitDate = $("#f-visit-date");
  if (visitDate) { visitDate.min = iso(dayOffset(1)); visitDate.max = iso(dayOffset(90)); }
  AB.forms.syncVisit = () => {
    if (!visitWhen) return;
    const v = $('input[name="visit_type"]:checked', full);
    visitWhen.hidden = !v || !v.value;
    if (visitWhen.hidden) setFieldError(visitDate, "");
  };
  AB.forms.setVisit = (type) => {
    const r = full && $(`input[name="visit_type"][value="${type}"]`, full);
    if (r) { r.checked = true; AB.forms.syncVisit(); }
  };
  full && $$('input[name="visit_type"]', full).forEach((r) => r.addEventListener("change", AB.forms.syncVisit));

  /* mėgstami projektai prie užklausos */
  AB.forms.attachFavs = (titles) => {
    if (!full || !titles.length) return;
    $("#f-favs").value = titles.join("; ");
    $("#favsChipText").textContent = `${titles.length} ${AB.plural(titles.length, "projektas", "projektai", "projektų")}`;
    $("#favsChip").hidden = false;
  };
  AB.forms.detachFavs = () => {
    if (!full) return;
    $("#f-favs").value = "";
    $("#favsChip").hidden = true;
  };
  const fclr = $("#favsChipClear");
  fclr && fclr.addEventListener("click", () => AB.forms.detachFavs());

  const clr = $("#projectChipClear");
  clr && clr.addEventListener("click", () => AB.forms.clearProject());
  const cclr = $("#cartChipClear");
  cclr && cclr.addEventListener("click", () => AB.forms.detachCart());
})();
