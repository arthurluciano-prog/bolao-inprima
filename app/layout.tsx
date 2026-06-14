import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bolão Copa do Mundo Inprima Santo Amaro',
  description: 'Acompanhe o ranking, palpites e resultados da Copa do Mundo 2026',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/@tabler/icons-webfont/3.31.0/tabler-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
