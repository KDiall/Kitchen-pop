import "./globals.css";
import Link from "next/link";
import { Instrument_Serif, Inter } from "next/font/google";
import { CartBadge } from "@/components/CartBadge";
import { Logo } from "@/components/Logo";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Pop-up Kitchen — World Flavours",
  description:
    "Today's freshly cooked dishes from around the world. Order before cutoff, pay by mobile money, pick up hot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen flex flex-col text-zinc-900 font-sans">
        <header className="sticky top-0 z-20 bg-[#fbfaf7]/85 backdrop-blur-md border-b border-stone-200/70">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Logo />
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-stone-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
              >
                Menu
                <CartBadge />
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-md text-stone-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200/70 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-3">
              <span className="font-serif italic text-sm text-stone-700">Pop-up</span>
              <span className="text-stone-300">·</span>
              <span>Freetown, Sierra Leone</span>
            </div>
            <span className="tabular-nums">© {new Date().getFullYear()}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
