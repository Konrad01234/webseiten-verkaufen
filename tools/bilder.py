#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bilder für die Websites aufbereiten.

Nimmt beliebige Fotos (Handy, Kamera, Screenshots) und macht daraus fertige
Web-Dateien: auf die richtige Breite gebracht, leicht nachgeschärft im Kontrast,
gespeichert als WebP **und** JPEG. Das JPEG ist der Rückfall für alte Browser,
eingebunden wird beides über <picture>.

Beispiele
---------
    # Alle Fotos aus einem Ordner als Galeriebilder aufbereiten
    python3 tools/bilder.py ~/fotos/boostwerk --ziel sites/boostwerk/img/fotos

    # Ein einzelnes Bild als breites Foto-Band
    python3 tools/bilder.py halle.jpg --ziel sites/boostwerk/img --preset band

    # Umbenennen beim Ablegen
    python3 tools/bilder.py IMG_4711.jpg --ziel sites/boostwerk/img/fotos \\
        --preset galerie --name hebebuehne-neu

    # Nur schauen, was passieren würde
    python3 tools/bilder.py ~/fotos --ziel sites/boostwerk/img/fotos --probe

Presets
-------
    hero      1800 px – Kopfbild einer Seite
    band       1600 px – vollbreites Foto-Band
    galerie   1100 px – Kachel in der Galerie (Standard)
    portraet   900 px – Hochformat, z. B. Inhaber
    logo       600 px – kleine Flächen, Footer

