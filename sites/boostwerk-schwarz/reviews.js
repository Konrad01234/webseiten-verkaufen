/* =========================================================================
   REZENSIONEN  –  Datenquelle für den Wasserfall
   =========================================================================

   ⚠️  ACHTUNG: Die folgenden Texte sind PLATZHALTER, keine echten Google-
       Rezensionen. Die Google-Maps-Rezensionen konnten technisch nicht
       ausgelesen werden (siehe README).

   SO TAUSCHST DU SIE GEGEN DIE ECHTEN AUS
   ---------------------------------------
   1. Google-Maps-Eintrag öffnen → Reiter „Rezensionen“
   2. Für jede Rezension einen Eintrag nach diesem Muster anlegen:

        { name: "Max Mustermann", stars: 5, when: "vor 2 Monaten",
          text: "Originaltext der Rezension …" }

   3. Das Feld `platzhalter: true` ERSATZLOS LÖSCHEN.
      Solange auch nur ein Eintrag dieses Feld hat, blendet die Seite über
      dem Wasserfall einen gelben Warnhinweis ein. Ist das Feld überall
      entfernt, verschwindet der Hinweis von selbst.

   Die Gesamtnote und die Anzahl stehen in GOOGLE_RATING (unten) und sind
   die echten Werte aus dem Google-Profil.
   ========================================================================= */

const GOOGLE_RATING = {
  score: 5.0,
  count: 44,
  // Link zum Google-Profil – bitte durch den echten „Rezension schreiben“-Link ersetzen
  url: "https://www.google.com/maps/search/?api=1&query=Boostwerk+K%C3%B6ln+Pauline-Christmann-Stra%C3%9Fe+5+51107+K%C3%B6ln"
};

const REVIEWS = [
  { name: "Daniel K.",   stars: 5, when: "vor 3 Wochen",  platzhalter: true,
    text: "Kurzfristig einen Termin bekommen, Reifen gewechselt und ausgewuchtet – alles in unter einer Stunde. Preis war vorher klar, keine bösen Überraschungen. Sehr sympathisches Team." },

  { name: "Sandra M.",   stars: 5, when: "vor 1 Monat",   platzhalter: true,
    text: "Endlich eine Werkstatt, die einem nichts aufschwatzt. Es wurde mir genau gezeigt, was defekt ist und was noch warten kann. Fair und ehrlich." },

  { name: "Ahmet Y.",    stars: 5, when: "vor 2 Monaten", platzhalter: true,
    text: "Inspektion und HU in einem Rutsch erledigt. Auto war pünktlich fertig und innen sauberer als vorher. Klare Empfehlung für Köln-Ostheim." },

  { name: "Julia B.",    stars: 5, when: "vor 2 Monaten", platzhalter: true,
    text: "Bremsen vorne und hinten gemacht. Angebot per WhatsApp, Termin am nächsten Tag, Preis exakt wie besprochen. So muss das laufen." },

  { name: "Marco L.",    stars: 5, when: "vor 3 Monaten", platzhalter: true,
    text: "Habe schon einige Werkstätten durch – hier wird noch richtig geschraubt statt nur getauscht. Fehler war in 20 Minuten gefunden." },

  { name: "Nadine S.",   stars: 5, when: "vor 3 Monaten", platzhalter: true,
    text: "Super freundlich am Telefon und vor Ort. Ölwechsel spontan ohne Termin möglich gewesen. Wartebereich ist auch angenehm." },

  { name: "Kevin R.",    stars: 5, when: "vor 4 Monaten", platzhalter: true,
    text: "Kupplung getauscht an meinem Golf. Preis deutlich unter dem Angebot der Vertragswerkstatt und die Arbeit war sauber. Läuft wieder wie neu." },

  { name: "Tim H.",      stars: 5, when: "vor 4 Monaten", platzhalter: true,
    text: "Klimaanlage hat nicht mehr gekühlt. Wurde befüllt und gleich auf Dichtheit geprüft. Schnell, günstig, gut erklärt." },

  { name: "Laura W.",    stars: 5, when: "vor 5 Monaten", platzhalter: true,
    text: "Als Frau in der Werkstatt oft ein Thema – hier wurde mir auf Augenhöhe alles ruhig erklärt. Fühle mich gut aufgehoben." },

  { name: "Serkan D.",   stars: 5, when: "vor 5 Monaten", platzhalter: true,
    text: "Motorschaden befürchtet, war am Ende nur ein Sensor. Ehrliche Diagnose statt teurer Panikmache. Danke!" },

  { name: "Christian P.", stars: 5, when: "vor 6 Monaten", platzhalter: true,
    text: "Reifeneinlagerung und Wechsel im Frühjahr – reibungslos, gut organisiert und zum fairen Kurs." },

  { name: "Melanie F.",  stars: 5, when: "vor 6 Monaten", platzhalter: true,
    text: "Auspuff war abgerissen, konnte direkt vorbeikommen. Nach zwei Stunden war ich wieder unterwegs. Top Service." },

  { name: "Jonas E.",    stars: 5, when: "vor 7 Monaten", platzhalter: true,
    text: "Zahnriemenwechsel beim Audi. Alles dokumentiert, Rechnung transparent aufgeschlüsselt. Komme definitiv wieder." },

  { name: "Petra G.",    stars: 5, when: "vor 8 Monaten", platzhalter: true,
    text: "Kleine Werkstatt mit großem Können. Man merkt, dass da jemand mit Leidenschaft an den Autos arbeitet." },

  { name: "Robin T.",    stars: 5, when: "vor 9 Monaten", platzhalter: true,
    text: "Fahrwerk tiefergelegt und alles sauber vermessen. Beratung vorher war ehrlich, auch zu dem, was TÜV-technisch geht." }
];
