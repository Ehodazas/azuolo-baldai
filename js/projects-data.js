/* =========================================================
   Ąžuolo Baldai — projektų duomenys
   ---------------------------------------------------------
   Vienas šaltinis darbų galerijai, projektų puslapiams ir
   „Baldai“ meniu skaičiams.

   KAIP PILDYTI
   - Laukai, kurių reikšmė null, viešame puslapyje NERODOMI.
     Įrašykite tekstą, kai turėsite patikrintus duomenis.
   - images: pirmoji nuotrauka yra pagrindinė. Pridėkite daugiau
     TO PATIES projekto nuotraukų, ir projekto puslapyje atsiras
     miniatiūrų galerija.
   - price: tekstas, pvz. "nuo 2 400 €" arba "3 150 €".
   - term:  tekstas, pvz. "5 savaitės".
   - specs: sąrašas papildomų eilučių, pvz.
       [{ label: "Furnitūra", value: "Blum" }]
   ========================================================= */
window.AB_CATEGORIES = {
  virtuve:    { label: "Virtuvės",   one: "Virtuvė",    formType: "virtuve" },
  stalai:     { label: "Stalai",     one: "Stalas",     formType: "stalai" },
  miegamasis: { label: "Miegamieji", one: "Miegamasis", formType: "miegamasis" },
  svetaine:   { label: "Svetainės",  one: "Svetainė",   formType: "svetaine" }
};

window.AB_PROJECTS = [
  {
    slug: "virtuve-su-atviromis-lentynomis",
    category: "virtuve",
    title: "Virtuvė su atviromis lentynomis",
    summary: "Tamsiai pilki rėminiai fasadai, šviesios atviros lentynos ir šviesus stalviršis.",
    description: null,
    images: [
      { src: "img/photo-1600489000022-c2086d79f9d4.jpg", alt: "Virtuvė su tamsiai pilkais fasadais ir atviromis medinėmis lentynomis" }
    ],
    materials: null, finish: null, dimensions: null, price: null, term: null, location: null, year: null, specs: []
  },
  {
    slug: "sviesi-virtuve",
    category: "virtuve",
    title: "Šviesi virtuvė",
    summary: "Balti fasadai, įmontuota technika ir šviesus, erdvus interjeras.",
    description: null,
    images: [
      { src: "img/photo-1484154218962-a197022b5858.jpg", alt: "Šviesi virtuvė su baltais fasadais ir įmontuota technika" }
    ],
    materials: null, finish: null, dimensions: null, price: null, term: null, location: null, year: null, specs: []
  },
  {
    slug: "valgomojo-stalas-su-reminemis-kojomis",
    category: "stalai",
    title: "Valgomojo stalas su rėminėmis kojomis",
    summary: "Medinis stalas su rėminėmis kojomis ir matomais sujungimais kampuose.",
    description: null,
    images: [
      { src: "img/photo-1615066390971-03e4e1c36ddf.jpg", alt: "Medinis valgomojo stalas su rėminėmis kojomis ir šešiomis kėdėmis" }
    ],
    materials: null, finish: null, dimensions: null, price: null, term: null, location: null, year: null, specs: []
  },
  {
    slug: "miegamasis-su-naktine-spintele",
    category: "miegamasis",
    title: "Miegamasis su naktine spintele",
    summary: "Šviesus miegamasis su medine naktine spintele ir sieniniu šviestuvu.",
    description: null,
    images: [
      { src: "img/photo-1522771739844-6a9f6d5f14af.jpg", alt: "Šviesus miegamasis su medine naktine spintele" }
    ],
    materials: null, finish: null, dimensions: null, price: null, term: null, location: null, year: null, specs: []
  },
  {
    slug: "svetaine-su-zalia-sofa",
    category: "svetaine",
    title: "Svetainė su žalia sofa",
    summary: "Šviesi svetainė su žalia sofa ir medinėmis grindimis.",
    description: null,
    images: [
      { src: "img/photo-1555041469-a586c61ea9bc.jpg", alt: "Svetainė su žalia sofa ir medinėmis grindimis" }
    ],
    materials: null, finish: null, dimensions: null, price: null, term: null, location: null, year: null, specs: []
  },
  {
    slug: "lofto-stiliaus-svetaine",
    category: "svetaine",
    title: "Lofto stiliaus svetainė",
    summary: "Erdvė su plytų siena, kavos staliuku ir baro zona prie langų.",
    description: null,
    images: [
      { src: "img/photo-1538688525198-9b88f6f53126.jpg", alt: "Lofto stiliaus svetainė su plytų siena ir baro zona" }
    ],
    materials: null, finish: null, dimensions: null, price: null, term: null, location: null, year: null, specs: []
  },
  {
    slug: "miegamasis-su-minkstu-galvugaliu",
    category: "miegamasis",
    title: "Miegamasis su minkštu galvūgaliu",
    summary: "Lova su minkštu galvūgaliu ir suolas lovos kojūgalyje.",
    description: null,
    images: [
      { src: "img/photo-1616594039964-ae9021a400a0.jpg", alt: "Miegamasis su minkštu lovos galvūgaliu ir suolu" }
    ],
    materials: null, finish: null, dimensions: null, price: null, term: null, location: null, year: null, specs: []
  },
  {
    slug: "svetaine-su-geltonu-foteliu",
    category: "svetaine",
    title: "Svetainė su geltonu foteliu",
    summary: "Šviesi svetainė su geltonu foteliu ir žema spintele prie sienos.",
    description: null,
    images: [
      { src: "img/photo-1586023492125-27b2c045efd7.jpg", alt: "Šviesi svetainė su geltonu foteliu" }
    ],
    materials: null, finish: null, dimensions: null, price: null, term: null, location: null, year: null, specs: []
  }
];
