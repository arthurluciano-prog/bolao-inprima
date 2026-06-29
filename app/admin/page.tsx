'use client';

import { useState } from 'react';
import { JOGOS, RESULTADOS, groupByDate } from '@/lib/scoring';
import { JOGOS_KO, RESULTADOS_KO, groupByDateKO } from '@/lib/scoring-ko';

const SENHA_CORRETA = 'copa2026@';

type SaveStatus = 'idle' | 'saving' | 'success' | 'validation-error' | 'api-error';
type AdminFase = 'grupos' | 'ko';

interface Gols { g1: string; g2: string }

function parsarResultado(placar: string): Gols {
  if (!placar) return { g1: '', g2: '' };
  const [a, b] = placar.split('x');
  return { g1: a ?? '', g2: b ?? '' };
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [senhaErro, setSenhaErro] = useState(false);
  const [adminFase, setAdminFase] = useState<AdminFase>('grupos');

  // ── Estado Fase de Grupos ──────────────────────────────────────────────────
  const [resultados, setResultados] = useState<Record<string, string>>({ ...RESULTADOS });
  const [status, setStatus] = useState<Record<string, SaveStatus>>({});
  const [filtro, setFiltro] = useState<'todos' | 'pendentes' | 'apurados'>('todos');
  const [salvandoTudo, setSalvandoTudo] = useState(false);
  const [msgGlobal, setMsgGlobal] = useState('');
  const [gols, setGols] = useState<Record<string, Gols>>(() => {
    const init: Record<string, Gols> = {};
    for (const jogo of JOGOS) {
      init[String(jogo.numero)] = parsarResultado(RESULTADOS[String(jogo.numero)] ?? '');
    }
    return init;
  });

  // ── Estado 2ª Fase ──────────────────────────────────────────────────────────
  const [resultadosKO, setResultadosKO] = useState<Record<string, string>>({ ...RESULTADOS_KO });
  const [statusKO, setStatusKO] = useState<Record<string, SaveStatus>>({});
  const [filtroKO, setFiltroKO] = useState<'todos' | 'pendentes' | 'apurados'>('todos');
  const [salvandoTudoKO, setSalvandoTudoKO] = useState(false);
  const [msgGlobalKO, setMsgGlobalKO] = useState('');
  const [golsKO, setGolsKO] = useState<Record<string, Gols>>(() => {
    const init: Record<string, Gols> = {};
    for (const jogo of JOGOS_KO) {
      init[String(jogo.numero)] = parsarResultado(RESULTADOS_KO[String(jogo.numero)] ?? '');
    }
    return init;
  });

  // ── Funções Fase de Grupos ─────────────────────────────────────────────────
  function setGol(numero: number, campo: 'g1' | 'g2', valor: string) {
    const sanitizado = valor.replace(/\D/g, '').slice(0, 2);
    const key = String(numero);
    setGols((prev) => ({ ...prev, [key]: { ...prev[key], [campo]: sanitizado } }));
    setStatus((prev) => ({ ...prev, [key]: 'idle' }));
    setMsgGlobal('');
  }

  async function salvarJogo(numero: number, g1: string, g2: string) {
    const ambosPreenchidos = g1 !== '' && g2 !== '';
    const ambosVazios = g1 === '' && g2 === '';
    if (!ambosPreenchidos && !ambosVazios) {
      setStatus((prev) => ({ ...prev, [String(numero)]: 'validation-error' }));
      return;
    }
    setStatus((prev) => ({ ...prev, [String(numero)]: 'saving' }));
    const novosResultados = { ...resultados };
    if (ambosPreenchidos) novosResultados[String(numero)] = `${g1}x${g2}`;
    else delete novosResultados[String(numero)];
    try {
      const res = await fetch('/api/admin/update-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: SENHA_CORRETA, resultados: novosResultados }),
      });
      if (res.ok) {
        setResultados(novosResultados);
        setStatus((prev) => ({ ...prev, [String(numero)]: 'success' }));
        setTimeout(() => setStatus((prev) => ({ ...prev, [String(numero)]: 'idle' })), 2500);
      } else {
        setStatus((prev) => ({ ...prev, [String(numero)]: 'api-error' }));
      }
    } catch {
      setStatus((prev) => ({ ...prev, [String(numero)]: 'api-error' }));
    }
  }

  async function salvarTudo(novosResultados: Record<string, string>) {
    setSalvandoTudo(true);
    setMsgGlobal('');
    try {
      const res = await fetch('/api/admin/update-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: SENHA_CORRETA, resultados: novosResultados }),
      });
      if (res.ok) {
        setResultados(novosResultados);
        setMsgGlobal('Resultados salvos! O site atualiza em ~1 minuto.');
      } else {
        const err = await res.json();
        setMsgGlobal(`Erro: ${err.error ?? 'falha ao salvar'}`);
      }
    } catch {
      setMsgGlobal('Erro de conexão. Tente novamente.');
    } finally {
      setSalvandoTudo(false);
    }
  }

  // ── Funções 2ª Fase ────────────────────────────────────────────────────────
  function setGolKO(numero: number, campo: 'g1' | 'g2', valor: string) {
    const sanitizado = valor.replace(/\D/g, '').slice(0, 2);
    const key = String(numero);
    setGolsKO((prev) => ({ ...prev, [key]: { ...prev[key], [campo]: sanitizado } }));
    setStatusKO((prev) => ({ ...prev, [key]: 'idle' }));
    setMsgGlobalKO('');
  }

  async function salvarJogoKO(numero: number, g1: string, g2: string) {
    const ambosPreenchidos = g1 !== '' && g2 !== '';
    const ambosVazios = g1 === '' && g2 === '';
    if (!ambosPreenchidos && !ambosVazios) {
      setStatusKO((prev) => ({ ...prev, [String(numero)]: 'validation-error' }));
      return;
    }
    setStatusKO((prev) => ({ ...prev, [String(numero)]: 'saving' }));
    const novosResultados = { ...resultadosKO };
    if (ambosPreenchidos) novosResultados[String(numero)] = `${g1}x${g2}`;
    else delete novosResultados[String(numero)];
    try {
      const res = await fetch('/api/admin/update-ko-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: SENHA_CORRETA, resultados: novosResultados }),
      });
      if (res.ok) {
        setResultadosKO(novosResultados);
        setStatusKO((prev) => ({ ...prev, [String(numero)]: 'success' }));
        setTimeout(() => setStatusKO((prev) => ({ ...prev, [String(numero)]: 'idle' })), 2500);
      } else {
        setStatusKO((prev) => ({ ...prev, [String(numero)]: 'api-error' }));
      }
    } catch {
      setStatusKO((prev) => ({ ...prev, [String(numero)]: 'api-error' }));
    }
  }

  async function salvarTudoKO(novosResultados: Record<string, string>) {
    setSalvandoTudoKO(true);
    setMsgGlobalKO('');
    try {
      const res = await fetch('/api/admin/update-ko-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: SENHA_CORRETA, resultados: novosResultados }),
      });
      if (res.ok) {
        setResultadosKO(novosResultados);
        setMsgGlobalKO('Resultados da 2ª fase salvos! O site atualiza em ~1 minuto.');
      } else {
        const err = await res.json();
        setMsgGlobalKO(`Erro: ${err.error ?? 'falha ao salvar'}`);
      }
    } catch {
      setMsgGlobalKO('Erro de conexão. Tente novamente.');
    } finally {
      setSalvandoTudoKO(false);
    }
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!autenticado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-sm rounded-card border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <i className="ti ti-lock text-accent" style={{ fontSize: '28px' }} />
            </div>
            <h1 className="font-display text-[24px] text-primary">Painel Admin</h1>
            <p className="text-sm text-gray-500">Bolão Inprima Santo Amaro</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (senha === SENHA_CORRETA) { setAutenticado(true); setSenhaErro(false); }
              else setSenhaErro(true);
            }}
            className="flex flex-col gap-3"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setSenhaErro(false); }}
                placeholder="••••••••"
                autoFocus
                className={`w-full rounded-card border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                  senhaErro ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                }`}
              />
              {senhaErro && <p className="mt-1 text-xs text-red-500">Senha incorreta.</p>}
            </div>
            <button type="submit" className="touch-target w-full rounded-card bg-primary py-3 text-sm font-semibold text-accent">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Painel principal ───────────────────────────────────────────────────────
  const apurados = Object.keys(resultados).length;
  const apuradosKO = Object.keys(resultadosKO).length;
  const isSalvando = adminFase === 'grupos' ? salvandoTudo : salvandoTudoKO;

  const jogosFiltrados = JOGOS.filter((j) => {
    const tem = !!resultados[String(j.numero)];
    if (filtro === 'pendentes') return !tem;
    if (filtro === 'apurados') return tem;
    return true;
  });
  const gruposPorData = groupByDate(jogosFiltrados);

  const jogosFiltradosKO = JOGOS_KO.filter((j) => {
    const tem = !!resultadosKO[String(j.numero)];
    if (filtroKO === 'pendentes') return !tem;
    if (filtroKO === 'apurados') return tem;
    return true;
  });
  const gruposPorDataKO = groupByDateKO(jogosFiltradosKO);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-primary px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[20px] text-accent">Painel Admin</h1>
            <p className="text-[11px] text-white/70">
              {adminFase === 'grupos'
                ? `${apurados} de ${JOGOS.length} jogos apurados`
                : `${apuradosKO} de ${JOGOS_KO.length} jogos apurados`}
            </p>
          </div>
          <button
            onClick={() => {
              if (adminFase === 'grupos') {
                const snapshot: Record<string, string> = {};
                for (const jogo of JOGOS) {
                  const { g1, g2 } = gols[String(jogo.numero)] ?? { g1: '', g2: '' };
                  if (g1 !== '' && g2 !== '') snapshot[String(jogo.numero)] = `${g1}x${g2}`;
                }
                void salvarTudo(snapshot);
              } else {
                const snapshot: Record<string, string> = {};
                for (const jogo of JOGOS_KO) {
                  const { g1, g2 } = golsKO[String(jogo.numero)] ?? { g1: '', g2: '' };
                  if (g1 !== '' && g2 !== '') snapshot[String(jogo.numero)] = `${g1}x${g2}`;
                }
                void salvarTudoKO(snapshot);
              }
            }}
            disabled={isSalvando}
            className="flex items-center gap-2 rounded-card bg-accent px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
          >
            <i className={isSalvando ? 'ti ti-loader-2 animate-spin' : 'ti ti-device-floppy'} />
            {isSalvando ? 'Salvando...' : 'Salvar tudo'}
          </button>
        </div>

        {/* Toggle de fase */}
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setAdminFase('grupos')}
            className={`flex-1 rounded-card py-1.5 text-[12px] font-semibold transition-colors ${
              adminFase === 'grupos' ? 'bg-accent text-primary' : 'bg-white/10 text-white/70'
            }`}
          >
            Fase de Grupos
          </button>
          <button
            onClick={() => setAdminFase('ko')}
            className={`flex-1 rounded-card py-1.5 text-[12px] font-semibold transition-colors ${
              adminFase === 'ko' ? 'bg-accent text-primary' : 'bg-white/10 text-white/70'
            }`}
          >
            2ª Fase (16 Avos)
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* ── Conteúdo Fase de Grupos ── */}
        {adminFase === 'grupos' && (
          <>
            {msgGlobal && (
              <div className={`mb-4 rounded-card border p-3 text-sm font-medium ${
                msgGlobal.startsWith('Erro') ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
              }`}>
                {msgGlobal}
              </div>
            )}
            <div className="mb-4 rounded-card border border-yellow-200 bg-yellow-50 p-3 text-[12px] text-yellow-800">
              Ao salvar, o GitHub é atualizado e o site redeploya automaticamente em ~1 minuto.
            </div>
            <div className="mb-4 flex gap-2">
              {(['todos', 'pendentes', 'apurados'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`flex-1 rounded-card border py-2 text-sm font-medium capitalize transition-colors ${
                    filtro === f ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {gruposPorData.map(({ data, jogos: jogosDoGrupo }) => (
                <div key={data}>
                  <span className="font-display mb-2 inline-block rounded-card bg-primary px-3 py-1 text-[13px] text-accent">
                    {data}
                  </span>
                  <div className="flex flex-col gap-2">
                    {jogosDoGrupo.map((jogo) => {
                      const key = String(jogo.numero);
                      const st = status[key] ?? 'idle';
                      const temResultado = !!resultados[key];
                      const { g1, g2 } = gols[key] ?? { g1: '', g2: '' };
                      return (
                        <div
                          key={jogo.numero}
                          className={`rounded-card border bg-white p-3 transition-all ${
                            temResultado ? 'border-success-border' : 'border-gray-200'
                          }`}
                        >
                          <p className="mb-2 text-[10px] font-medium uppercase text-gray-400">
                            #{jogo.numero} · {jogo.grupo}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-right text-[13px] font-semibold text-gray-800">{jogo.time1}</span>
                            <input
                              type="tel"
                              value={g1}
                              onChange={(e) => setGol(jogo.numero, 'g1', e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && salvarJogo(jogo.numero, g1, g2)}
                              maxLength={2}
                              className={`h-11 w-12 rounded-card border text-center text-[18px] font-bold focus:outline-none focus:ring-2 ${
                                st === 'validation-error' || st === 'api-error' ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                              }`}
                            />
                            <span className="font-display text-[18px] text-gray-400">×</span>
                            <input
                              type="tel"
                              value={g2}
                              onChange={(e) => setGol(jogo.numero, 'g2', e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && salvarJogo(jogo.numero, g1, g2)}
                              maxLength={2}
                              className={`h-11 w-12 rounded-card border text-center text-[18px] font-bold focus:outline-none focus:ring-2 ${
                                st === 'validation-error' || st === 'api-error' ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                              }`}
                            />
                            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-800">{jogo.time2}</span>
                            <button
                              onClick={() => salvarJogo(jogo.numero, g1, g2)}
                              disabled={st === 'saving'}
                              className={`h-11 shrink-0 rounded-card px-3 text-sm font-semibold transition-colors ${
                                st === 'success' ? 'bg-success-bg text-success-text'
                                : st === 'validation-error' || st === 'api-error' ? 'bg-red-100 text-red-700'
                                : st === 'saving' ? 'bg-gray-100 text-gray-400'
                                : 'bg-primary text-accent'
                              }`}
                            >
                              {st === 'saving' && <i className="ti ti-loader-2 animate-spin" />}
                              {st === 'success' && <i className="ti ti-check" />}
                              {st === 'validation-error' || st === 'api-error' ? 'Erro'
                                : st === 'success' ? 'Salvo!'
                                : st === 'saving' ? ''
                                : 'Salvar'}
                            </button>
                          </div>
                          {st === 'validation-error' && (
                            <p className="mt-1 text-[11px] text-red-500">Preencha os dois campos ou deixe ambos vazios.</p>
                          )}
                          {st === 'api-error' && (
                            <p className="mt-1 text-[11px] text-red-500">Erro ao salvar. Verifique a conexão e tente novamente.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Conteúdo 2ª Fase ── */}
        {adminFase === 'ko' && (
          <>
            {msgGlobalKO && (
              <div className={`mb-4 rounded-card border p-3 text-sm font-medium ${
                msgGlobalKO.startsWith('Erro') ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
              }`}>
                {msgGlobalKO}
              </div>
            )}
            <div className="mb-4 rounded-card border border-yellow-200 bg-yellow-50 p-3 text-[12px] text-yellow-800">
              Ao salvar, o GitHub é atualizado e o site redeploya automaticamente em ~1 minuto.
            </div>
            <div className="mb-4 flex gap-2">
              {(['todos', 'pendentes', 'apurados'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroKO(f)}
                  className={`flex-1 rounded-card border py-2 text-sm font-medium capitalize transition-colors ${
                    filtroKO === f ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {gruposPorDataKO.map(({ data, jogos: jogosDoGrupo }) => (
                <div key={data}>
                  <span className="font-display mb-2 inline-block rounded-card bg-primary px-3 py-1 text-[13px] text-accent">
                    {data}
                  </span>
                  <div className="flex flex-col gap-2">
                    {jogosDoGrupo.map((jogo) => {
                      const key = String(jogo.numero);
                      const st = statusKO[key] ?? 'idle';
                      const temResultado = !!resultadosKO[key];
                      const { g1, g2 } = golsKO[key] ?? { g1: '', g2: '' };
                      return (
                        <div
                          key={jogo.numero}
                          className={`rounded-card border bg-white p-3 transition-all ${
                            temResultado ? 'border-success-border' : 'border-gray-200'
                          }`}
                        >
                          <p className="mb-2 text-[10px] font-medium uppercase text-gray-400">
                            #{jogo.numero} · 16 avos
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-right text-[13px] font-semibold text-gray-800">{jogo.time1}</span>
                            <input
                              type="tel"
                              value={g1}
                              onChange={(e) => setGolKO(jogo.numero, 'g1', e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && salvarJogoKO(jogo.numero, g1, g2)}
                              maxLength={2}
                              className={`h-11 w-12 rounded-card border text-center text-[18px] font-bold focus:outline-none focus:ring-2 ${
                                st === 'validation-error' || st === 'api-error' ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                              }`}
                            />
                            <span className="font-display text-[18px] text-gray-400">×</span>
                            <input
                              type="tel"
                              value={g2}
                              onChange={(e) => setGolKO(jogo.numero, 'g2', e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && salvarJogoKO(jogo.numero, g1, g2)}
                              maxLength={2}
                              className={`h-11 w-12 rounded-card border text-center text-[18px] font-bold focus:outline-none focus:ring-2 ${
                                st === 'validation-error' || st === 'api-error' ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                              }`}
                            />
                            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-800">{jogo.time2}</span>
                            <button
                              onClick={() => salvarJogoKO(jogo.numero, g1, g2)}
                              disabled={st === 'saving'}
                              className={`h-11 shrink-0 rounded-card px-3 text-sm font-semibold transition-colors ${
                                st === 'success' ? 'bg-success-bg text-success-text'
                                : st === 'validation-error' || st === 'api-error' ? 'bg-red-100 text-red-700'
                                : st === 'saving' ? 'bg-gray-100 text-gray-400'
                                : 'bg-primary text-accent'
                              }`}
                            >
                              {st === 'saving' && <i className="ti ti-loader-2 animate-spin" />}
                              {st === 'success' && <i className="ti ti-check" />}
                              {st === 'validation-error' || st === 'api-error' ? 'Erro'
                                : st === 'success' ? 'Salvo!'
                                : st === 'saving' ? ''
                                : 'Salvar'}
                            </button>
                          </div>
                          {st === 'validation-error' && (
                            <p className="mt-1 text-[11px] text-red-500">Preencha os dois campos ou deixe ambos vazios.</p>
                          )}
                          {st === 'api-error' && (
                            <p className="mt-1 text-[11px] text-red-500">Erro ao salvar. Verifique a conexão e tente novamente.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
