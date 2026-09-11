import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Tektur } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const tektur = Tektur({
  variable: "--font-tektur",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Post a deal on Creditcoin, pay on Ethereum, and the Attestcoin transaction proof releases the other side. No bridge, no oracle, no trust.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gage-omega.vercel.app"),
  title: {
    default: "Gage · proof-settled escrow",
    template: "%s · Gage",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: "https://gage-omega.vercel.app",
    siteName: "Gage",
    title: "Gage · proof-settled escrow",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Gage · proof-settled escrow",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0c0e10",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} ${tektur.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-on-accent"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
