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
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-concrete via-brand-concrete/85 to-transparent" />
          <div className="absolute inset-0 bg-grid-steel [background-size:40px_40px]" />
        </div>

        <div className="relative mx-auto grid min-h-[82vh] max-w-7xl items-center px-6 py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3">
              <span className="h-0.5 w-10 bg-brand-yellow" />
              <span className="mono text-sm uppercase tracking-[0.3em] text-brand-yellow">
                Seit 2014 · Berlin
              </span>
            </div>

            <h1 className="font-display text-6xl leading-[0.9] text-brand-bone md:text-8xl lg:text-9xl">
              FLAME.
              <br />
              GRILLED.
              <br />
              <span className="text-brand-red">HANDMADE.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg text-brand-bone/80 md:text-xl">
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

            <div className="mt-10 grid grid-cols-2 gap-4">
              <FeatureBox
                num="01"
                title="Lokale Herkunft"
                text="Alle Zutaten aus der Region, wenn irgend möglich."
              />
              <FeatureBox
                num="02"
                title="Flamme, nicht Platte"
                text="Holzkohle-Grill für den echten Smokeyness-Kick."
              />
              <FeatureBox
                num="03"
                title="Handgemacht"
                text="Von der Sauce bis zum Bun — alles hausgemacht."
              />
              <FeatureBox
                num="04"
                title="Ehrlich"
                text="Keine Zusätze, keine Geschmacksverstärker."
              />
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

function FeatureBox({
  num,
  title,
  text,
}: {
  num: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-brand-steel bg-brand-concrete-light p-5">
      <div className="mono text-xs text-brand-yellow">{num}</div>
      <div className="mt-1 font-display text-xl tracking-wider text-brand-bone">
        {title}
      </div>
      <div className="mt-2 text-sm text-brand-bone/70">{text}</div>
    </div>
  );
}
