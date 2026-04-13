import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Pokemon Champions Damage Calc",
  description: "Pokemon Champions damage calculator with Japanese PokeAPI lookup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
