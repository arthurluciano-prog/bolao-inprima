export type KOPhase = '16avos' | 'oitavas' | 'quartas' | 'semis' | 'final';

export interface KOMatch {
  numero: number;
  fase: KOPhase;
  posicao: number;
  time1: string | null;
  time2: string | null;
  resultado: string | null;
  avanca: string | null;
}

export interface KOBracket {
  fases: Record<KOPhase, KOMatch[]>;
}

// Extensible for any future palpite format (placar or vencedor)
export interface KOPalpiteItem {
  numero: number;
  [key: string]: unknown;
}

export const KO_PHASES: { key: KOPhase; label: string; jogos: number }[] = [
  { key: '16avos',  label: '16 Avos de Final', jogos: 16 },
  { key: 'oitavas', label: 'Oitavas de Final', jogos: 8  },
  { key: 'quartas', label: 'Quartas de Final', jogos: 4  },
  { key: 'semis',   label: 'Semifinais',       jogos: 2  },
  { key: 'final',   label: 'Final',            jogos: 1  },
];

// Returns 0 until KO scoring model is approved
export function calcKOPontos(_participant: string): number {
  return 0;
}
