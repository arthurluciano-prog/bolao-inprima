'use client';

import { PARTICIPANTS } from '@/lib/scoring';

export default function ParticipantPicker({
  onSelect,
  title = 'Quem é você?',
  subtitle = 'Escolha seu nome para ver seus palpites e sua posição no ranking',
}: {
  onSelect: (name: string) => void;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-card border border-gray-200 bg-white p-4">
      <h2 className="font-display text-[20px] text-primary">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {PARTICIPANTS.map((name) => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className="touch-target rounded-card border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium text-gray-800 transition-colors active:bg-primary active:text-white"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
