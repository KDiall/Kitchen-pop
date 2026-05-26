import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Pop-up Kitchen — Sierra Leone",
  description: "Today's freshly cooked Sierra Leonean dishes. Order before cutoff, pay by mobile money, pick up hot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col text-neutral-900">
        <header className="sticky top-0 z-20 bg-[#fafaf5]/85 backdrop-blur border-b border-neutral-200/70">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight text-[15px] text-neutral-900"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Pop-up Kitchen
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link
                href="/"
                className="text-neutral-600 hover:text-emerald-700 transition-colors"
              >
                Menu
              </Link>
              <Link
                href="/admin"
                className="text-neutral-600 hover:text-emerald-700 transition-colors"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200/80 mt-16">
          <div className="max-w-5xl mx-auto px-6 py-5 text-xs text-neutral-500 flex items-center justify-between">
            <span>Pop-up Kitchen · Freetown</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
