import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t-2 border-brand-red bg-brand-concrete">
      <div className="hazard-stripes h-1.5 w-full" />
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-brand-red font-display text-2xl text-white">
              BB
            </span>
            <div className="font-display leading-none">
              <div className="text-2xl tracking-widest text-brand-bone">
                BURGER
              </div>
              <div className="text-xl tracking-[0.3em] text-brand-yellow">
                BROTHERS
              </div>
            </div>
          </div>
          <p className="max-w-sm text-sm text-brand-bone/70">
            Hand-gemachte Burger aus regionalen Zutaten. Mitten in der Stadt,
            roh im Look, ehrlich im Geschmack.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-display text-xl tracking-widest text-brand-yellow">
            Navigation
          </h4>
          <ul className="space-y-2 text-sm text-brand-bone/80">
            <li>
              <Link href="/" className="hover:text-brand-red">
                Home
              </Link>
            </li>
            <li>
              <Link href="/menu" className="hover:text-brand-red">
                Menü
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className="hover:text-brand-red">
                Kontakt & Öffnungszeiten
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-xl tracking-widest text-brand-yellow">
            Find Us
          </h4>
          <address className="space-y-1 text-sm not-italic text-brand-bone/80">
            <div>Fabrikstraße 42</div>
            <div>10117 Berlin</div>
            <div className="mono mt-3">+49 30 1234 5678</div>
            <div className="mono">hallo@burger-brothers.de</div>
          </address>
        </div>
      </div>

      <div className="border-t border-brand-steel bg-black/40 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-xs text-brand-bone/50 md:flex-row">
          <div>© {new Date().getFullYear()} Burger Brothers. All rights reserved.</div>
          <div className="mono">MADE WITH FIRE & IRON</div>
        </div>
      </div>
    </footer>
  );
}
