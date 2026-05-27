import type { Metadata } from "next";
import { Barlow_Condensed, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-barlow",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "DRG Dashboard",
  description: "Deep Rock Galactic stats dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${barlowCondensed.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Navbar></Navbar>
        {children}
      </body>
    </html>
  );
}
