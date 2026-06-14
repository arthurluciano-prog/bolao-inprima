import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-primary px-4 py-2 shadow-sm">
      <Image
        src="/logo-inprima.webp"
        alt="InPrima"
        width={90}
        height={41}
        className="h-9 w-auto object-contain"
        priority
      />
      <div className="h-8 w-px bg-white/25" />
      <div className="flex min-w-0 flex-col leading-none">
        <span className="text-[10px] font-medium uppercase tracking-[2px] text-accent">
          FIFA 2026
        </span>
        <span className="font-display truncate text-[17px] text-white">
          Bolão Inprima Santo Amaro
        </span>
      </div>
    </header>
  );
}
