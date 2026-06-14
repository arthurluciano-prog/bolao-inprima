'use client';

import { useState } from 'react';
import { getResultado, groupByDate, jogosApurados, JOGOS } from '@/lib/scoring';

const FILTERS = ['Todos', 'Encerrados', 'Pendentes'] as const;
type Filter = (typeof FILTERS)[number];

export default function ResultadosPage() {
  const [filter, setFilter] = useState<Filter>('Todos');
  const apurados = jogosApurados();

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
                return (
                  <div
                    key={jogo.numero}
                    className={`flex items-center gap-2 rounded-card border p-3 text-[13px] ${
                      resultado
                        ? 'border-success-border bg-success-bg'
                        : 'border-gray-200 bg-white'
                    }`}
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

                    {/* Status */}
                    {resultado ? (
                      <i className="ti ti-circle-check shrink-0 text-success-text" style={{ fontSize: '16px' }} />
                    ) : (
                      <i className="ti ti-clock shrink-0 text-gray-300" style={{ fontSize: '16px' }} />
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
