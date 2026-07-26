import Image from "next/image";
import Link from "next/link";

type Burger = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  ingredients: string[];
  image: string;
  badge?: string;
};

const burgers: Burger[] = [
  {
    id: "01",
    name: "The Classic",
    tagline: "Wie alles angefangen hat",
    description:
      "Unser Signature-Burger. 180g Dry-Aged Beef, Cheddar, knackiger Salat, hausgemachte Brothers-Sauce.",
    price: "13,50",
    ingredients: [
      "180g Dry-Aged Beef",
      "Cheddar",
      "Eisbergsalat",
      "Tomate",
      "Rote Zwiebel",
      "Brothers-Sauce",
    ],
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    badge: "Signature",
  },
  {
    id: "02",
    name: "Smoke House",
    tagline: "Rauchig. Kräftig. Kompromisslos.",
    description:
      "Langsam geschmortes Pulled Beef, geräucherter Gouda, knuspriger Bacon und unsere Smoked-BBQ-Sauce.",
    price: "15,90",
    ingredients: [
      "180g Patty + Pulled Beef",
      "Smoked Gouda",
      "Crispy Bacon",
      "Fried Onions",
      "BBQ-Sauce",
    ],
    image:
      "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=1200&q=80",
    badge: "Hot",
  },
  {
    id: "03",
    name: "The Iron Bun",
    tagline: "Schwer wie Stahl.",
    description:
      "Double Patty, doppelt Cheddar, karamellisierte Zwiebeln, Trüffel-Mayo. Nicht für Anfänger.",
    price: "17,50",
    ingredients: [
      "2 × 150g Beef",
      "Doppel Cheddar",
      "Karamellisierte Zwiebeln",
      "Rucola",
      "Trüffel-Mayo",
    ],
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
    badge: "XL",
  },
  {
    id: "04",
    name: "The Garden",
    tagline: "Pflanzlich. Ehrlich. Lecker.",
    description:
      "Hausgemachtes Beyond-Patty, Avocado-Creme, eingelegte Gurken, geröstete Paprika — 100% vegan.",
    price: "13,90",
    ingredients: [
      "Plant-Based Patty",
      "Avocado-Creme",
      "Geröstete Paprika",
      "Eingelegte Gurken",
      "Vegane Mayo",
    ],
    image:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=1200&q=80",
    badge: "Vegan",
  },
  {
    id: "05",
    name: "Firebird",
    tagline: "Scharf wie die Schmiede.",
    description:
      "Hähnchen-Patty, Jalapeños, Pepper-Jack-Käse, Habanero-Mayo. Achtung: macht süchtig.",
    price: "14,50",
    ingredients: [
      "Crispy Chicken",
      "Pepper Jack",
      "Jalapeños",
      "Krautsalat",
      "Habanero-Mayo",
    ],
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1200&q=80",
    badge: "Spicy",
  },
];

export default function MenuPage() {
  return (
    <>
      {/* Page Header */}
      <section className="relative overflow-hidden border-b border-brand-steel bg-metal py-20">
        <div className="absolute inset-0 bg-grid-steel [background-size:40px_40px] opacity-60" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mono text-sm uppercase tracking-[0.3em] text-brand-yellow">
            / Unsere Speisekarte
          </div>
          <h1 className="mt-4 font-display text-6xl text-brand-bone md:text-8xl">
            DIE <span className="text-brand-red">FÜNF</span> SIGNATURE BURGER
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-brand-bone/80">
            Fünf Burger. Fünf Geschichten. Jeder hat seinen Platz auf unserer
            Karte verdient. Zu jedem gibt's handgeschnittene Pommes & ein
            kühles Bier auf Wunsch.
          </p>
        </div>
        <div className="hazard-stripes absolute bottom-0 left-0 h-2 w-full" />
      </section>

      {/* Burger List */}
      <section className="bg-brand-concrete py-20">
        <div className="mx-auto max-w-7xl space-y-20 px-6">
          {burgers.map((burger, index) => (
            <BurgerRow key={burger.id} burger={burger} reverse={index % 2 === 1} />
          ))}
        </div>
      </section>

      {/* Sides Note */}
      <section className="border-t border-brand-steel bg-brand-concrete-light py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mono text-sm uppercase tracking-[0.3em] text-brand-yellow">
            / Auch an der Seite
          </div>
          <h2 className="mt-4 font-display text-4xl text-brand-bone md:text-5xl">
            HAND-CUT FRIES, CRAFT BIER, HOUSE SODA
          </h2>
          <p className="mt-4 text-brand-bone/70">
            Unsere Pommes werden täglich frisch geschnitten und doppelt
            frittiert. Dazu: lokales Craft-Bier vom Fass und
            hausgemachte Limonaden. Alles vor Ort im Restaurant.
          </p>
          <div className="mt-8">
            <Link href="/kontakt" className="btn-outline">
              Besuch planen →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function BurgerRow({ burger, reverse }: { burger: Burger; reverse: boolean }) {
  return (
    <article
      className={`grid gap-10 lg:grid-cols-2 lg:items-center ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden border border-brand-steel bg-brand-concrete-light">
        <Image
          src={burger.image}
          alt={burger.name}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        {burger.badge && (
          <div className="absolute left-4 top-4 bg-brand-red px-3 py-1 font-display text-lg tracking-widest text-white">
            {burger.badge}
          </div>
        )}
        <div className="absolute bottom-4 right-4 mono text-xs uppercase tracking-widest text-brand-bone/60">
          No. {burger.id}
        </div>
      </div>

      <div>
        <div className="font-display text-8xl leading-none text-transparent [-webkit-text-stroke:2px_#F9C21A]">
          {burger.id}
        </div>

        <h2 className="mt-2 font-display text-5xl text-brand-bone md:text-6xl">
          {burger.name}
        </h2>
        <div className="mono mt-1 text-sm uppercase tracking-[0.2em] text-brand-yellow">
          {burger.tagline}
        </div>

        <p className="mt-5 text-lg text-brand-bone/80">{burger.description}</p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {burger.ingredients.map((ing) => (
            <li
              key={ing}
              className="border border-brand-steel bg-brand-concrete px-3 py-1 mono text-xs uppercase tracking-wider text-brand-bone/80"
            >
              {ing}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center gap-6 border-t border-brand-steel pt-6">
          <div>
            <div className="mono text-xs uppercase tracking-widest text-brand-bone/50">
              Preis
            </div>
            <div className="font-display text-5xl text-brand-red">
              {burger.price} €
            </div>
          </div>
          <div className="h-12 w-px bg-brand-steel" />
          <div className="mono text-xs leading-relaxed text-brand-bone/60">
            Serviert mit<br />
            Brioche-Bun & Beilage
          </div>
        </div>
      </div>
    </article>
  );
}
