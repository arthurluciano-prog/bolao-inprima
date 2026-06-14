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
      <div>
        <h1 className="font-display text-[22px] text-primary">Resultados</h1>
        <p className="text-sm text-gray-500">
          {apurados} de {JOGOS.length} jogos já apurados
        </p>
      </div>

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

      {groups.length === 0 && (
        <div className="rounded-card border border-gray-200 bg-white p-4 text-center text-sm text-gray-500">
          {filter === 'Pendentes'
            ? 'Todos os jogos já têm resultado!'
            : 'Os jogos ainda não começaram — volte em breve!'}
        </div>
      )}

      {groups.map(({ data, jogos }) => {
        const done = jogos.filter((j) => getResultado(j.numero) !== null).length;
        return (
          <div key={data}>
            <div className="mb-1 flex items-center gap-2">
              <span className="font-display rounded-card bg-primary px-3 py-1 text-[12px] text-accent">
                {data}
              </span>
              <span className="text-[11px] text-gray-400">
                {jogos.length} jogos{done > 0 ? ` · ${done} apurado${done > 1 ? 's' : ''}` : ''}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {jogos.map((jogo) => {
                const resultado = getResultado(jogo.numero);
                return (
                  <div
                    key={jogo.numero}
                    className={`flex items-center gap-2 rounded-card border p-2.5 text-[13px] ${
                      resultado
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span className="w-[52px] shrink-0 rounded-card border border-gray-200 bg-gray-50 px-1 py-0.5 text-center text-[10px] font-semibold text-gray-500">
                      {jogo.grupo.replace('Grupo ', 'G. ')}
                    </span>
                    <span className="flex-1 truncate font-medium text-gray-800">
                      {jogo.time1}
                    </span>
                    <span className="font-display min-w-[52px] text-center text-[18px] text-primary">
                      {resultado ? `${resultado[0]} × ${resultado[1]}` : 'vs'}
                    </span>
                    <span className="flex-1 truncate text-right font-medium text-gray-800">
                      {jogo.time2}
                    </span>
                    <span className="w-6 shrink-0 text-right text-[10px] text-gray-400">
                      #{jogo.numero}
                    </span>
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
