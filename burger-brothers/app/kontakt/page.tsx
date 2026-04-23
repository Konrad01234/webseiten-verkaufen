import Image from "next/image";

const hours = [
  { day: "Mo", time: "Geschlossen", closed: true },
  { day: "Di", time: "12:00 — 22:00" },
  { day: "Mi", time: "12:00 — 22:00" },
  { day: "Do", time: "12:00 — 23:00" },
  { day: "Fr", time: "12:00 — 00:00", highlight: true },
  { day: "Sa", time: "11:00 — 00:00", highlight: true },
  { day: "So", time: "11:00 — 22:00" },
];

export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <section className="relative overflow-hidden border-b border-brand-steel bg-metal py-20">
        <div className="absolute inset-0 bg-grid-steel [background-size:40px_40px] opacity-60" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mono text-sm uppercase tracking-[0.3em] text-brand-yellow">
            / Kontakt
          </div>
          <h1 className="mt-4 font-display text-6xl text-brand-bone md:text-8xl">
            BESUCH UNS IN DER <span className="text-brand-red">WERKSTATT</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-brand-bone/80">
            Mitten in Berlin-Mitte, keine Ecke für schüchterne Esser. Kein
            Tischreservierungs-Zirkus — einfach vorbeikommen, warten ist Teil
            des Erlebnisses.
          </p>
        </div>
        <div className="hazard-stripes absolute bottom-0 left-0 h-2 w-full" />
      </section>

      {/* Main contact grid */}
      <section className="bg-brand-concrete py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          {/* Address & Contact */}
          <div className="space-y-8">
            <ContactCard
              num="01"
              title="Adresse"
              lines={["Fabrikstraße 42", "10117 Berlin", "Deutschland"]}
            />
            <ContactCard
              num="02"
              title="Telefon"
              lines={["+49 30 1234 5678"]}
              mono
            />
            <ContactCard
              num="03"
              title="E-Mail"
              lines={["hallo@burger-brothers.de"]}
              mono
            />
            <ContactCard
              num="04"
              title="Anfahrt"
              lines={[
                "U-Bahn: Rosenthaler Platz (U8) — 3 Min",
                "S-Bahn: Hackescher Markt (S5/S7) — 8 Min",
                "Parken: Parkhaus Torstraße — 5 Min",
              ]}
            />
          </div>

          {/* Opening Hours */}
          <div>
            <div className="sticky top-28 border border-brand-steel bg-brand-concrete-light">
              <div className="border-b border-brand-steel bg-brand-concrete px-6 py-4">
                <div className="mono text-xs uppercase tracking-[0.3em] text-brand-yellow">
                  / Opening Hours
                </div>
                <h2 className="mt-1 font-display text-3xl text-brand-bone md:text-4xl">
                  ÖFFNUNGSZEITEN
                </h2>
              </div>

              <ul className="divide-y divide-brand-steel">
                {hours.map((h) => (
                  <li
                    key={h.day}
                    className={`flex items-center justify-between px-6 py-4 ${
                      h.highlight ? "bg-brand-red/10" : ""
                    }`}
                  >
                    <span
                      className={`font-display text-2xl tracking-widest ${
                        h.closed ? "text-brand-bone/40" : "text-brand-bone"
                      }`}
                    >
                      {h.day}
                    </span>
                    <span
                      className={`mono text-sm ${
                        h.closed
                          ? "text-brand-bone/40"
                          : h.highlight
                            ? "text-brand-yellow"
                            : "text-brand-bone/80"
                      }`}
                    >
                      {h.time}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t-2 border-brand-red bg-brand-concrete px-6 py-4">
                <div className="mono text-xs uppercase tracking-widest text-brand-bone/60">
                  Küchenschluss jeweils 30 Min vor Ladenschluss.
                </div>
              </div>
            </div>

            <div className="mt-6 border border-brand-yellow/40 bg-brand-yellow/5 p-6">
              <div className="flex items-start gap-3">
                <span className="mono shrink-0 font-bold text-brand-yellow">
                  ⚠
                </span>
                <p className="text-sm text-brand-bone/80">
                  <strong className="font-display text-base tracking-wider text-brand-yellow">
                    HINWEIS
                  </strong>
                  <br />
                  An Feiertagen können sich die Öffnungszeiten ändern. Ruf uns
                  im Zweifel kurz an — wir beißen nicht. Meistens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map-ish strip */}
      <section className="relative overflow-hidden border-t border-brand-steel">
        <div className="relative h-[420px] w-full bg-brand-concrete-light">
          <Image
            src="https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=2000&q=80"
            alt="Street-Food-Atmosphäre in Berlin"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-concrete to-transparent" />
          <div className="absolute inset-0 bg-grid-steel [background-size:40px_40px] opacity-40" />

          <div className="relative mx-auto flex h-full max-w-7xl items-end px-6 pb-12">
            <div>
              <div className="mono text-sm uppercase tracking-[0.3em] text-brand-yellow">
                / Pin drop
              </div>
              <div className="mt-2 font-display text-5xl text-brand-bone md:text-6xl">
                FABRIKSTRASSE 42
              </div>
              <div className="mono mt-2 text-sm text-brand-bone/60">
                52.5244° N · 13.4105° E
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  num,
  title,
  lines,
  mono,
}: {
  num: string;
  title: string;
  lines: string[];
  mono?: boolean;
}) {
  return (
    <div className="relative border border-brand-steel bg-brand-concrete-light p-6">
      <div className="absolute left-4 top-4 mono text-xs text-brand-yellow">
        / {num}
      </div>
      <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-brand-red/80 shadow-[0_0_8px_#E63025]" />

      <div className="mt-8 font-display text-3xl tracking-widest text-brand-bone">
        {title}
      </div>
      <div
        className={`mt-3 space-y-1 ${
          mono ? "mono text-brand-yellow" : "text-brand-bone/80"
        }`}
      >
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
}
