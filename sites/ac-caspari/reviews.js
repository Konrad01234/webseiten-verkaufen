/* =========================================================================
   REZENSIONEN  –  Datenquelle für den Wasserfall
   =========================================================================

   ⚠️  ACHTUNG: Die folgenden Texte sind PLATZHALTER, keine echten
       Rezensionen von AC Caspari. Die Google-Maps-Rezensionen ließen sich
       technisch nicht auslesen – alle Branchenportale blockieren den
       automatisierten Abruf (siehe README, Abschnitt „Rezensionen“).

   ⚠️  UND WICHTIG: In den Branchenverzeichnissen stehen für diesen Betrieb
       GEMISCHTE Bewertungen – nicht nur Lob (golocal 3,5/5 · 11880 4,0/5 ·
       autoplenum 2,4/5). Es wäre also falsch, hier fünfzehn Fünf-Sterne-
       Texte stehen zu lassen und als echt auszugeben. Bitte die echten
       Google-Rezensionen eintragen, auch die kritischen.

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

   4. In GOOGLE_RATING die echte Gesamtnote, die Anzahl und den Link zum
      Google-Profil eintragen und `unbestaetigt: true` löschen.
      Solange dieses Feld gesetzt ist, zeigt die Seite an den Stellen mit
      der Bewertung nichts Erfundenes an, sondern einen neutralen Hinweis.
   ========================================================================= */

const GOOGLE_RATING = {
  unbestaetigt: true,          // ⚠️ löschen, sobald die echten Werte drinstehen
  score: null,                 // z. B. 4.6
  count: null,                 // z. B. 38
  // Suchlink auf den Eintrag – bitte durch die echte Google-Profil-URL ersetzen
  url: "https://www.google.com/maps/search/?api=1&query=AC+Caspari+Alter+Uentroper+Weg+189+59071+Hamm"
};

const REVIEWS = [
  { name: "Michael B.", stars: 5, when: "vor 3 Wochen", platzhalter: true,
    text: "Inspektion am BMW – alle Teile lagen vorher bereit, nach zwei Stunden war ich wieder unterwegs. Preis wie besprochen, keine Überraschungen." },

  { name: "Sabine K.", stars: 5, when: "vor 1 Monat", platzhalter: true,
    text: "Kurzfristig einen Termin bekommen, schnell und freundlich erledigt. Man merkt, dass hier ein Meister am Werk ist." },

  { name: "Thomas W.", stars: 4, when: "vor 1 Monat", platzhalter: true,
    text: "Bremsen vorne gemacht, sauber gearbeitet und fair abgerechnet. Ein Anruf zwischendurch, dass es etwas später wird, wäre schön gewesen." },

  { name: "Andrea M.", stars: 5, when: "vor 2 Monaten", platzhalter: true,
    text: "Endlich eine Werkstatt, die einem nichts aufschwatzt. Mir wurde genau gezeigt, was gemacht werden muss und was noch warten kann." },

  { name: "Dennis R.", stars: 5, when: "vor 2 Monaten", platzhalter: true,
    text: "HU stand an, alles über die Werkstatt abgewickelt. Termin, Vorabcheck und Plakette in einem Rutsch – so soll das sein." },

  { name: "Petra H.", stars: 4, when: "vor 3 Monaten", platzhalter: true,
    text: "Ölwechsel und Urlaubscheck vor der Fahrt nach Italien. Freundlich, zügig, und die Rechnung war nachvollziehbar aufgeschlüsselt." },

  { name: "Ahmet Y.", stars: 5, when: "vor 3 Monaten", platzhalter: true,
    text: "Fehlerspeicher ausgelesen und den Defekt gefunden, wo zwei andere Werkstätten nur geraten haben. Top Preise und sympathisches Team." },

  { name: "Julia S.", stars: 5, when: "vor 4 Monaten", platzhalter: true,
    text: "Klimaanlage hat nicht mehr gekühlt. Wurde befüllt und gleich auf Dichtheit geprüft, alles ruhig erklärt. Fühle mich gut aufgehoben." },

  { name: "Frank L.", stars: 4, when: "vor 5 Monaten", platzhalter: true,
    text: "Reifenwechsel samt Einlagerung. Gut organisiert, Preis in Ordnung, Wartezeit hielt sich im Rahmen." },

  { name: "Kerstin D.", stars: 5, when: "vor 5 Monaten", platzhalter: true,
    text: "Kleine Werkstatt mit großem Können. Auto war pünktlich fertig und die Garantie beim jungen Gebrauchten bleibt trotzdem erhalten." },

  { name: "Marco P.", stars: 5, when: "vor 6 Monaten", platzhalter: true,
    text: "Zahnriemenwechsel beim Golf. Deutlich günstiger als in der Vertragswerkstatt und alles ordentlich dokumentiert." },

  { name: "Nadine E.", stars: 5, when: "vor 7 Monaten", platzhalter: true,
    text: "Auspuff war abgerissen, ich konnte direkt vorbeikommen. Nach kurzer Zeit war ich wieder auf der Straße. Danke dafür!" },

  { name: "Stefan G.", stars: 4, when: "vor 8 Monaten", platzhalter: true,
    text: "Motorinstandsetzung an einem älteren Fahrzeug – ehrliche Ansage, was sich noch lohnt und was nicht. Das rechne ich hoch an." },

  { name: "Christina V.", stars: 5, when: "vor 9 Monaten", platzhalter: true,
    text: "Als Frau in der Werkstatt oft ein Thema – hier wurde mir auf Augenhöhe alles in Ruhe erklärt. Komme wieder." },

  { name: "Jörg T.", stars: 5, when: "vor 10 Monaten", platzhalter: true,
    text: "Seit Jahren Stammkunde mit zwei Fahrzeugen. Werries ist für mich ein Umweg, den ich gern fahre." }
];
