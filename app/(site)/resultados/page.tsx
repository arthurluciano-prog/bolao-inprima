'use client';

import { useState } from 'react';
import {
  getResultado,
  getOutcome,
  groupByDate,
  jogosApurados,
  JOGOS,
  PARTICIPANTS,
  PALPITES,
  type Placar,
} from '@/lib/scoring';

const FILTERS = ['Todos', 'Encerrados', 'Pendentes'] as const;
type Filter = (typeof FILTERS)[number];

function ptsBadge(outcome: ReturnType<typeof getOutcome>): { text: string; color: string } | null {
  if (outcome === 'exact') return { text: '+3', color: 'text-success-text' };
  if (outcome === 'win')   return { text: '+1', color: 'text-winner-text' };
  if (outcome === 'miss')  return { text: '0',  color: 'text-gray-400' };
  return null;
}

function PalpitesExpanded({
  jogoNumero,
  resultado,
}: {
  jogoNumero: number;
  resultado: Placar | null;
}) {
  return (
    <div className="divide-y divide-gray-200/60 border-t border-gray-200/60">
      {PARTICIPANTS.map((name) => {
        const palpite = PALPITES[name]?.[String(jogoNumero)] ?? '–';
        const outcome = getOutcome(palpite, resultado);
        const badge = resultado !== null ? ptsBadge(outcome) : null;

        const palpiteColor =
          outcome === 'exact' ? 'text-success-text' :
          outcome === 'win'   ? 'text-winner-text'  :
          outcome === 'miss'  ? 'text-miss-text'     :
          'text-gray-500';

        return (
          <div key={name} className="flex items-center gap-3 px-3 py-2">
            <span className="w-20 shrink-0 truncate text-[12px] font-medium text-gray-700">
              {name}
            </span>
            <span className={`font-display text-[15px] ${palpiteColor}`}>{palpite}</span>
            {badge && (
              <span className={`ml-auto font-display text-[15px] font-bold ${badge.color}`}>
                {badge.text}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ResultadosPage() {
  const [filter, setFilter] = useState<Filter>('Todos');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const apurados = jogosApurados();

  function toggle(numero: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(numero)) next.delete(numero);
      else next.add(numero);
      return next;
    });
  }

  let jogosFiltrados = JOGOS;
  if (filter === 'Encerrados') {
    jogosFiltrados = JOGOS.filter((j) => getResultado(j.numero) !== null);
  } else if (filter === 'Pendentes') {
    jogosFiltrados = JOGOS.filter((j) => getResultado(j.numero) === null);
  }

  const groups = groupByDate(jogosFiltrados);

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-[28px] text-primary">Resultados</h1>
        <p className="text-sm text-gray-500">
          {apurados} de {JOGOS.length} jogos apurados
        </p>
      </div>

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

      {/* Empty state */}
      {groups.length === 0 && (
        <div className="rounded-card border border-gray-200 bg-white p-8 text-center">
          <i
            className="ti ti-calendar-off mb-2 block text-gray-300"
            style={{ fontSize: '40px' }}
          />
          <p className="text-sm font-medium text-gray-500">
            {filter === 'Encerrados'
              ? 'Nenhum jogo apurado ainda'
              : filter === 'Pendentes'
              ? 'Todos os jogos já têm resultado!'
              : 'Nenhum jogo encontrado'}
          </p>
        </div>
      )}

      {/* Lista por data */}
      {groups.map(({ data, jogos }) => {
        const done = jogos.filter((j) => getResultado(j.numero) !== null).length;
        return (
          <div key={data}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-display rounded-card bg-primary px-3 py-1 text-[13px] text-accent">
                {data}
              </span>
              <span className="text-[11px] text-gray-400">
                {jogos.length} jogo{jogos.length > 1 ? 's' : ''}
                {done > 0 ? ` · ${done} apurado${done > 1 ? 's' : ''}` : ''}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {jogos.map((jogo) => {
                const resultado = getResultado(jogo.numero);
                const isExpanded = expanded.has(jogo.numero);
                return (
                  <div
                    key={jogo.numero}
                    className={`overflow-hidden rounded-card border text-[13px] ${
                      resultado
                        ? 'border-success-border bg-success-bg'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Linha do jogo — clicável */}
                    <button
                      className="flex w-full items-center gap-2 p-3 text-left transition-colors active:bg-black/[0.04]"
                      onClick={() => toggle(jogo.numero)}
                    >
                      {/* Grupo */}
                      <span className="w-[50px] shrink-0 rounded border border-gray-200 bg-white/70 px-1 py-0.5 text-center text-[10px] font-semibold text-gray-500">
                        {jogo.grupo.replace('Grupo ', 'G.')}
                      </span>

                      {/* Time 1 */}
                      <span className="flex-1 truncate text-right text-[13px] font-medium text-gray-800">
                        {jogo.time1}
                      </span>

                      {/* Placar */}
                      <span
                        className={`font-display min-w-[56px] text-center text-[20px] ${
                          resultado ? 'text-success-text' : 'text-gray-400'
                        }`}
                      >
                        {resultado ? `${resultado[0]} × ${resultado[1]}` : 'vs'}
                      </span>

                      {/* Time 2 */}
                      <span className="flex-1 truncate text-[13px] font-medium text-gray-800">
                        {jogo.time2}
                      </span>

                      {/* Chevron */}
                      <i
                        className={`ti ti-chevron-down shrink-0 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        } ${resultado ? 'text-success-text/60' : 'text-gray-300'}`}
                        style={{ fontSize: '15px' }}
                      />
                    </button>

                    {/* Palpites — renderiza apenas quando expandido */}
                    {isExpanded && (
                      <PalpitesExpanded jogoNumero={jogo.numero} resultado={resultado} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
