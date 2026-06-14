'use client';

import Link from 'next/link';
import { useParticipant } from '@/lib/useParticipant';
import ParticipantPicker from '@/components/ParticipantPicker';
import {
  getRanking,
  calcStats,
  getProximoJogo,
  jogosApurados,
  JOGOS,
} from '@/lib/scoring';

export default function HomePage() {
  const { participant, setParticipant, clearParticipant, loaded } = useParticipant();

  if (!loaded) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">
        Carregando seu bolão...
      </div>
    );
  }

  if (!participant) {
    return <ParticipantPicker onSelect={setParticipant} />;
  }

  const ranking = getRanking();
  const posicao = ranking.findIndex((r) => r.name === participant) + 1;
  const stats = calcStats(participant);
  const proximo = getProximoJogo();
  const apurados = jogosApurados();
  const top3 = ranking.slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      {/* Saudação */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[22px] text-primary">Olá, {participant}!</h1>
        <button onClick={clearParticipant} className="text-xs text-gray-400 underline">
          trocar
        </button>
      </div>

      {/* Sua posição */}
      <div className="rounded-card border border-green-200 bg-green-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-green-700">
          Sua posição
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-[40px] leading-none text-primary">{posicao}º</span>
          <span className="text-sm text-gray-600">de {ranking.length} participantes</span>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="rounded-card bg-white px-3 py-1 text-sm font-medium text-primary">
            {stats.pontos} pts
          </span>
          <span className="rounded-card bg-success-bg px-3 py-1 text-sm font-medium text-success-text">
            {stats.exatos} exatos
          </span>
          <span className="rounded-card bg-winner-bg px-3 py-1 text-sm font-medium text-winner-text">
            {stats.vencedor} vencedor
          </span>
        </div>
      </div>

      {/* Próximo jogo / status */}
      {proximo ? (
        <div className="rounded-card border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Próximo jogo a sair
          </p>
          <p className="mt-1 text-sm text-gray-500">{proximo.data} · {proximo.grupo}</p>
          <p className="font-display mt-1 text-[20px] text-primary">
            {proximo.time1} × {proximo.time2}
          </p>
        </div>
      ) : (
        <div className="rounded-card border border-gray-200 bg-white p-4 text-center">
          <p className="text-sm text-gray-500">Todos os jogos da 1ª fase já foram apurados!</p>
        </div>
      )}

      {/* Resumo de acertos */}
      <div className="rounded-card border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-700">
          Você acertou{' '}
          <span className="font-semibold text-primary">
            {stats.exatos + stats.vencedor} de {apurados}
          </span>{' '}
          jogos já apurados
        </p>
      </div>

      {/* Top 3 */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          Top 3 do bolão
        </p>
        <div className="flex flex-col gap-2">
          {top3.map((p, i) => (
            <div
              key={p.name}
              className={`flex items-center justify-between rounded-card border p-3 ${
                p.name === participant
                  ? 'border-accent bg-yellow-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-[20px] text-gray-400">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </span>
                <span className="text-sm font-medium text-gray-800">{p.name}</span>
              </div>
              <span className="font-display text-[18px] text-primary">{p.pontos} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/ranking"
        className="touch-target flex items-center justify-center rounded-card bg-primary px-4 py-3 text-center font-display text-[16px] text-accent"
      >
        Ver ranking completo
      </Link>

      <p className="text-center text-xs text-gray-400">
        {JOGOS.length} jogos na 1ª fase · {apurados} já apurados
      </p>
    </div>
  );
}
