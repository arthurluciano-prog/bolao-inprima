import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-3 py-4 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
