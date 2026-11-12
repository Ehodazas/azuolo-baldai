# Ąžuolo Baldai — svetainė

Baldų iš masyvo dirbtuvės svetainė: projektų galerija, kainoraštis su stalo skaičiuokle, krepšelis (užsakymo užklausa), paieška, medienos pavyzdžiai, matavimo ir vizito registracija, užklausos forma.

Demonstracinė versija: nuotraukos iš Unsplash, atsiliepimai, įvertinimai ir kontaktai yra pavyzdiniai.

## Struktūra

| Kelias | Paskirtis |
|---|---|
| `index.html` | Pagrindinis puslapis |
| `projektas.html` | Projekto puslapis (`projektas.html#<projektas>` arba `?id=<projektas>`) |
| `informacija.html` | Pirkimo sąlygos, garantija, priežiūra (juodraštis) |
| `privatumas.html` | Privatumo politika (juodraštis) |
| `404.html` | Puslapis „Nerasta“ |
| `styles.css` | Visi stiliai |
| `main.js` | Pagrindinio puslapio logika ir animacijos |
| `js/` | Bendras kodas: išdėstymas, meniu, paieška, krepšelis, formos, projektų duomenys |
| `js/projects-data.js` | Projektų duomenys — čia pildomi nauji darbai |
| `config.js` | Formų ir paskyrų serverio adresai |
| `api/uzklausa.php` | Užklausų priėmimas ir siuntimas el. paštu |
| `img/` | Nuotraukos (`*-800.jpg` — lengvesnės kopijos telefonams) |

## Peržiūra kompiuteryje

Atidarykite `index.html` naršyklėje arba paleiskite vietinį serverį (Windows PowerShell):

```
powershell -ExecutionPolicy Bypass -File .claude/serve.ps1 -Root .
```

ir atidarykite http://localhost:5500.

## Paskelbimas

Formų prijungimas, paskyros ir kas pakeisti prieš paskelbiant — žr. [INTEGRACIJA.md](INTEGRACIJA.md).