Voraussetzung:  pip install Pillow
"""

import argparse
import os
import sys

try:
    from PIL import Image, ImageEnhance, ImageOps
except ImportError:
    sys.exit("Pillow fehlt. Bitte einmal ausführen:  pip install Pillow")


PRESETS = {
    "hero":     {"breite": 1800, "q_webp": 80, "q_jpg": 84},
    "band":     {"breite": 1600, "q_webp": 80, "q_jpg": 84},
    "galerie":  {"breite": 1100, "q_webp": 82, "q_jpg": 82},
    "portraet": {"breite":  900, "q_webp": 84, "q_jpg": 86},
    "logo":     {"breite":  600, "q_webp": 88, "q_jpg": 90},
}

ENDUNGEN = (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff", ".heic")


def saubere_name(text):
    """Aus 'IMG_4711 Kopie.JPG' wird 'img-4711-kopie'."""
    umlaute = {"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss",
               "Ä": "ae", "Ö": "oe", "Ü": "ue"}
    text = os.path.splitext(os.path.basename(text))[0].lower()
    for a, b in umlaute.items():
        text = text.replace(a, b)
    erlaubt = "abcdefghijklmnopqrstuvwxyz0123456789-"
    text = "".join(c if c in erlaubt else "-" for c in text)
    while "--" in text:
        text = text.replace("--", "-")
    return text.strip("-") or "bild"


def sammle(quellen):
    """Aus Dateien und Ordnern eine flache Liste von Bildpfaden machen."""
    raus = []
    for q in quellen:
        if os.path.isdir(q):
            for name in sorted(os.listdir(q)):
                if name.lower().endswith(ENDUNGEN):
                    raus.append(os.path.join(q, name))
        elif os.path.isfile(q):
            raus.append(q)
        else:
            print("  übersprungen (nicht gefunden): %s" % q)
    return raus


def aufbereiten(pfad, ziel, cfg, name=None, zuschnitt=None, probe=False):
    im = Image.open(pfad)
    im = ImageOps.exif_transpose(im)          # Handy-Drehung berücksichtigen
    if im.mode not in ("RGB", "L"):
        im = im.convert("RGB")

    start = im.size

    # Optionaler Zuschnitt auf ein festes Seitenverhältnis, mittig
    if zuschnitt:
        b, h = zuschnitt
        ziel_v = b / h
        v = im.size[0] / im.size[1]
        if v > ziel_v:                        # zu breit -> Seiten weg
            neu_b = int(im.size[1] * ziel_v)
            links = (im.size[0] - neu_b) // 2
            im = im.crop((links, 0, links + neu_b, im.size[1]))
        elif v < ziel_v:                      # zu hoch -> oben/unten weg
            neu_h = int(im.size[0] / ziel_v)
            oben = (im.size[1] - neu_h) // 2
            im = im.crop((0, oben, im.size[0], oben + neu_h))

    # Verkleinern (nie hochrechnen – das bringt nur Unschärfe)
    if im.size[0] > cfg["breite"]:
        hoehe = round(cfg["breite"] * im.size[1] / im.size[0])
        im = im.resize((cfg["breite"], hoehe), Image.LANCZOS)

    # Dezente Anpassung, damit die Fotos zum dunklen Layout passen
    im = ImageEnhance.Contrast(im).enhance(1.05)
    im = ImageEnhance.Color(im).enhance(1.03)

    basis = name or saubere_name(pfad)
    p_webp = os.path.join(ziel, basis + ".webp")
    p_jpg = os.path.join(ziel, basis + ".jpg")

    if probe:
        print("  %-30s %sx%s -> %sx%s   %s.{webp,jpg}"
              % (os.path.basename(pfad), start[0], start[1], im.size[0], im.size[1], basis))
        return None

    os.makedirs(ziel, exist_ok=True)
    im.save(p_webp, "WEBP", quality=cfg["q_webp"], method=6)
    im.save(p_jpg, "JPEG", quality=cfg["q_jpg"], optimize=True, progressive=True)

    kb_w = os.path.getsize(p_webp) // 1024
    kb_j = os.path.getsize(p_jpg) // 1024
    print("  %-30s %sx%s   webp %4d KB · jpg %4d KB   (%s)"
          % (basis, im.size[0], im.size[1], kb_w, kb_j,
             "%+d%%" % round((kb_w - kb_j) * 100.0 / kb_j) if kb_j else "–"))
    return basis


def main():
    ap = argparse.ArgumentParser(
        description="Fotos für die Websites aufbereiten (WebP + JPEG).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="Presets: " + ", ".join(
            "%s (%s px)" % (k, v["breite"]) for k, v in PRESETS.items()))
    ap.add_argument("quelle", nargs="+", help="Bilddatei(en) oder Ordner")
    ap.add_argument("--ziel", required=True, help="Zielordner, z. B. sites/boostwerk/img/fotos")
    ap.add_argument("--preset", default="galerie", choices=sorted(PRESETS), help="Standard: galerie")
    ap.add_argument("--breite", type=int, help="Breite in Pixeln, überschreibt das Preset")
    ap.add_argument("--name", help="Dateiname ohne Endung (nur bei genau einer Quelldatei)")
    ap.add_argument("--zuschnitt", help="Seitenverhältnis erzwingen, z. B. 3:2 oder 16:9")
    ap.add_argument("--probe", action="store_true", help="nur anzeigen, nichts schreiben")
    a = ap.parse_args()

    cfg = dict(PRESETS[a.preset])
    if a.breite:
        cfg["breite"] = a.breite

    zuschnitt = None
    if a.zuschnitt:
        try:
            b, h = a.zuschnitt.replace("/", ":").split(":")
            zuschnitt = (float(b), float(h))
        except ValueError:
            sys.exit("Zuschnitt bitte als Verhältnis angeben, z. B. --zuschnitt 3:2")

    bilder = sammle(a.quelle)
    if not bilder:
        sys.exit("Keine Bilder gefunden.")
    if a.name and len(bilder) > 1:
        sys.exit("--name geht nur, wenn genau eine Datei übergeben wird (gefunden: %d)." % len(bilder))

    print("%s %d Bild(er) · Preset %s (%d px)%s"
          % ("Probelauf:" if a.probe else "Verarbeite:", len(bilder), a.preset, cfg["breite"],
             " · Zuschnitt " + a.zuschnitt if a.zuschnitt else ""))

    fertig = []
    for p in bilder:
        try:
            b = aufbereiten(p, a.ziel, cfg, a.name, zuschnitt, a.probe)
            if b:
                fertig.append(b)
        except Exception as e:
            print("  FEHLER bei %s: %s" % (p, e))

    if fertig:
        print("\nFertig. Einbinden im HTML so (WebP zuerst, JPEG als Rückfall):\n")
        b = fertig[0]
        print('  <picture>')
        print('    <source srcset="img/fotos/%s.webp" type="image/webp">' % b)
        print('    <img src="img/fotos/%s.jpg" alt="…" width="…" height="…" loading="lazy">' % b)
        print('  </picture>')
        print("\nDenk an den Eintrag in assets/fotos/BILDNACHWEIS.md.")


if __name__ == "__main__":
    main()
