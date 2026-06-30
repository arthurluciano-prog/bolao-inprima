'use client';

import { useState } from 'react';
import {
  PALPITES_KO,
  PARTICIPANTS_KO,
  getResultadoKO,
  calcStatsKO,
  groupByDateKO,
  JOGOS_KO,
} from '@/lib/scoring-ko';
import { getOutcome, type Outcome } from '@/lib/scoring';

const OUTCOME_CONFIG: Record<Outcome, { bg: string; border: string; text: string; label: string }> = {
  exact:   { bg: 'bg-success-bg',  border: 'border-success-border',  text: 'text-success-text',  label: '+3' },
  win:     { bg: 'bg-winner-bg',   border: 'border-winner-border',   text: 'text-winner-text',   label: '+1' },
  miss:    { bg: 'bg-miss-bg',     border: 'border-miss-border',     text: 'text-miss-text',     label: '0'  },
  pending: { bg: 'bg-pending-bg',  border: 'border-pending-border',  text: 'text-pending-text',  label: '–'  },
};

const FILTERS = ['Todos', 'Encerrados', 'Pendentes'] as const;
type Filter = (typeof FILTERS)[number];

export default function PalpitesPage() {
  const [participant, setParticipant] = useState('');
  const [filter, setFilter] = useState<Filter>('Todos');

  let jogosFiltrados = JOGOS_KO;
  if (filter === 'Encerrados') jogosFiltrados = JOGOS_KO.filter((j) => getResultadoKO(j.numero) !== null);
  if (filter === 'Pendentes')  jogosFiltrados = JOGOS_KO.filter((j) => getResultadoKO(j.numero) === null);

  const groups = groupByDateKO(jogosFiltrados);
  const stats = participant ? calcStatsKO(participant) : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-[28px] text-primary">Palpites</h1>
        <p className="text-sm text-gray-500">2ª fase · Selecione um participante</p>
      </div>

      {/* Dropdown de participante */}
      <div className="relative">
        <select
          value={participant}
          onChange={(e) => setParticipant(e.target.value)}
          className="w-full appearance-none rounded-card border border-gray-300 bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Escolha um participante...</option>
          {PARTICIPANTS_KO.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <i className="ti ti-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Resumo de stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-card bg-primary p-2 text-center">
            <p className="font-display text-[24px] leading-none text-accent">{stats.pontos}</p>
            <p className="mt-1 text-[10px] font-medium text-white/70">Pontos</p>
          </div>
          <div className="rounded-card bg-success-bg p-2 text-center">
            <p className="font-display text-[24px] leading-none text-success-text">{stats.exatos}</p>
            <p className="mt-1 text-[10px] font-medium text-success-text/70">+3 pts</p>
          </div>
          <div className="rounded-card bg-winner-bg p-2 text-center">
            <p className="font-display text-[24px] leading-none text-winner-text">{stats.vencedor}</p>
            <p className="mt-1 text-[10px] font-medium text-winner-text/70">+1 pt</p>
          </div>
          <div className="rounded-card bg-miss-bg p-2 text-center">
            <p className="font-display text-[24px] leading-none text-miss-text">{stats.erros}</p>
            <p className="mt-1 text-[10px] font-medium text-miss-text/70">Erros</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`touch-target flex-1 rounded-card border px-3 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Empty state sem participante */}
      {!participant && (
        <div className="rounded-card border border-dashed border-gray-300 bg-white p-10 text-center">
          <i className="ti ti-user-search mb-3 block text-gray-300" style={{ fontSize: '44px' }} />
          <p className="text-sm font-medium text-gray-500">Nenhum participante selecionado</p>
          <p className="text-xs text-gray-400">Use o seletor acima para ver os palpites</p>
        </div>
      )}

      {/* Empty state sem jogos no filtro */}
      {participant && groups.length === 0 && (
        <div className="rounded-card border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Nenhum jogo para este filtro.
        </div>
      )}

      {/* Lista de palpites agrupados por data */}
      {participant &&
        groups.map(({ data, jogos }) => (
          <div key={data}>
            <span className="font-display mb-1.5 inline-block rounded-card bg-primary px-3 py-1 text-[13px] text-accent">
              {data}
            </span>
            <div className="flex flex-col gap-1.5">
              {jogos.map((jogo) => {
                const rawPalpite = PALPITES_KO[participant]?.[String(jogo.numero)];
                const palpite = rawPalpite ?? '–';
                const resultado = getResultadoKO(jogo.numero);
                const outcome: Outcome = rawPalpite ? getOutcome(rawPalpite, resultado) : 'pending';
                const cfg = OUTCOME_CONFIG[outcome];
                return (
                  <div
                    key={jogo.numero}
                    className={`flex items-center gap-3 rounded-card border p-2.5 ${cfg.bg} ${cfg.border}`}
                  >
                    <span className={`font-display w-8 shrink-0 text-center text-[16px] font-bold ${cfg.text}`}>
                      {cfg.label}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400">16 avos · #{jogo.numero}</p>
                      <p className="truncate text-[13px] font-semibold text-gray-800">
                        {jogo.time1} × {jogo.time2}
                      </p>
                      <p className="text-[11px] text-gray-600">
                        Palpite: <span className="font-semibold">{palpite}</span>
                        {resultado && rawPalpite && (
                          <span className="text-gray-400">
                            {' '}· Real:{' '}
                            <span className="font-semibold">{resultado[0]}×{resultado[1]}</span>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
