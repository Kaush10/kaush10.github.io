import type { Metadata, Viewport } from "next";
import { EB_Garamond, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kaush Rajesh",
  description:
    "Kaush Rajesh studies brain & cognitive science at UIUC and leads product design at Vinskal.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} h-full bg-background antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <div aria-hidden className="grain pointer-events-none fixed inset-0 z-50" />
      </body>
    </html>
  );
}
