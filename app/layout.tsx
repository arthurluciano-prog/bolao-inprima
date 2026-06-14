import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Bolão Copa do Mundo Inprima Santo Amaro',
  description: 'Acompanhe o ranking, seus palpites e os resultados da Copa do Mundo 2026',
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
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 px-3 py-4 pb-4">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
