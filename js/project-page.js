/* =========================================================
   Ąžuolo Baldai — projekto puslapis (projektas.html#<slug>; senas formatas ?id=<slug> irgi veikia)
   Rodomi tik užpildyti duomenų laukai (žr. js/projects-data.js)
   ========================================================= */
(() => {
  const { $, $$, esc, reduceMotion, hasGsap } = window.AB;
  const PROJECTS = window.AB_PROJECTS || [];
  const CATS = window.AB_CATEGORIES || {};
  const root = $("#project");
  const slug = new URLSearchParams(location.search).get("id") || decodeURIComponent(location.hash.slice(1));
  /* perėjus į kitą projektą tame pačiame puslapyje — atnaujiname turinį */
  window.addEventListener("hashchange", () => location.reload());
  const p = PROJECTS.find((x) => x.slug === slug);
  const filled = (v) => v !== null && v !== undefined && String(v).trim() !== "";

  if (!p) {
    document.title = "Projektas nerastas — Ąžuolo Baldai";
    root.innerHTML = `
      <nav class="crumbs" aria-label="Kelias"><a href="index.html#darbai"><svg><use href="#i-left"/></svg>Visi darbai</a></nav>
      <div class="pj__missing">
        <h1 class="pj__title">Projektas nerastas</h1>
        <p class="lead">Nuoroda gali būti pasenusi arba projektas dar nepaskelbtas.</p>
        <a class="btn" href="index.html#darbai">Grįžti į darbų galeriją</a>
      </div>`;
    return;
  }

  const cat = CATS[p.category] || { one: "", label: "" };
  const offerHref = `index.html#p-${encodeURIComponent(p.slug)}`;
  document.title = `${p.title} — Ąžuolo Baldai`;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.content = `${p.title}. ${p.summary}`;
  /* paieškos sistemoms — vienas pagrindinis projekto adresas (su ?id=, nes # dalies jos neindeksuoja) */
  const canon = document.createElement("link");
  canon.rel = "canonical";
  canon.href = new URL(`projektas.html?id=${encodeURIComponent(p.slug)}`, location.href).href;
  document.head.appendChild(canon);
  $$(".js-offer").forEach((a) => (a.href = offerHref));

  const specs = [
    ["Medžiagos", p.materials], ["Apdaila", p.finish], ["Matmenys", p.dimensions],
    ["Vieta", p.location], ["Metai", p.year],
    ...(p.specs || []).map((s) => [s.label, s.value]),
  ].filter(([, v]) => filled(v));
  const facts = [["Orientacinė kaina", p.price], ["Gamybos terminas", p.term]].filter(([, v]) => filled(v));
  const desc = Array.isArray(p.description) ? p.description.filter(filled) : filled(p.description) ? [p.description] : [];
  const imgs = p.images || [];

  root.innerHTML = `
    <nav class="crumbs" aria-label="Kelias">
      <a href="index.html#darbai"><svg><use href="#i-left"/></svg>Visi darbai</a>
      <span aria-hidden="true">/</span><a href="index.html#f-${esc(p.category)}">${esc(cat.label)}</a>
      <span aria-hidden="true">/</span><span aria-current="page">${esc(p.title)}</span>
    </nav>
    <article class="pj">
      <div class="pj__gallery">
        <button class="pj__main" type="button" id="pjMain" aria-label="Padidinti nuotrauką">
          <img id="pjMainImg" src="${esc(imgs[0].src)}" srcset="${AB.srcset(imgs[0].src)}" sizes="(max-width: 900px) 92vw, 56vw" alt="${esc(imgs[0].alt)}">
          <span class="pj__zoomhint"><svg><use href="#i-zoom"/></svg>Padidinti</span>
        </button>
        ${imgs.length > 1 ? `<div class="pj__thumbs" role="group" aria-label="Projekto nuotraukos">${imgs.map((im, i) => `
          <button class="pj__thumb${i === 0 ? " is-active" : ""}" type="button" data-i="${i}" aria-label="Rodyti ${i + 1} nuotrauką iš ${imgs.length}" aria-pressed="${i === 0}"><img src="${esc(AB.srcset(im.src) ? im.src.replace(/\.jpg$/, "-800.jpg") : im.src)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      </div>
      <div class="pj__info">
        <p class="eyebrow">${esc(cat.one)}</p>
        <h1 class="pj__title">${esc(p.title)}</h1>
        <button class="fav-btn" type="button" data-fav="${esc(p.slug)}" data-title="${esc(p.title)}" aria-pressed="false"><svg aria-hidden="true"><use href="#i-heart"/></svg><span class="fav__text">Įsiminti</span></button>
        <p class="pj__summary">${esc(p.summary)}</p>
        ${desc.length ? `<div class="pj__desc">${desc.map((d) => `<p>${esc(d)}</p>`).join("")}</div>` : ""}
        ${specs.length ? `<dl class="pj__specs">${specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
        ${facts.length ? `<div class="pj__facts">${facts.map(([k, v]) => `<div class="pj__fact"><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join("")}</div>` : ""}
        <div class="pj__cta">
          <p>Norite panašaus baldo? Pritaikysime jį jūsų erdvei ir pateiksime kainą bei terminą pagal jūsų matmenis.</p>
          <a class="btn" href="${offerHref}">Gauti panašaus baldo pasiūlymą <svg><use href="#i-arrow"/></svg></a>
          <a class="link-arrow" href="index.html#darbai">Grįžti į darbų galeriją <svg><use href="#i-arrow"/></svg></a>
        </div>
      </div>
    </article>`;

  AB.favs && AB.favs.sync();

  /* galerija ir padidinimas */
  let current = 0;
  const mainImg = $("#pjMainImg");
  const items = imgs.map((im) => ({ src: im.src, alt: im.alt, tag: cat.one, title: p.title, desc: p.summary }));
  $("#pjMain").addEventListener("click", (e) => AB.lightbox.open(items, current, e.currentTarget));
  $$(".pj__thumb").forEach((b) => b.addEventListener("click", () => {
    current = +b.dataset.i;
    mainImg.srcset = AB.srcset(imgs[current].src);
    mainImg.src = imgs[current].src;
    mainImg.alt = imgs[current].alt;
    $$(".pj__thumb").forEach((t) => { const on = t === b; t.classList.toggle("is-active", on); t.setAttribute("aria-pressed", String(on)); });
    if (hasGsap() && !reduceMotion()) gsap.fromTo(mainImg, { opacity: 0.4 }, { opacity: 1, duration: 0.35 });
  }));

  /* kiti projektai: pirmiau tos pačios kategorijos */
  const others = PROJECTS.filter((x) => x.slug !== p.slug)
    .sort((a, b) => (b.category === p.category) - (a.category === p.category))
    .slice(0, 3);
  if (others.length) {
    $("#pjMoreGrid").innerHTML = others.map((o) => {
      const c = CATS[o.category] || { one: "" };
      const href = `projektas.html#${encodeURIComponent(o.slug)}`;
      return `<li class="pcard">
        <a class="pcard__zoom pcard__img" href="${href}" tabindex="-1" aria-hidden="true"><img src="${esc(o.images[0].src)}" srcset="${AB.srcset(o.images[0].src)}" sizes="(max-width: 640px) 92vw, (max-width: 900px) 46vw, 30vw" alt="" loading="lazy" decoding="async"></a>
        <div class="pcard__body">
          <span class="pcard__tag">${esc(c.one)}</span>
          <h3>${esc(o.title)}</h3>
          <p>${esc(o.summary)}</p>
          <a class="btn btn--sm btn--ghost pcard__link" href="${href}">Peržiūrėti projektą <svg><use href="#i-arrow"/></svg></a>
        </div>
      </li>`;
    }).join("");
    $("#pjMore").hidden = false;
  }

  if (hasGsap() && !reduceMotion()) {
    gsap.from(".pj__main", { clipPath: "inset(8% 8% 8% 8% round 22px)", duration: 1.1, ease: "expo.out" });
    gsap.from(".pj__info > *", { y: 20, opacity: 0, duration: 0.7, stagger: 0.06, ease: "power3.out", delay: 0.1, clearProps: "transform,opacity" });
  }
})();
