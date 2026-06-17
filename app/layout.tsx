import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LinkPortfolio | Ary Ribeiro",
  description:
    "Portfólio de links, projetos, redes sociais e contatos de Ary Ribeiro.",
  openGraph: {
    title: "LinkPortfolio | Ary Ribeiro",
    description:
      "Portfólio de links, projetos, redes sociais e contatos de Ary Ribeiro.",
    type: "website",
    locale: "pt_BR",
  },
  other: {
    "theme-color": "#3b82f6",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
