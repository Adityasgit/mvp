import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campus Navigator AR",
  description: "AR-assisted campus navigation",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <nav className="h-14 shrink-0 bg-gray-900 flex items-center px-4 gap-6 z-50">
          <Link href="/" className="text-white font-bold text-sm tracking-tight">
            🧭 Campus Navigator
          </Link>
          <div className="flex gap-4 ml-auto">
            <Link
              href="/admin"
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/navigator"
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Navigate
            </Link>
          </div>
        </nav>
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
