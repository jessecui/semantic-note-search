import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";

import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crux: A Playground for Ideas",
  description:
    "Crux is an app designed to organize your ideas in a simple and smart way, helping you create better content faster",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={outfit.className}>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
