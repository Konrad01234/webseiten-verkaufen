/* =========================================================================
   KFZ-Service Filius – Rezensionsdaten für den Wasserfall
   -------------------------------------------------------------------------
   ⚠️  WICHTIG VOR DEM LIVEGANG:

   Nur die Einträge mit  quelle: "google"  stammen wirklich aus dem
   Google-Unternehmensprofil (aus den Screenshots übernommen, teilweise
   gekürzt, weil im Screenshot abgeschnitten).

   Alle Einträge mit  quelle: "platzhalter"  sind BEISPIELTEXTE, damit der
   Wasserfall gefüllt aussieht. Sie sind KEINE echten Kundenstimmen und
   müssen vor einer Veröffentlichung 1:1 durch echte Google-Rezensionen
   ersetzt (oder gelöscht) werden.

   Bearbeiten: einfach Objekte in diesem Array ändern – der Wasserfall,
   die Rezensionsseite und die Zähler bauen sich automatisch daraus auf.
   ========================================================================= */

window.FILIUS_REVIEWS = [
  /* ── Echte Google-Rezensionen (aus dem Unternehmensprofil) ───────────── */
  {
    name: "Bobi Robi",
    date: "vor 8 Monaten",
    stars: 5,
    text: "Der Service und die Leistungen stimmen beim Anbieter. Termine und Aufträge werden zuverlässig eingehalten.",
    quelle: "google",
  },
  {
    name: "Michael Juretzko",
    date: "vor einem Jahr",
    stars: 5,
    text: "Ich kann diese Werkstatt uneingeschränkt weiterempfehlen.",
    quelle: "google",
  },
  /* Hinweis: Die Google-Zusammenfassung („Leute sagen, die Mitarbeiter sind bei
     den Kosten ehrlich …“) steht bewusst NICHT in dieser Liste. Sie ist keine
     Kundenrezension und würde im Wasserfall – mit Avatar und Sternen – wie eine
     aussehen. Sie wird stattdessen als eigene Karte auf der Startseite und auf
     rezensionen.html ausgegeben. */

  /* ── PLATZHALTER – vor Veröffentlichung ersetzen ─────────────────────── */
  { name: "Sabine K.",   date: "vor 2 Monaten",  stars: 5, text: "Kostenvoranschlag war transparent, am Ende wurde es sogar etwas günstiger. So stellt man sich eine Werkstatt vor.", quelle: "platzhalter" },
  { name: "Thomas W.",   date: "vor 3 Monaten",  stars: 5, text: "Klimaanlage geprüft und befüllt – Termin morgens abgegeben, nachmittags fertig. Preis wie besprochen.", quelle: "platzhalter" },
  { name: "Ayse D.",     date: "vor 4 Monaten",  stars: 5, text: "Motorkontrollleuchte war an. Fehler wurde ausgelesen, erklärt und direkt behoben. Sehr freundliches Team.", quelle: "platzhalter" },
  { name: "Markus L.",   date: "vor 5 Monaten",  stars: 5, text: "Bremsen komplett erneuert. Faire Preise, saubere Arbeit, alles pünktlich fertig.", quelle: "platzhalter" },
  { name: "Jennifer B.", date: "vor 6 Monaten",  stars: 5, text: "Ölwechsel und Inspektion ohne lange Wartezeit. Man wird hier ehrlich beraten und nichts aufgeschwatzt.", quelle: "platzhalter" },
  { name: "Dennis P.",   date: "vor 7 Monaten",  stars: 5, text: "Auspuff war durch. Ersatzteil am nächsten Tag da, Fahrzeug am selben Tag wieder fahrbereit.", quelle: "platzhalter" },
  { name: "Katrin S.",   date: "vor 8 Monaten",  stars: 5, text: "Reifenwechsel inklusive Einlagerung. Unkompliziert, schnell und zu einem fairen Preis.", quelle: "platzhalter" },
  { name: "Ibrahim Y.",  date: "vor 9 Monaten",  stars: 5, text: "Achsvermessung nach einem Bordsteinkontakt. Fahrzeug zieht wieder sauber geradeaus. Top.", quelle: "platzhalter" },
  { name: "Petra H.",    date: "vor 10 Monaten", stars: 5, text: "Endlich eine Werkstatt, in der einem alles in Ruhe erklärt wird. Komme gerne wieder.", quelle: "platzhalter" },
  { name: "Stefan R.",   date: "vor 11 Monaten", stars: 5, text: "Getriebeproblem, das zwei andere Werkstätten nicht gefunden haben. Hier wurde es diagnostiziert und repariert.", quelle: "platzhalter" },
  { name: "Nadine M.",   date: "vor einem Jahr", stars: 5, text: "Elektrikfehler am Fensterheber. Schnell gefunden, günstig behoben. Sehr zu empfehlen.", quelle: "platzhalter" },
  { name: "Kevin T.",    date: "vor einem Jahr", stars: 5, text: "Kleine Delle und Kratzer an der Seitentür instand gesetzt. Sieht aus wie neu.", quelle: "platzhalter" },
  { name: "Christine A.",date: "vor einem Jahr", stars: 5, text: "Innenraum- und Luftfilter getauscht, während ich gewartet habe. Freundlich und flott.", quelle: "platzhalter" },
  { name: "Andreas F.",  date: "vor einem Jahr", stars: 5, text: "Fahrwerk überholt. Ehrliche Ansage, was wirklich nötig ist und was warten kann.", quelle: "platzhalter" },
  { name: "Melanie G.",  date: "vor einem Jahr", stars: 4, text: "Gute Arbeit zu fairen Preisen. Terminvergabe war in der Hochsaison etwas knapp, sonst top.", quelle: "platzhalter" },
  { name: "Ralf N.",     date: "vor 2 Jahren",   stars: 5, text: "Seit Jahren mein Betrieb des Vertrauens für alle unsere Firmenfahrzeuge.", quelle: "platzhalter" },
  { name: "Olaf Z.",     date: "vor 2 Jahren",   stars: 5, text: "Termin kurzfristig bekommen, Reparatur am selben Tag erledigt. Sehr kundenorientiert.", quelle: "platzhalter" },
  { name: "Sandra V.",   date: "vor 2 Jahren",   stars: 5, text: "Werkstatt, die noch mitdenkt. Wurde auf ein anstehendes Problem hingewiesen, bevor es teuer wurde.", quelle: "platzhalter" },
];
