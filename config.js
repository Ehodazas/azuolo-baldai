/* =========================================================
   Svetainės nustatymai (naršyklės pusė)
   ---------------------------------------------------------
   formEndpoint — adresas, kuriuo formos siunčia užklausas.
   Įkėlus svetainę į PHP palaikantį serverį, įrašykite:
       formEndpoint: "api/uzklausa.php"
   Kol reikšmė tuščia, formos nieko nesiunčia ir rodo aiškią
   klaidą, o įvesti duomenys lieka formoje.

   Čia NEDĖKITE slaptų raktų ar slaptažodžių: šis failas
   matomas kiekvienam lankytojui. Gavėjo el. paštas ir kiti
   nustatymai laikomi serverio aplinkos kintamuosiuose
   (žr. INTEGRACIJA.md).
   ========================================================= */
/* accountEndpoint — paskyrų serverio adresas (prisijungimas,
   registracija, slaptažodžio atkūrimas). Kol tuščias, paskyros
   langas rodo, kad paskyrų sistema dar neprijungta. */
window.AB_CONFIG = {
  formEndpoint: "",
  accountEndpoint: "",
  maxFileSizeMB: 10,
  maxFiles: 5,
  maxTotalMB: 20
};
