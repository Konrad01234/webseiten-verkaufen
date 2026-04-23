import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Burger Brothers | Handgemachte Burger aus Berlin",
  description:
    "Rauchige Patties, knusprige Buns, handgeschnittene Pommes. Burger Brothers - urbane Burger-Manufaktur in Berlin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="flex min-h-screen flex-col bg-brand-concrete">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
