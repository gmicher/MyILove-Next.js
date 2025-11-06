/* eslint-disable @next/next/no-sync-scripts */

import "./globals.css";

export const metadata = {
  title: "MyILove - Início",
  description: "Seu espaço especial para planejar e registrar momentos únicos juntos 💖",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="https://unpkg.com/lucide@latest"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
