'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: 'Início', icon: 'ti-home' },
  { href: '/ranking', label: 'Ranking', icon: 'ti-trophy' },
  { href: '/palpites', label: 'Meus Palpites', icon: 'ti-clipboard-list' },
  { href: '/resultados', label: 'Resultados', icon: 'ti-calendar-event' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom sticky bottom-0 z-20 grid grid-cols-4 border-t border-gray-200 bg-white">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
              active ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <i className={`ti ${item.icon}`} style={{ fontSize: '20px' }} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
