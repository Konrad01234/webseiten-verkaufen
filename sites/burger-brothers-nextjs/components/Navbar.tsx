"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menü" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-brand-red bg-brand-concrete/95 backdrop-blur">
      <div className="hazard-stripes h-1.5 w-full" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
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
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-display text-xl tracking-widest transition-colors ${
                    active
                      ? "text-brand-yellow"
                      : "text-brand-bone hover:text-brand-red"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="mx-auto mt-0.5 block h-0.5 w-full bg-brand-yellow" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          aria-label="Menü umschalten"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-brand-bone transition-transform ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-brand-bone transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-brand-bone transition-transform ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {open && (
        <ul className="flex flex-col gap-2 border-t border-brand-steel bg-brand-concrete-light px-6 py-4 md:hidden">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block py-2 font-display text-2xl tracking-widest ${
                    active ? "text-brand-yellow" : "text-brand-bone"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}
