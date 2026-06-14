'use client';

import { useState } from 'react';
import { JOGOS, RESULTADOS } from '@/lib/scoring';

const SENHA_CORRETA = 'copa2026@';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

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

  const [resultados, setResultados] = useState<Record<string, string>>({ ...RESULTADOS });
  const [status, setStatus] = useState<Record<string, SaveStatus>>({});
  const [filtro, setFiltro] = useState<'todos' | 'pendentes' | 'apurados'>('todos');
  const [salvandoTudo, setSalvandoTudo] = useState(false);
  const [msgGlobal, setMsgGlobal] = useState('');

  // Dois campos por jogo: g1 e g2
  const [gols, setGols] = useState<Record<string, Gols>>(() => {
    const init: Record<string, Gols> = {};
    for (const jogo of JOGOS) {
      init[jogo.numero] = parsarResultado(RESULTADOS[String(jogo.numero)] ?? '');
    }
    return init;
  });

  function setGol(numero: number, campo: 'g1' | 'g2', valor: string) {
    const sanitizado = valor.replace(/\D/g, '').slice(0, 2);
    setGols((prev) => ({ ...prev, [numero]: { ...prev[numero], [campo]: sanitizado } }));
    setStatus((prev) => ({ ...prev, [numero]: 'idle' }));
    setMsgGlobal('');
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (senha === SENHA_CORRETA) { setAutenticado(true); setSenhaErro(false); }
    else setSenhaErro(true);
  }

  async function salvarJogo(numero: number) {
    const { g1, g2 } = gols[numero] ?? { g1: '', g2: '' };
    const ambosPreenchidos = g1 !== '' && g2 !== '';
    const ambosVazios = g1 === '' && g2 === '';

    if (!ambosPreenchidos && !ambosVazios) {
      setStatus((prev) => ({ ...prev, [numero]: 'error' }));
      return;
    }

    setStatus((prev) => ({ ...prev, [numero]: 'saving' }));

    const novosResultados = { ...resultados };
    if (ambosPreenchidos) {
      novosResultados[String(numero)] = `${g1}x${g2}`;
    } else {
      delete novosResultados[String(numero)];
    }

    try {
      const res = await fetch('/api/admin/update-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: SENHA_CORRETA, resultados: novosResultados }),
      });

      if (res.ok) {
        setResultados(novosResultados);
        setStatus((prev) => ({ ...prev, [numero]: 'success' }));
        setTimeout(() => setStatus((prev) => ({ ...prev, [numero]: 'idle' })), 2500);
      } else {
        setStatus((prev) => ({ ...prev, [numero]: 'error' }));
      }
    } catch {
      setStatus((prev) => ({ ...prev, [numero]: 'error' }));
    }
  }

  async function salvarTudo() {
    setSalvandoTudo(true);
    setMsgGlobal('');

    const novosResultados: Record<string, string> = {};
    for (const jogo of JOGOS) {
      const { g1, g2 } = gols[jogo.numero] ?? { g1: '', g2: '' };
      if (g1 !== '' && g2 !== '') {
        novosResultados[String(jogo.numero)] = `${g1}x${g2}`;
      }
    }

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

  const jogosFiltrados = JOGOS.filter((j) => {
    const tem = !!resultados[String(j.numero)];
    if (filtro === 'pendentes') return !tem;
    if (filtro === 'apurados') return tem;
    return true;
  });

  // ── Tela de login ──────────────────────────────────────────────────────────
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
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-primary px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[20px] text-accent">Painel Admin</h1>
            <p className="text-[11px] text-white/70">{apurados} de {JOGOS.length} jogos apurados</p>
          </div>
          <button
            onClick={salvarTudo}
            disabled={salvandoTudo}
            className="flex items-center gap-2 rounded-card bg-accent px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
          >
            <i className={salvandoTudo ? 'ti ti-loader-2 animate-spin' : 'ti ti-device-floppy'} />
            {salvandoTudo ? 'Salvando...' : 'Salvar tudo'}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Mensagem global */}
        {msgGlobal && (
          <div className={`mb-4 rounded-card border p-3 text-sm font-medium ${
            msgGlobal.startsWith('Erro') ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
          }`}>
            {msgGlobal}
          </div>
        )}

        {/* Aviso */}
        <div className="mb-4 rounded-card border border-yellow-200 bg-yellow-50 p-3 text-[12px] text-yellow-800">
          Ao salvar, o GitHub é atualizado e o site redeploya automaticamente em ~1 minuto.
        </div>

        {/* Filtros */}
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

        {/* Lista de jogos */}
        <div className="flex flex-col gap-2">
          {jogosFiltrados.map((jogo) => {
            const st = status[jogo.numero] ?? 'idle';
            const temResultado = !!resultados[String(jogo.numero)];
            const { g1, g2 } = gols[jogo.numero] ?? { g1: '', g2: '' };

            return (
              <div
                key={jogo.numero}
                className={`rounded-card border bg-white p-3 transition-all ${
                  temResultado ? 'border-success-border' : 'border-gray-200'
                }`}
              >
                {/* Info do jogo */}
                <p className="mb-2 text-[10px] font-medium uppercase text-gray-400">
                  #{jogo.numero} · {jogo.grupo} · {jogo.data}
                </p>

                {/* Layout: Time1 [gol] × [gol] Time2 [Salvar] */}
                <div className="flex items-center gap-2">
                  {/* Time 1 */}
                  <span className="min-w-0 flex-1 truncate text-right text-[13px] font-semibold text-gray-800">
                    {jogo.time1}
                  </span>

                  {/* Input gols time 1 */}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={g1}
                    onChange={(e) => setGol(jogo.numero, 'g1', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && salvarJogo(jogo.numero)}
                    placeholder="0"
                    maxLength={2}
                    className={`h-11 w-12 rounded-card border text-center text-[18px] font-bold focus:outline-none focus:ring-2 ${
                      st === 'error' ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                    }`}
                  />

                  <span className="font-display text-[18px] text-gray-400">×</span>

                  {/* Input gols time 2 */}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={g2}
                    onChange={(e) => setGol(jogo.numero, 'g2', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && salvarJogo(jogo.numero)}
                    placeholder="0"
                    maxLength={2}
                    className={`h-11 w-12 rounded-card border text-center text-[18px] font-bold focus:outline-none focus:ring-2 ${
                      st === 'error' ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                    }`}
                  />

                  {/* Time 2 */}
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-800">
                    {jogo.time2}
                  </span>

                  {/* Botão Salvar */}
                  <button
                    onClick={() => salvarJogo(jogo.numero)}
                    disabled={st === 'saving'}
                    className={`h-11 shrink-0 rounded-card px-3 text-sm font-semibold transition-colors ${
                      st === 'success' ? 'bg-success-bg text-success-text'
                      : st === 'error' ? 'bg-red-100 text-red-700'
                      : st === 'saving' ? 'bg-gray-100 text-gray-400'
                      : 'bg-primary text-accent'
                    }`}
                  >
                    {st === 'saving' && <i className="ti ti-loader-2 animate-spin" />}
                    {st === 'success' && <i className="ti ti-check" />}
                    {st === 'error' ? 'Erro' : st === 'success' ? 'Salvo!' : st === 'saving' ? '' : 'Salvar'}
                  </button>
                </div>

                {st === 'error' && (
                  <p className="mt-1 text-[11px] text-red-500">Preencha os dois campos ou deixe ambos vazios.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
