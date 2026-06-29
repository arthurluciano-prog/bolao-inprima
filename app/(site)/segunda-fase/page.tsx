'use client';

import { useState } from 'react';
import {
  getRankingKO,
  getJogosKOComPontos,
  jogosApuradosKO,
  JOGOS_KO,
  type ParticipantStatsKO,
} from '@/lib/scoring-ko';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function SegundaFasePage() {
  const [selected, setSelected] = useState<ParticipantStatsKO | null>(null);
  const ranking = getRankingKO();
  const apurados = jogosApuradosKO();
  const jogosComPontos = selected ? getJogosKOComPontos(selected.name) : [];

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Cabeçalho */}
        <div>
          <h1 className="font-display text-[28px] text-primary">2ª Fase</h1>
          <p className="text-sm text-gray-500">
            {apurados} de {JOGOS_KO.length} jogos apurados · toque num participante para detalhar
          </p>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-2 rounded-card border border-gray-200 bg-white p-3 text-xs">
          <span className="rounded-card bg-success-bg px-2 py-1 font-medium text-success-text">
            Placar exato = 3 pts
          </span>
          <span className="rounded-card bg-winner-bg px-2 py-1 font-medium text-winner-text">
            Acerto do vencedor = 1 pt
          </span>
        </div>

        {/* Pódio top 3 */}
        <div className="flex flex-col gap-2">
          {ranking.slice(0, 3).map((p, i) => (
            <button
              key={p.name}
              onClick={() => setSelected(p)}
              className={`flex w-full items-center justify-between rounded-card border p-3 text-left transition-all active:scale-[0.98] ${
                i === 0 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[22px]">{MEDALS[i]}</span>
                <span className="text-sm font-semibold text-gray-800">{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-card bg-success-bg px-2 py-0.5 text-[11px] font-semibold text-success-text">
                  {p.exatos} ex.
                </span>
                <span className="rounded-card bg-winner-bg px-2 py-0.5 text-[11px] font-semibold text-winner-text">
                  {p.vencedor} ven.
                </span>
                <span className="font-display text-[26px] text-primary">{p.pontos}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tabela completa */}
        <div className="overflow-hidden rounded-card border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Participante</th>
                <th className="px-1.5 py-2 text-center">Pts</th>
                <th className="px-1.5 py-2 text-center">Ex.</th>
                <th className="px-1.5 py-2 text-center">Ven.</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((p, i) => (
                <tr
                  key={p.name}
                  onClick={() => setSelected(p)}
                  className="cursor-pointer border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50 active:bg-gray-100"
                >
                  <td className="font-display px-3 py-2.5 text-[16px] text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-800">{p.name}</td>
                  <td className="px-1.5 py-2.5 text-center">
                    <span className="font-display inline-block min-w-[34px] rounded-card border border-success-border bg-success-bg px-2 text-[16px] text-success-text">
                      {p.pontos}
                    </span>
                  </td>
                  <td className="px-1.5 py-2.5 text-center text-[13px] text-success-text">{p.exatos}</td>
                  <td className="px-1.5 py-2.5 text-center text-[13px] text-winner-text">{p.vencedor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer — detalhe do participante */}
      {selected && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto rounded-t-[20px] bg-white p-5 shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />

            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Participante</p>
                <h2 className="font-display text-[30px] leading-none text-primary">{selected.name}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 active:bg-gray-200"
              >
                <i className="ti ti-x" style={{ fontSize: '20px' }} />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-3 gap-2">
              <div className="rounded-card bg-primary p-3 text-center">
                <p className="font-display text-[32px] leading-none text-accent">{selected.pontos}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/70">Pts 2ª Fase</p>
              </div>
              <div className="rounded-card bg-success-bg p-3 text-center">
                <p className="font-display text-[32px] leading-none text-success-text">{selected.exatos}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-success-text/70">Exatos</p>
              </div>
              <div className="rounded-card bg-winner-bg p-3 text-center">
                <p className="font-display text-[32px] leading-none text-winner-text">{selected.vencedor}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-winner-text/70">Vencedor</p>
              </div>
            </div>

            <p className="mb-5 text-center text-[11px] text-gray-400">
              {selected.pontos} pts · {selected.exatos} exatos · {selected.vencedor} acertos · {selected.erros} erros
            </p>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Jogos que geraram pontos
            </p>

            {jogosComPontos.length === 0 ? (
              <div className="rounded-card border border-gray-200 bg-gray-50 p-6 text-center">
                <i className="ti ti-clock mb-2 block text-gray-300" style={{ fontSize: '32px' }} />
                <p className="text-sm font-medium text-gray-500">Ainda sem pontos</p>
                <p className="text-xs text-gray-400">Os jogos da 2ª fase começam em breve!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pb-4">
                {jogosComPontos.map(({ jogo, palpite, resultado, outcome, pontos }) => (
                  <div
                    key={jogo.numero}
                    className={`flex items-center gap-3 rounded-card border p-3 ${
                      outcome === 'exact'
                        ? 'border-success-border bg-success-bg'
                        : 'border-winner-border bg-winner-bg'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-400">16 avos · {jogo.data}</p>
                      <p className="text-[13px] font-semibold text-gray-800">
                        {jogo.time1} {resultado[0]}×{resultado[1]} {jogo.time2}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Palpite: <span className="font-semibold">{palpite}</span>
                      </p>
                    </div>
                    <span
                      className={`font-display shrink-0 text-[22px] font-bold ${
                        outcome === 'exact' ? 'text-success-text' : 'text-winner-text'
                      }`}
                    >
                      +{pontos}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
