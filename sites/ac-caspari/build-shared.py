#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemeinsame Bausteine in die HTML-Seiten einsetzen.

Die Seiten sind bewusst reines HTML ohne Build-Schritt – ausgeliefert wird
genau das, was in den .html-Dateien steht. Kopfleiste, Fußzeile und das
Icon-Set sind aber auf jeder Seite gleich, und von Hand gepflegt laufen sie
irgendwann auseinander.

Dieses Skript nimmt die Blöcke aus `index.html` als Vorlage und schreibt sie
in die anderen Seiten. Es ist ein Werkzeug für die Entwicklung, kein
Bestandteil der Website – die fertigen Seiten funktionieren ohne es.

    python3 build-shared.py            # alle Seiten aktualisieren
    python3 build-shared.py --probe    # nur zeigen, was sich ändern würde

Ablauf beim Ändern der Navigation:
    1. index.html anpassen
    2. dieses Skript laufen lassen
    3. Ergebnis im Browser prüfen

Die Zielseiten markieren die Stellen mit einem **Marker-Paar**:

    <!--@NAV:leistungen-->  …  <!--@/NAV-->      Kopfleiste + Vollbild-Menü
    <!--@FOOT-->            …  <!--@/FOOT-->     Fußzeile, Nach-oben, Cookie-Hinweis
    <!--@SPRITE-->          …  <!--@/SPRITE-->   Icon-Set + <script>-Einbindungen

Ersetzt wird ausschließlich, was zwischen dem öffnenden und dem schließenden
Marker steht. Fehlt der schließende Marker noch (erster Lauf), wird er
angelegt. Das ist der entscheidende Punkt: der eigentliche Seiteninhalt liegt
zwischen dem NAV- und dem FOOT-Block und darf dabei nicht angefasst werden.
"""

import argparse
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))

# Marker -> (Startzeichen im index.html, Endzeichen im index.html)
BLOECKE = {
    "NAV":    ("<!-- ===================== Kopfleiste", '\n<main id="main"'),
    "FOOT":   ("<!-- ===================== Fußzeile",   "<!-- ===================== Icon-Set"),
    "SPRITE": ("<!-- ===================== Icon-Set",   "</body>"),
}

SEITEN = {
    "leistungen.html":  "leistungen",
    "werkstatt.html":   "werkstatt",
    "rezensionen.html": "rezensionen",
    "kontakt.html":     "kontakt",
    "impressum.html":   "",
    "datenschutz.html": "",
}


def lies(name):
    with open(os.path.join(HIER, name), encoding="utf-8") as f:
        return f.read()


def schneide(quelle, anfang, ende):
    """Den Abschnitt zwischen zwei Markierungen aus der Vorlage holen."""
    i = quelle.find(anfang)
    if i < 0:
        sys.exit("Vorlagenblock nicht gefunden: %r" % anfang)
    j = quelle.find(ende, i)
    if j < 0:
        sys.exit("Blockende nicht gefunden: %r" % ende)
    return quelle[i:j].rstrip() + "\n"


def aktiv_setzen(block, seite):
    """`class="active"` auf den Menüpunkt der aktuellen Seite umhängen.

    Getroffen werden nur die reinen Menü-Links `<a href="…">`. Der Knopf
    „Termin anfragen“ zeigt ebenfalls auf kontakt.html, hat aber schon ein
    class-Attribut – dort ein zweites anzuhängen ergäbe ungültiges HTML.
    """
    block = block.replace(' class="active"', "")
    if not seite:
        return block                      # Impressum/Datenschutz: kein Punkt aktiv
    return block.replace('<a href="%s.html">' % seite,
                         '<a href="%s.html" class="active">' % seite)


def main():
    ap = argparse.ArgumentParser(description="Gemeinsame HTML-Bausteine verteilen.")
    ap.add_argument("--probe", action="store_true", help="nur anzeigen, nichts schreiben")
    a = ap.parse_args()

    vorlage = lies("index.html")
    teile = {name: schneide(vorlage, *grenzen) for name, grenzen in BLOECKE.items()}

    for datei, seite in SEITEN.items():
        pfad = os.path.join(HIER, datei)
        if not os.path.exists(pfad):
            print("  übersprungen (fehlt): %s" % datei)
            continue

        alt = lies(datei)
        neu = alt

        for name, block in teile.items():
            inhalt = aktiv_setzen(block, seite) if name == "NAV" else block
            # NUR zwischen öffnendem und schließendem Marker ersetzen. Der
            # schließende Teil ist optional, damit auch der erste Lauf greift –
            # ohne ihn würde alles bis zum nächsten Marker verschluckt, und
            # zwischen NAV und FOOT steht der komplette Seiteninhalt.
            muster = re.compile(
                r"<!--@%s(?::[a-z-]+)?-->(?:.*?<!--@/%s-->)?" % (name, name),
                re.S)
            treffer = muster.search(neu)
            if not treffer:
                continue
            marker = re.match(r"<!--@%s(?::[a-z-]+)?-->" % name, treffer.group(0)).group(0)
            ersatz = "%s\n%s<!--@/%s-->" % (marker, inhalt, name)
            neu = neu[:treffer.start()] + ersatz + neu[treffer.end():]

        if "<main" not in neu:
            sys.exit("ABBRUCH: %s hätte seinen <main>-Inhalt verloren. "
                     "Nichts geschrieben." % datei)

        if neu == alt:
            print("  unverändert: %s" % datei)
        elif a.probe:
            print("  würde ändern: %s (%+d Zeichen)" % (datei, len(neu) - len(alt)))
        else:
            with open(pfad, "w", encoding="utf-8") as f:
                f.write(neu)
            print("  geschrieben: %s" % datei)


if __name__ == "__main__":
    main()
