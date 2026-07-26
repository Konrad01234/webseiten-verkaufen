import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-concrete">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=2000&q=80"
            alt="Gegrillter Burger mit Käse und Salat"
            fill
            priority
            className="object-cover object-right"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #121212 0%, rgba(18,18,18,0.85) 30%, rgba(18,18,18,0.35) 55%, transparent 75%), linear-gradient(180deg, transparent 50%, rgba(18,18,18,0.6) 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto grid min-h-[82vh] max-w-7xl items-center px-6 py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3">
              <span className="h-0.5 w-10 bg-brand-yellow" />
              <span className="mono text-sm uppercase tracking-[0.3em] text-brand-yellow">
                Seit 2014 · Berlin
              </span>
            </div>

            <h1
              className="font-display text-6xl leading-[0.9] text-brand-bone md:text-8xl lg:text-9xl"
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.8)" }}
            >
              FLAME.
              <br />
              GRILLED.
              <br />
              <span className="text-brand-red">HANDMADE.</span>
            </h1>

            <p
              className="mt-8 max-w-xl text-lg text-brand-bone/90 md:text-xl"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.85)" }}
            >
              Keine Franchise. Keine Kompromisse. Nur ehrliche Burger aus der
              Werkstatt der Brüder — vom Dry-Aged-Patty bis zum Brioche-Bun.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/menu" className="btn-primary">
                Zur Speisekarte →
              </Link>
              <Link href="/kontakt" className="btn-outline">
                Öffnungszeiten
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap gap-8 text-brand-bone/60">
              <Stat value="100%" label="Rindfleisch aus Brandenburg" />
              <Stat value="48H" label="Brioche Fermentation" />
              <Stat value="11" label="Jahre Burger-Handwerk" />
            </div>
          </div>
        </div>

        <div className="hazard-stripes absolute bottom-0 left-0 h-2 w-full" />
      </section>

      {/* FEATURE STRIPE */}
      <section className="bg-brand-red py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-2 px-6 font-display text-xl tracking-[0.2em] text-white md:text-2xl">
          <span>★ DRY-AGED BEEF</span>
          <span>★ HOUSE-BAKED BUNS</span>
          <span>★ HAND-CUT FRIES</span>
          <span>★ CRAFT SAUCEN</span>
        </div>
      </section>

      {/* ABOUT / PHILOSOPHY */}
      <section className="bg-brand-concrete py-24">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=80"
              alt="Koch am Grill in einer offenen Küche"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-brand-yellow/20" />
            <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-brand-yellow" />
            <div className="absolute bottom-6 right-6 z-10 font-display text-6xl text-brand-concrete">
              11
            </div>
            <div className="absolute bottom-2 right-6 z-10 mono text-[10px] uppercase tracking-widest text-brand-concrete">
              Jahre
            </div>
          </div>

          <div>
            <div className="mono text-sm uppercase tracking-[0.3em] text-brand-yellow">
              / Unsere Philosophie
            </div>
            <h2 className="mt-4 font-display text-5xl text-brand-bone md:text-6xl">
              ROHES HANDWERK.<br />
              <span className="text-brand-red">KEIN SCHNICKSCHNACK.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-brand-bone/80">
              Unsere Werkstatt sieht aus wie eine: Beton, Stahl, offene Flammen.
              Wir glauben, dass der beste Burger nichts verstecken muss — weder
              seine Zutaten noch seine Geschichte.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-brand-bone/80">
              Deshalb kommt unser Fleisch von einem Brandenburger Metzger, der
              seinen Namen nennt. Unsere Buns backen wir jeden Morgen frisch.
              Und unsere Pommes schneiden wir von Hand. Punkt.
            </p>

            <div className="mt-10 border-l-[3px] border-brand-red pl-5 font-display text-2xl leading-tight tracking-wide text-brand-bone md:text-3xl">
              Keine App. Keine Pinzetten-Deko.
              <br />
              Nur <span className="text-brand-yellow">Feuer, Fleisch &amp; Brot.</span>
            </div>

            <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 font-display text-2xl tracking-[0.2em] text-brand-bone">
              <span>LOKAL</span>
              <span className="font-bold text-brand-red/90">/</span>
              <span>HANDMADE</span>
              <span className="font-bold text-brand-red/90">/</span>
              <span>FLAMME</span>
              <span className="font-bold text-brand-red/90">/</span>
              <span>EHRLICH</span>
            </div>

            <div
              className="mt-10 inline-block border-[3px] border-double border-brand-yellow px-7 py-3.5 text-brand-yellow opacity-90"
              style={{
                transform: "rotate(-4deg)",
                outline: "1px solid #F9C21A",
                outlineOffset: "4px",
              }}
            >
              <div className="mono text-center text-[0.7rem] uppercase tracking-[0.35em]">
                ★ Genehmigt in der Werkstatt ★
              </div>
              <div className="my-1 text-center font-display text-3xl tracking-[0.18em] leading-none">
                BROTHERS
              </div>
              <div className="mono text-center text-[0.65rem] uppercase tracking-[0.3em] opacity-85">
                Berlin · Seit 2014
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="relative overflow-hidden bg-metal py-20">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=2000&q=80"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mono text-sm uppercase tracking-[0.3em] text-brand-yellow">
            / Ready to eat?
          </div>
          <h2 className="mt-4 font-display text-5xl text-brand-bone md:text-7xl">
            5 SIGNATURE BURGER.<br />
            <span className="text-brand-red">EIN BESUCH.</span>
          </h2>
          <p className="mt-6 text-lg text-brand-bone/80">
            Schau dir unsere Karte an — jeder Burger hat seine eigene
            Persönlichkeit.
          </p>
          <div className="mt-8">
            <Link href="/menu" className="btn-primary">
              Menü ansehen →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-4xl text-brand-yellow">{value}</div>
      <div className="mono text-xs uppercase tracking-widest">{label}</div>
    </div>
  );
}

