'use client';

import { useState } from 'react';
import { useParticipant } from '@/lib/useParticipant';
import ParticipantPicker from '@/components/ParticipantPicker';
import {
  PALPITES,
  getResultado,
  getOutcome,
  calcStats,
  groupByDate,
  JOGOS,
  type Outcome,
} from '@/lib/scoring';

const FILTERS = ['Todos', 'Hoje', 'Encerrados'] as const;
type Filter = (typeof FILTERS)[number];

const OUTCOME_STYLES: Record<Outcome, { bg: string; border: string; text: string; label: string }> = {
  exact: { bg: 'bg-success-bg', border: 'border-success-border', text: 'text-success-text', label: '3' },
  win: { bg: 'bg-winner-bg', border: 'border-winner-border', text: 'text-winner-text', label: '1' },
  miss: { bg: 'bg-miss-bg', border: 'border-miss-border', text: 'text-miss-text', label: '0' },
  pending: { bg: 'bg-pending-bg', border: 'border-pending-border', text: 'text-pending-text', label: '–' },
};

// Hoje no formato "DD/mmm" usado pelos jogos (ex: "17/jun")
function hojeFormatado(): string {
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const hoje = new Date();
  return `${String(hoje.getDate()).padStart(2, '0')}/${meses[hoje.getMonth()]}`;
}

export default function PalpitesPage() {
  const { participant, setParticipant, clearParticipant, loaded } = useParticipant();
  const [filter, setFilter] = useState<Filter>('Todos');

  if (!loaded) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">
        Carregando seus palpites...
      </div>
    );
  }

  if (!participant) {
    return (
      <ParticipantPicker
        onSelect={setParticipant}
        title="Quais são seus palpites?"
        subtitle="Escolha seu nome para ver seus 72 palpites da 1ª fase"
      />
    );
  }

  const stats = calcStats(participant);
  const hoje = hojeFormatado();

  let jogosFiltrados = JOGOS;
  if (filter === 'Hoje') {
    jogosFiltrados = JOGOS.filter((j) => j.data === hoje);
  } else if (filter === 'Encerrados') {
    jogosFiltrados = JOGOS.filter((j) => getResultado(j.numero) !== null);
  }

  const groups = groupByDate(jogosFiltrados);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] text-primary">Meus Palpites</h1>
          <p className="text-sm text-gray-500">{participant}</p>
        </div>
        <button onClick={clearParticipant} className="text-xs text-gray-400 underline">
          trocar
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-card bg-gray-100 p-2 text-center">
          <p className="font-display text-[22px] text-success-text">{stats.pontos}</p>
          <p className="text-[10px] text-gray-500">Pontos</p>
        </div>
        <div className="rounded-card bg-gray-100 p-2 text-center">
          <p className="font-display text-[22px] text-success-text">{stats.exatos}</p>
          <p className="text-[10px] text-gray-500">Exatos +3</p>
        </div>
        <div className="rounded-card bg-gray-100 p-2 text-center">
          <p className="font-display text-[22px] text-winner-text">{stats.vencedor}</p>
          <p className="text-[10px] text-gray-500">Vencedor +1</p>
        </div>
        <div className="rounded-card bg-gray-100 p-2 text-center">
          <p className="font-display text-[22px] text-miss-text">{stats.erros}</p>
          <p className="text-[10px] text-gray-500">Erros</p>
        </div>
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

      {/* Lista de palpites agrupados por data */}
      {groups.length === 0 && (
        <div className="rounded-card border border-gray-200 bg-white p-4 text-center text-sm text-gray-500">
          Nenhum jogo encontrado para este filtro.
        </div>
      )}

      {groups.map(({ data, jogos }) => (
        <div key={data}>
          <span className="font-display mb-1 inline-block rounded-card bg-primary px-3 py-1 text-[12px] text-accent">
            {data}
          </span>
          <div className="flex flex-col gap-1.5">
            {jogos.map((jogo) => {
              const palpite = PALPITES[participant][String(jogo.numero)];
              const resultado = getResultado(jogo.numero);
              const outcome = getOutcome(palpite, resultado);
              const style = OUTCOME_STYLES[outcome];
              return (
                <div
                  key={jogo.numero}
                  className={`flex items-center gap-2 rounded-card border p-2.5 text-[13px] ${style.bg} ${style.border}`}
                >
                  <span className={`font-display w-5 text-center text-[15px] font-bold ${style.text}`}>
                    {style.label}
                  </span>
                  <span className="flex-1">
                    <span className="text-[10px] text-gray-400">{jogo.grupo}</span>{' '}
                    <span className="font-medium text-gray-800">
                      {jogo.time1} × {jogo.time2}
                    </span>
                    <br />
                    <span className="text-gray-600">
                      palpite: <span className="font-semibold">{palpite}</span>
                      {resultado && (
                        <>
                          {' '}
                          | real:{' '}
                          <span className="font-semibold">
                            {resultado[0]}x{resultado[1]}
                          </span>
                        </>
                      )}
                    </span>
                  </span>
                  <span className="text-[10px] text-gray-400">#{jogo.numero}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
