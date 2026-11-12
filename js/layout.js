/* =========================================================
   Ąžuolo Baldai — bendri visų puslapių elementai
   (ikonos, antraštės įrankiai, poraštė, paieškos, krepšelio
   ir paskyros langai). Tik HTML; elgsena — js/site.js, js/shop.js
   ========================================================= */
(() => {
  const isHome = !!document.getElementById("darbai");
  const P = isHome ? "" : "index.html";
  window.AB_PAGE = { isHome, P };

  /* ---------- Trūkstamos ikonos ---------- */
  const SYMBOLS = {
    "i-search": '<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    "i-user": '<circle cx="12" cy="8.5" r="3.8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    "i-bag": '<path d="M5 8h14l-1 12H6L5 8Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    "i-heart": '<path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.7 3.8 4.5 7.1 4.5c2 0 3.4 1.1 4.9 2.9 1.5-1.8 2.9-2.9 4.9-2.9 3.3 0 5.5 3.2 4.3 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z" style="fill: var(--fav-fill, none)" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    "i-plus":'<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    "i-minus": '<path d="M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    "i-trash": '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>',
    "i-eye": '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    "i-check": '<path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    "i-close": '<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    "i-arrow": '<path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    "i-phone": '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    "i-mail": '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m3.5 6.5 8.5 6 8.5-6" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    "i-pin": '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9" r="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    "i-clock": '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    "i-fb": '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8Z" fill="currentColor"/>',
    "i-ig": '<rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/>',
    "i-pt": '<path d="M12 3a9 9 0 0 0-3.3 17.4c-.1-.8-.1-2 0-2.8l1.1-4.6s-.3-.6-.3-1.4c0-1.3.8-2.3 1.7-2.3.8 0 1.2.6 1.2 1.3 0 .8-.5 2-.8 3.1-.2.9.5 1.7 1.4 1.7 1.7 0 3-1.8 3-4.4 0-2.3-1.6-3.9-4-3.9-2.7 0-4.3 2-4.3 4.2 0 .8.3 1.7.7 2.2l.1.4-.3 1c0 .2-.2.3-.4.2-1.2-.6-2-2.4-2-3.8 0-3.1 2.3-6 6.5-6 3.4 0 6.1 2.4 6.1 5.7 0 3.4-2.1 6.1-5.1 6.1-1 0-1.9-.5-2.3-1.1l-.6 2.4c-.2.9-.8 2-1.2 2.6A9 9 0 1 0 12 3Z" fill="currentColor"/>',
  };
  const missing = Object.entries(SYMBOLS).filter(([id]) => !document.getElementById(id));
  if (missing.length) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", "0"); s.setAttribute("height", "0"); s.setAttribute("aria-hidden", "true");
    s.style.position = "absolute";
    s.innerHTML = missing.map(([id, d]) => `<symbol id="${id}" viewBox="0 0 24 24">${d}</symbol>`).join("");
    document.body.prepend(s);
  }

  /* ---------- Antraštės įrankiai ---------- */
  const tools = document.querySelector("[data-tools]");
  if (tools) {
    tools.innerHTML = `
      <button class="tool" type="button" data-open="search" aria-haspopup="dialog" aria-controls="search" aria-label="Paieška svetainėje"><svg><use href="#i-search"/></svg></button>
      <button class="tool tool--account" type="button" data-open="account" aria-haspopup="dialog" aria-controls="account" aria-label="Paskyra"><svg><use href="#i-user"/></svg></button>
      <button class="tool" type="button" data-open="cart" aria-haspopup="dialog" aria-controls="cart" aria-label="Krepšelis"><svg><use href="#i-bag"/></svg><span class="tool__badge" data-cart-badge hidden>0</span></button>`;
  }
  const mfoot = document.querySelector(".mobile-menu__foot");
  if (mfoot) mfoot.insertAdjacentHTML("afterbegin", `<button class="btn btn--ghost btn--block" type="button" data-open="account"><svg><use href="#i-user"/></svg>Paskyra</button>`);

  /* ---------- Slapukų sutikimo langas (visuose puslapiuose) ---------- */
  if (!document.getElementById("cookie")) {
    document.body.insertAdjacentHTML("beforeend", `
    <div class="cookie" id="cookie" role="dialog" aria-labelledby="cookieTitle" hidden>
      <h2 class="cookie__title" id="cookieTitle">Tvarkyti sutikimą</h2>
      <p>Svetainė savo slapukų nenaudoja ir lankomumo statistikos nerenka. Jūsų pasirinkimas įsimenamas naršyklėje. Išorinis turinys (žemėlapis iš „Google Maps“) gali įrašyti savo slapukus, todėl jį įkeliame tik jums sutikus. <a href="privatumas.html#slapukai">Plačiau</a></p>
      <div class="cookie__prefs" id="cookiePrefs" hidden>
        <label class="pref">
          <span class="pref__text"><strong>Būtini</strong><small>Jūsų sutikimo pasirinkimui ir krepšeliui įsiminti. Visada įjungti.</small></span>
          <input type="checkbox" checked disabled aria-describedby="cookieTitle"><span class="switch" aria-hidden="true"></span>
        </label>
        <label class="pref">
          <span class="pref__text"><strong>Išorinis turinys</strong><small>„Google Maps“ žemėlapis kontaktų skiltyje.</small></span>
          <input type="checkbox" id="ckExternal"><span class="switch" aria-hidden="true"></span>
        </label>
      </div>
      <div class="cookie__actions">
        <button class="btn btn--sm" type="button" data-cookie="all">Priimti</button>
        <button class="btn btn--sm btn--ghost" type="button" data-cookie="necessary">Atmesti</button>
        <button class="cookie__link" type="button" data-cookie="prefs" aria-controls="cookiePrefs" aria-expanded="false">Peržiūrėti nuostatas</button>
        <button class="btn btn--sm btn--ghost cookie__save" type="button" data-cookie="save">Išsaugoti nuostatas</button>
      </div>
    </div>`);
  }

  /* ---------- Poraštė ---------- */
  const footer = document.querySelector("[data-footer]");
  if (footer) {
    const fl = (cat) => isHome ? `#f-${cat}" data-filter-link="${cat}` : `index.html#f-${cat}`;
    const ul = (type) => isHome ? `#u-${type}" data-form-link="${type}` : `index.html#u-${type}`;
    const hasCookie = !!document.getElementById("cookie");
    footer.innerHTML = `
      <div class="wrap">
        <div class="footer__top">
          <div class="footer__brand">
            <a href="${isHome ? "#" : "index.html"}" class="logo logo--light">
              <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="16" cy="16" r="5" fill="none" stroke="currentColor" stroke-width="1"/><path d="M16 1v30" stroke="currentColor" stroke-width="1"/></svg>
              <span class="logo__text"><strong>Ąžuolo</strong> Baldai</span>
            </a>
            <p>Rankų darbo baldai iš masyvo pagal individualų užsakymą. Gaminame Kaune nuo 2009 metų.</p>
            <ul class="footer__contacts">
              <li><svg><use href="#i-pin"/></svg><span>Dirbtuvė ir salonas: Pramonės pr. 00, Kaunas</span></li>
              <li><svg><use href="#i-phone"/></svg><a href="tel:+37060000000">+370 600 00000</a></li>
              <li><svg><use href="#i-mail"/></svg><a href="mailto:info@azuolobaldai.lt">info@azuolobaldai.lt</a></li>
              <li><svg><use href="#i-clock"/></svg><span>I–V 8:00–17:00</span></li>
            </ul>
            <div class="footer__social">
              <a href="#" aria-label="Facebook"><svg><use href="#i-fb"/></svg></a>
              <a href="#" aria-label="Instagram"><svg><use href="#i-ig"/></svg></a>
              <a href="#" aria-label="Pinterest"><svg><use href="#i-pt"/></svg></a>
            </div>
          </div>
          <nav class="footer__col" aria-label="Apie mus">
            <h4>Apie mus</h4>
            <a href="${P}#apie">Apie dirbtuvę</a>
            <a href="${P}#darbai">Mūsų darbai</a>
            <a href="${P}#atsiliepimai">Atsiliepimai</a>
            <a href="informacija.html#naujienos">Naujienos</a>
            <a href="informacija.html#karjera">Karjera</a>
            <a href="informacija.html#parama">Parama</a>
            <a href="${P}#kontaktai">Kontaktai</a>
          </nav>
          <nav class="footer__col" aria-label="Baldai">
            <h4>Baldai</h4>
            <a href="${fl("virtuve")}">Virtuvės</a>
            <a href="${ul("spinta")}">Spintos</a>
            <a href="${fl("stalai")}">Stalai ir kėdės</a>
            <a href="${fl("miegamasis")}">Miegamojo baldai</a>
            <a href="${fl("svetaine")}">Svetainės baldai</a>
            <a href="${P}#kainos">Kainoraštis</a>
          </nav>
          <nav class="footer__col" aria-label="Pirkimo informacija">
            <h4>Pirkimo informacija</h4>
            <a href="informacija.html#pirkimo-salygos">Pirkimo sąlygos</a>
            <a href="informacija.html#apmokejimas">Apmokėjimo sąlygos</a>
            <a href="informacija.html#pristatymas">Pristatymo sąlygos</a>
            <a href="informacija.html#akcijos">Akcijų sąlygos</a>
            <a href="privatumas.html">Privatumo politika</a>
          </nav>
          <nav class="footer__col" aria-label="Priežiūra ir garantija">
            <h4>Priežiūra ir garantija</h4>
            <a href="informacija.html#garantija">Garantija</a>
            <a href="informacija.html#prieziura">Baldų priežiūros vadovas</a>
            <a href="${ul("garantija")}">Garantinio aptarnavimo užklausa</a>
            <a href="informacija.html#grazinimas">Prekių grąžinimas</a>
            <a href="${P}#duk">DUK</a>
          </nav>
        </div>
        <div class="footer__bottom">
          <p>© <span data-year>2026</span> UAB „Ąžuolo Baldai“ · Įm. k. 000000000</p>
          <div><a href="privatumas.html">Privatumo politika</a><a href="informacija.html#pirkimo-salygos">Pirkimo sąlygos</a>${hasCookie ? '<button class="footer__cookie" id="cookieOpen" type="button">Slapukų nustatymai</button>' : ""}</div>
        </div>
      </div>`;
  }

  /* ---------- Paieška, krepšelis, paskyra, pranešimas ---------- */
  document.body.insertAdjacentHTML("beforeend", `
  <div class="search" id="search" role="dialog" aria-modal="true" aria-label="Paieška svetainėje" hidden>
    <div class="search__panel">
      <div class="search__bar">
        <svg aria-hidden="true"><use href="#i-search"/></svg>
        <input id="searchInput" type="search" placeholder="Ieškoti: virtuvė, stalas, garantija…" autocomplete="off" spellcheck="false"
          role="combobox" aria-expanded="false" aria-controls="searchResults" aria-autocomplete="list" aria-label="Paieškos frazė">
        <kbd class="search__kbd">Esc</kbd>
        <button class="search__close" type="button" data-close aria-label="Uždaryti paiešką"><svg><use href="#i-close"/></svg></button>
      </div>
      <div class="search__body">
        <p class="search__hint" id="searchHint" aria-live="polite"></p>
        <ul class="search__results" id="searchResults" role="listbox" aria-label="Paieškos rezultatai"></ul>
      </div>
    </div>
  </div>

  <div class="drawer" id="cart" role="dialog" aria-modal="true" aria-labelledby="cartTitle" hidden>
    <div class="drawer__panel">
      <div class="drawer__head">
        <h2 id="cartTitle">Krepšelis <span class="drawer__count" id="cartCount"></span></h2>
        <button class="icon-btn" type="button" data-close aria-label="Uždaryti krepšelį"><svg><use href="#i-close"/></svg></button>
      </div>
      <div class="drawer__body">
        <ul class="cart__list" id="cartList"></ul>
        <div class="cart__empty" id="cartEmpty">
          <span class="cart__emptyicon"><svg><use href="#i-bag"/></svg></span>
          <strong>Krepšelis tuščias</strong>
          <p>Į krepšelį galite įdėti kainoraščio prekes arba skaičiuoklėje sudarytą stalą ir pateikti vieną užsakymo užklausą.</p>
          <a class="btn btn--sm" href="${P}#kainos" data-close-link>Peržiūrėti kainoraštį</a>
        </div>
      </div>
      <div class="drawer__foot" id="cartFoot" hidden>
        <div class="cart__total"><span>Orientacinė suma</span><strong id="cartTotal"></strong></div>
        <p class="cart__note">Kainos orientacinės. Apmokėti internetu nereikia: galutinę kainą ir terminą patvirtinsime po matavimo.</p>
        <button class="btn btn--block" type="button" id="cartCheckout">Pateikti užsakymo užklausą <svg><use href="#i-arrow"/></svg></button>
        <button class="cart__clear" type="button" id="cartClear">Išvalyti krepšelį</button>
      </div>
    </div>
  </div>

  <div class="modal" id="account" role="dialog" aria-modal="true" aria-labelledby="accTitle" hidden>
    <div class="modal__panel">
      <button class="icon-btn modal__close" type="button" data-close aria-label="Uždaryti"><svg><use href="#i-close"/></svg></button>
      <div class="acc__user" id="accUser" hidden>
        <span class="acc__avatar"><svg><use href="#i-user"/></svg></span>
        <h2 class="h3">Sveiki, <span id="accName"></span></h2>
        <p class="muted" id="accEmail"></p>
        <button class="btn btn--ghost btn--block" type="button" id="accLogout">Atsijungti</button>
      </div>
      <div id="accForms">
        <h2 class="h3" id="accTitle">Paskyra</h2>
        <p class="muted acc__lead">Prisijungę galėsite matyti savo užklausas ir išsaugotą krepšelį bet kuriame įrenginyje.</p>
        <div class="acc__tabs" role="tablist" aria-label="Paskyros veiksmai">
          <button class="acc__tab is-active" type="button" role="tab" aria-selected="true" aria-controls="accLogin" data-view="login">Prisijungti</button>
          <button class="acc__tab" type="button" role="tab" aria-selected="false" aria-controls="accRegister" data-view="register">Registruotis</button>
        </div>

        <form class="acc__form" id="accLogin" data-action="login" role="tabpanel" novalidate>
          <div class="field"><label for="al-email">El. paštas</label><input id="al-email" name="email" type="email" autocomplete="username" required></div>
          <div class="field field--pw"><label for="al-pass">Slaptažodis</label><input id="al-pass" name="password" type="password" autocomplete="current-password" required><button class="pw-toggle" type="button" aria-label="Rodyti slaptažodį" aria-pressed="false"><svg><use href="#i-eye"/></svg></button></div>
          <button class="acc__link" type="button" data-view="reset">Pamiršote slaptažodį?</button>
          <button class="btn btn--block" type="submit">Prisijungti</button>
          <p class="form__err" role="alert" hidden></p>
        </form>

        <form class="acc__form" id="accRegister" data-action="register" role="tabpanel" novalidate hidden>
          <div class="field"><label for="ar-name">Vardas</label><input id="ar-name" name="name" autocomplete="name" maxlength="100" required></div>
          <div class="field"><label for="ar-email">El. paštas</label><input id="ar-email" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="ar-phone">Telefonas <span class="muted">(neprivaloma)</span></label><input id="ar-phone" name="phone" type="tel" autocomplete="tel" maxlength="25"></div>
          <div class="field field--pw"><label for="ar-pass">Slaptažodis</label><input id="ar-pass" name="password" type="password" autocomplete="new-password" minlength="8" required aria-describedby="ar-pass-hint"><button class="pw-toggle" type="button" aria-label="Rodyti slaptažodį" aria-pressed="false"><svg><use href="#i-eye"/></svg></button><small class="field__hint" id="ar-pass-hint">Bent 8 simboliai, raidės ir skaičiai.</small></div>
          <div class="field field--pw"><label for="ar-pass2">Pakartokite slaptažodį</label><input id="ar-pass2" name="password2" type="password" autocomplete="new-password" required><button class="pw-toggle" type="button" aria-label="Rodyti slaptažodį" aria-pressed="false"><svg><use href="#i-eye"/></svg></button></div>
          <label class="check"><input type="checkbox" name="consent" value="1" required><span>Sutinku su <a href="privatumas.html">privatumo politika</a>.</span></label>
          <button class="btn btn--block" type="submit">Sukurti paskyrą</button>
          <p class="form__err" role="alert" hidden></p>
        </form>

        <form class="acc__form" id="accReset" data-action="reset" novalidate hidden>
          <p class="muted">Įrašykite el. paštą, kuriuo registravotės. Atsiųsime nuorodą naujam slaptažodžiui sukurti.</p>
          <div class="field"><label for="ap-email">El. paštas</label><input id="ap-email" name="email" type="email" autocomplete="email" required></div>
          <button class="btn btn--block" type="submit">Siųsti nuorodą</button>
          <button class="acc__link" type="button" data-view="login">Grįžti į prisijungimą</button>
          <p class="form__err" role="alert" hidden></p>
          <p class="form__ok" role="status" hidden>Jei šiuo el. paštu yra paskyra, atsiuntėme nuorodą slaptažodžiui atkurti.</p>
        </form>
      </div>
    </div>
  </div>

  <div class="toast" id="toast" role="status" aria-live="polite" hidden>
    <span class="toast__icon"><svg><use href="#i-check"/></svg></span>
    <span class="toast__text" id="toastText"></span>
    <button class="toast__btn" type="button" data-open="cart">Peržiūrėti</button>
  </div>`);
})();
