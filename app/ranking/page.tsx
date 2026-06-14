'use client';

import { useRef } from 'react';
import { useParticipant } from '@/lib/useParticipant';
import { getRanking, jogosApurados, JOGOS } from '@/lib/scoring';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankingPage() {
  const { participant, loaded } = useParticipant();
  const ranking = getRanking();
  const apurados = jogosApurados();
  const myRowRef = useRef<HTMLTableRowElement>(null);

  function scrollToMe() {
    myRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const myStats = participant ? ranking.find((r) => r.name === participant) : null;
  const myPos = myStats ? ranking.findIndex((r) => r.name === myStats.name) + 1 : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-[22px] text-primary">Ranking</h1>
        <p className="text-sm text-gray-500">
          {apurados} de {JOGOS.length} jogos apurados
        </p>
      </div>

      {/* Legenda de pontuação */}
      <div className="flex flex-wrap gap-2 rounded-card border border-gray-200 bg-white p-3 text-xs">
        <span className="rounded-card bg-success-bg px-2 py-1 font-medium text-success-text">
          Placar exato = 3 pts
        </span>
        <span className="rounded-card bg-winner-bg px-2 py-1 font-medium text-winner-text">
          Acerto do vencedor = 1 pt
        </span>
      </div>

      {/* Sua posição + atalho */}
      {loaded && myStats && myPos && (
        <button
          onClick={scrollToMe}
          className="touch-target flex items-center justify-between rounded-card border border-accent bg-yellow-50 px-4 py-3 text-left"
        >
          <span className="text-sm font-medium text-gray-800">
            Você: <span className="font-display text-[18px] text-primary">{myPos}º lugar</span> ·{' '}
            {myStats.pontos} pts
          </span>
          <span className="text-xs text-gray-500">
            ir até <i className="ti ti-arrow-down" aria-hidden="true" />
          </span>
        </button>
      )}

      {/* Pódio vertical (mobile-first) */}
      <div className="flex flex-col gap-2">
        {ranking.slice(0, 3).map((p, i) => (
          <div
            key={p.name}
            className={`flex items-center justify-between rounded-card border p-3 ${
              i === 0
                ? 'border-yellow-300 bg-yellow-50'
                : p.name === participant
                  ? 'border-accent bg-yellow-50'
                  : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-[22px]">{MEDALS[i]}</span>
              <span className="text-sm font-semibold text-gray-800">{p.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-card bg-success-bg px-2 py-0.5 text-[11px] font-semibold text-success-text">
                {p.exatos} exatos
              </span>
              <span className="rounded-card bg-winner-bg px-2 py-0.5 text-[11px] font-semibold text-winner-text">
                {p.vencedor} venc.
              </span>
              <span className="font-display text-[24px] text-primary">{p.pontos}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela completa */}
      <div className="overflow-hidden rounded-card border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Participante</th>
              <th className="px-3 py-2 text-center">Pontos</th>
              <th className="px-3 py-2 text-center">Exatos</th>
              <th className="px-3 py-2 text-center">Venc.</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((p, i) => {
              const isMe = p.name === participant;
              return (
                <tr
                  key={p.name}
                  ref={isMe ? myRowRef : undefined}
                  className={`border-b border-gray-100 last:border-0 ${
                    isMe ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="font-display px-3 py-2 text-[16px] text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {p.name}
                    {isMe && (
                      <span className="ml-2 rounded-card bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        você
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="font-display inline-block min-w-[34px] rounded-card border border-success-border bg-success-bg px-2 text-[16px] text-success-text">
                      {p.pontos}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center text-success-text">{p.exatos}</td>
                  <td className="px-3 py-2 text-center text-winner-text">{p.vencedor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
