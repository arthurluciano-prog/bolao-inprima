'use client';

import { useState, useMemo } from 'react';
import { PARTICIPANTS } from '@/lib/scoring';
import {
  calcClassificacaoGrupos,
  calcClassificacaoReal,
  rankMelhores3os,
  get32Classificados,
  type TeamStats,
  type ClassificacaoGrupos,
  type Classificados32,
} from '@/lib/bracket';

type Tab = 'grupos' | 'terceiros' | 'classificados';

const TABS: { key: Tab; label: string }[] = [
  { key: 'grupos',        label: 'Grupos' },
  { key: 'terceiros',     label: 'Melhores 3ºs' },
  { key: 'classificados', label: '32 Classificados' },
];

function posBadge(pos: number): string {
  if (pos === 1) return 'bg-accent text-primary';
  if (pos === 2) return 'bg-primary/10 text-primary';
  if (pos === 3) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-400';
}

function sgLabel(sg: number): string {
  return sg > 0 ? `+${sg}` : String(sg);
}

function GrupoTable({ grupo, times }: { grupo: string; times: TeamStats[] }) {
  return (
    <div className="overflow-hidden rounded-card border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-primary px-3 py-1.5">
        <span className="font-display text-[13px] text-accent">{grupo}</span>
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-[10px] uppercase text-gray-400">
            <th className="w-7 py-1.5 pl-2 text-left">#</th>
            <th className="py-1.5 pl-1 text-left">Seleção</th>
            <th className="w-6 py-1.5 text-center">J</th>
            <th className="w-6 py-1.5 text-center">V</th>
            <th className="w-6 py-1.5 text-center">E</th>
            <th className="w-6 py-1.5 text-center">D</th>
            <th className="w-9 py-1.5 text-center">SG</th>
            <th className="w-9 py-1.5 pr-2 text-center font-bold text-gray-600">Pts</th>
          </tr>
        </thead>
        <tbody>
          {times.map((t, idx) => {
            const pos = idx + 1;
            const dimmed = pos === 4;
            return (
              <tr
                key={t.time}
                className={`border-b border-gray-50 last:border-0 ${dimmed ? 'opacity-50' : ''}`}
              >
                <td className="py-1.5 pl-2">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${posBadge(pos)}`}
                  >
                    {pos}
                  </span>
                </td>
                <td className={`py-1.5 pl-1 font-medium ${dimmed ? 'text-gray-400' : 'text-gray-800'}`}>
                  {t.time}
                </td>
                <td className="py-1.5 text-center text-gray-500">{t.j}</td>
                <td className="py-1.5 text-center text-gray-500">{t.v}</td>
                <td className="py-1.5 text-center text-gray-500">{t.e}</td>
                <td className="py-1.5 text-center text-gray-500">{t.d}</td>
                <td className="py-1.5 text-center text-gray-500">{sgLabel(t.sg)}</td>
                <td className="py-1.5 pr-2 text-center font-bold text-gray-800">{t.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TerceirosTab({ terceiros }: { terceiros: TeamStats[] }) {
  if (terceiros.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
        Nenhum resultado computado ainda.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] text-gray-500">
        Os 8 melhores 3ºs colocados (de 12 grupos) avançam para os 16 Avos de Final.
        Critérios: Pts → SG → Gols → Alfabético.
      </p>
      {terceiros.map((t, idx) => {
        const classifica = idx < 8;
        return (
          <div
            key={t.time}
            className={`flex items-center gap-3 rounded-card border p-3 ${
              classifica ? 'border-success-border bg-success-bg' : 'border-gray-200 bg-white opacity-60'
            }`}
          >
            <span
              className={`font-display w-6 text-center text-[18px] ${
                classifica ? 'text-success-text' : 'text-gray-300'
              }`}
            >
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={`truncate text-[13px] font-semibold ${
                  classifica ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {t.time}
              </p>
              <p className="text-[10px] text-gray-400">{t.grupo}</p>
            </div>
            <span className="text-[12px] text-gray-500">{sgLabel(t.sg)}</span>
            <span className="text-[13px] font-bold text-gray-800">{t.pts} pts</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                classifica
                  ? 'bg-success-text/10 text-success-text'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {classifica ? 'Classif.' : 'Elim.'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ClassificadosSection({
  title,
  badge,
  times,
  labelFn,
}: {
  title: string;
  badge: string;
  times: TeamStats[];
  labelFn: (t: TeamStats) => string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-display text-[18px] text-primary">{title}</h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {badge}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {times.length === 0 ? (
          <div className="rounded-card border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
            Ainda sem dados.
          </div>
        ) : (
          times.map(t => (
            <div
              key={t.time}
              className="flex items-center gap-3 rounded-card border border-success-border bg-success-bg px-3 py-2"
            >
              <i className="ti ti-circle-check shrink-0 text-success-text" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-semibold text-gray-800">{t.time}</p>
                <p className="text-[10px] text-gray-400">{labelFn(t)}</p>
              </div>
              <span className="text-[12px] font-bold text-gray-600">{t.pts} pts</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ClassificadosTab({ classificados }: { classificados: Classificados32 }) {
  return (
    <div className="flex flex-col gap-5">
      <ClassificadosSection
        title="1ºs Colocados"
        badge="12 times"
        times={classificados.primeiros}
        labelFn={t => `1º ${t.grupo}`}
      />
      <ClassificadosSection
        title="2ºs Colocados"
        badge="12 times"
        times={classificados.segundos}
        labelFn={t => `2º ${t.grupo}`}
      />
      <ClassificadosSection
        title="Melhores 3ºs"
        badge="8 times"
        times={classificados.melhores3os}
        labelFn={t => `3º ${t.grupo}`}
      />
    </div>
  );
}

export default function ClassificacaoPage() {
  const [mode, setMode] = useState<string>('real');
  const [tab, setTab] = useState<Tab>('grupos');

  const classificacao = useMemo<ClassificacaoGrupos>(() => {
    if (mode !== 'real') return calcClassificacaoGrupos(mode);
    return calcClassificacaoReal();
  }, [mode]);

  const terceiros = useMemo(() => rankMelhores3os(classificacao), [classificacao]);
  const classificados = useMemo<Classificados32>(() => get32Classificados(classificacao), [classificacao]);

  const isSimulado = mode !== 'real';

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-[28px] text-primary">Classificação</h1>
        <p className="text-sm text-gray-500">Fase de grupos — Copa do Mundo 2026</p>
      </div>

      {/* Seletor de visualização */}
      <div className="relative">
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          className="w-full appearance-none rounded-card border border-gray-300 bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="real">Resultados Reais</option>
          {PARTICIPANTS.map(p => (
            <option key={p} value={p}>{p} (simulado)</option>
          ))}
        </select>
        <i className="ti ti-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {isSimulado && (
        <div className="flex items-center gap-2 rounded-card border border-winner-border bg-winner-bg px-3 py-2 text-xs text-winner-text">
          <i className="ti ti-info-circle shrink-0" />
          <span>Classificação simulada pelos palpites de <strong>{mode}</strong></span>
        </div>
      )}

      {/* Sub-abas */}
      <div className="flex gap-1.5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-card border py-2 text-xs font-medium transition-colors ${
              tab === key
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'grupos' && (
        <div className="flex flex-col gap-3">
          {Object.values(classificacao).map(({ grupo, times }) => (
            <GrupoTable key={grupo} grupo={grupo} times={times} />
          ))}
        </div>
      )}

      {tab === 'terceiros' && <TerceirosTab terceiros={terceiros} />}

      {tab === 'classificados' && <ClassificadosTab classificados={classificados} />}
    </div>
  );
}
