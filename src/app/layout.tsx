import type { Metadata, Viewport } from "next";
import { EB_Garamond, Geist, Geist_Mono } from "next/font/google";
import { ThemeToggle } from "@/components/ThemeToggle";
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

// Sets the theme before the first paint: a choice saved with the toggle,
// otherwise dark.
const THEME_SCRIPT = `(function(){try{if(localStorage.getItem("theme")==="light")document.documentElement.setAttribute("data-theme","light")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} h-full bg-background antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <ThemeToggle />
        <div
          aria-hidden
          className="grain pointer-events-none fixed inset-0 z-50"
        />
      </body>
    </html>
  );
}
