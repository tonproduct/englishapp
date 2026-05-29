import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Patterns — Luca",
  description: "Padrões de inglês para o dia a dia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
