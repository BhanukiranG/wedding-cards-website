import type { Metadata } from "next";
import { Cinzel_Decorative, Playfair_Display, Great_Vibes, Montserrat } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel_Decorative({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const vibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vibes",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Kalyanam - Wedding Invitation & Guest Management Portal",
  description: "A premium wedding invitation tracking and distribution logistics system with custom routing maps, and vintage aesthetics.",
  keywords: "wedding invitation, logistics, route planning, guest registry, Telugu wedding, vintage card tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${playfair.variable} ${vibes.variable} ${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
