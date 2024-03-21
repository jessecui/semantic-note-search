import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NoteSearch | Semantic Search on Text Notes",
  description:
    "NoteSearch helps you find your notes in a faster and smarter way.",
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
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider
          theme={{
            fontFamily: outfit.style.fontFamily,
            headings: { fontWeight: "500" },
          }}
          defaultColorScheme="dark"          
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
