# Užklausų siuntimo prijungimas

Abi svetainės formos (greita konsultacija ir išsami užklausa) jau paruoštos siųsti duomenis serveriui.
Kol siuntimas neprijungtas, formos **nieko nesiunčia**, rodo aiškią klaidą ir palieka įvestus duomenis.

## Kas jau padaryta

| Dalis | Failas | Ką daro |
|---|---|---|
| Naršyklės pusė | `js/forms.js` | Tikrina laukus, el. pašto formatą, failų tipą (JPG, PNG, PDF) ir dydį (iki 10 MB kiekvienas, iki 5 failų, iš viso iki 20 MB). Rodo siuntimo būseną, blokuoja pakartotinį paspaudimą, sėkmę rodo tik po teigiamo serverio atsakymo. |
| Nustatymai | `config.js` | `formEndpoint` – adresas, kuriuo siunčiamos užklausos. Dabar tuščias. |
| Serverio pusė | `api/uzklausa.php` | Dar kartą tikrina visus laukus ir failus (tikrą failo tipą pagal turinį), saugo nuo brukalo, siunčia laišką su priedais. |
| Įkėlimo ribos | `api/.user.ini` | Padidina PHP failų įkėlimo ribas (jei talpinimo paslauga leidžia). |

Brukalo apsauga: paslėptas laukas robotams, minimalus formos pildymo laikas (3 s), ne daugiau kaip 5 užklausos per 10 min. iš vieno IP adreso.

## Ko trūksta (reikia jūsų)

1. **Talpinimo paslauga su PHP 7.4 ar naujesne** ir veikiančia `mail()` funkcija (dauguma Lietuvos talpinimo paslaugų tai turi). Jei naudosite Netlify ar kitą statinį talpinimą be PHP, reikės kito sprendimo, pvz., serverless funkcijos.
2. **Gavėjo el. paštas** – kur turi ateiti užklausos.
3. **Siuntėjo adresas jūsų domene**, pvz. `svetaine@azuolobaldai.lt`. Kad laiškai nepatektų į brukalą, domenui reikia SPF (ir pageidautina DKIM) įrašų. Tai paprastai sutvarko talpinimo paslauga.
4. **Svetainės adresas**, kad serveris priimtų užklausas tik iš jūsų svetainės.

## Kaip prijungti

1. Talpinimo valdymo skydelyje nustatykite aplinkos kintamuosius (jei skydelis to neleidžia, galima naudoti `.htaccess` failą su `SetEnv`, jei serveris Apache):

   ```
   AB_MAIL_TO=jusu@pastas.lt
   AB_MAIL_FROM=svetaine@jusu-domenas.lt
   AB_ALLOWED_ORIGIN=https://jusu-domenas.lt
   ```

   Šių reikšmių **nerašykite** į `config.js` ar kitus viešus failus.

2. `config.js` faile įrašykite:

   ```js
   formEndpoint: "api/uzklausa.php",
   ```

3. Išbandykite formą siųsdami laišką **į savo** adresą. Patikrinkite, ar laiškas atėjo, ar matosi priedai ir ar laiškas nepateko į brukalo aplanką.

## Jei talpinimo paslauga reikalauja SMTP

Kai kurios paslaugos `mail()` neleidžia. Tada `api/uzklausa.php` faile `mail()` reikia pakeisti siuntimu per SMTP (pvz., PHPMailer biblioteka). SMTP prisijungimo duomenis taip pat laikykite tik aplinkos kintamuosiuose, pvz. `AB_SMTP_HOST`, `AB_SMTP_USER`, `AB_SMTP_PASS`.

## Krepšelis

Krepšelis veikia lankytojo naršyklėje (`localStorage`, raktas `ab-cart`) ir apmokėjimo nepriima.
Paspaudus „Pateikti užsakymo užklausą“, krepšelio turinys prisegamas prie išsamios užklausos formos lauku `cart`
ir siunčiamas tuo pačiu `api/uzklausa.php` keliu. Laiške krepšelis rodomas atskiru bloku.
Krepšelis išvalomas tik po sėkmingo išsiuntimo.

Jei ateityje norėsite apmokėjimo internetu, reikės el. parduotuvės sprendimo ir mokėjimų paslaugos (pvz., Paysera, Montonio, Stripe).
Tai mokamos paslaugos, todėl jų neprijungiau.

## Paskyros

Paskyros langas (prisijungimas, registracija, slaptažodžio atkūrimas) paruoštas naršyklės pusėje.
Paskyroms reikia serverio su duomenų baze, todėl serverio dalies neįdiegiau ir neišbandžiau. Kol `config.js` faile
`accountEndpoint` tuščias, langas rodo pranešimą, kad paskyrų sistema dar neprijungta.

Ko reikia iš jūsų: sprendimo, ką paskyra turi leisti daryti (pvz., matyti užklausų būseną, išsaugoti krepšelį), ir serverio
su duomenų baze (pvz., PHP + MySQL talpinimo paslaugoje) arba platformos, kuri paskyras jau turi.

Naršyklė siunčia `POST` užklausą į `accountEndpoint` su JSON turiniu ir slapuku (`credentials: same-origin`):

| `action` | Laukai | Sėkmingas atsakymas |
|---|---|---|
| `login` | `email`, `password` | `{"ok": true, "user": {"name": "...", "email": "..."}}` |
| `register` | `name`, `email`, `phone` (neprivaloma), `password`, `consent` | `{"ok": true, "user": {...}}` |
| `reset` | `email` | `{"ok": true}` (visada vienodas, kad nebūtų galima tikrinti, ar el. paštas registruotas) |
| `logout` | – | `{"ok": true}` |

Klaidos: `{"ok": false, "error": "Tekstas", "errors": {"laukas": "Tekstas"}}` su atitinkamu HTTP kodu (pvz., 401, 422, 429).
Serveris turi saugoti slaptažodžius tik `password_hash()` maiša, naudoti `HttpOnly` ir `Secure` sesijos slapukus,
riboti bandymų skaičių ir tikrinti užklausos kilmę (`Origin`).

## Prieš paskelbiant svetainę

- `sitemap.xml` ir `robots.txt` faile pakeiskite `https://www.azuolobaldai.lt` tikru svetainės adresu.
- Kai privatumo politika ir pirkėjo informacija nebebus juodraščiai, iš `privatumas.html` ir `informacija.html` pašalinkite `<meta name="robots" content="noindex">` ir įtraukite juos į `sitemap.xml`.
- Pridėję naują projektą į `js/projects-data.js`, įtraukite jo adresą (`projektas.html?id=...`) į `sitemap.xml`.
- `.htaccess` nustato puslapį „Nerasta“ (`404.html`), naršyklės talpyklą ir suspaudimą Apache serveryje. Netlify ir kitos paslaugos `404.html` dažniausiai naudoja automatiškai.

## Nuotraukos

Kiekviena `img/photo-*.jpg` nuotrauka (1600 px) turi lengvesnę kopiją `*-800.jpg`, kurią naršyklė telefone parenka automatiškai (`srcset`).
Pridėdami naują nuotrauką, sukurkite ir 800 px pločio kopiją tuo pačiu pavadinimu su `-800` gale.

## Vietinė peržiūra

Vietinis peržiūros serveris (`.claude/serve.ps1`) PHP nevykdo. Kompiuteryje formos visada rodys klaidą, kad siuntimas neprijungtas – taip ir turi būti.
