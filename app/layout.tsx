import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://content-cannibalization-detector.example"),
  title: {
    default: "Content Cannibalization Detector",
    template: "%s | Content Cannibalization Detector"
  },
  description:
    "Find content competing against itself in search. Crawl your site, detect keyword overlap, and get clear consolidation or differentiation strategies.",
  openGraph: {
    title: "Content Cannibalization Detector",
    description:
      "Scans your website for pages targeting the same keywords and recommends practical fixes to recover organic traffic.",
    type: "website",
    url: "https://content-cannibalization-detector.example",
    siteName: "Content Cannibalization Detector"
  },
  twitter: {
    card: "summary_large_image",
    title: "Content Cannibalization Detector",
    description:
      "Find and fix pages that compete against each other in search results."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} bg-[#0d1117] text-[#e6edf3] antialiased`}
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
