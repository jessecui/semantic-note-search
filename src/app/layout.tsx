import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crux: A Playground for Notes",
  description:
    "Crux is an app designed to organize your ideas in a simple and smart way, helping you create better content faster",
  icons: {
    icon: "/favicon.ico",
  },
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
      <body>
        <MantineProvider
          theme={{
            fontFamily: outfit.style.fontFamily,
            headings: { fontWeight: "500" },
          }}
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
