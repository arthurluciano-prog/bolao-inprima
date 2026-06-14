'use client';

import { useState, useEffect } from 'react';
import { JOGOS, RESULTADOS } from '@/lib/scoring';

const SENHA_CORRETA = 'copa2026@';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [senhaErro, setSenhaErro] = useState(false);

  // Estado local dos resultados (começa com o que está no JSON atual)
  const [resultados, setResultados] = useState<Record<string, string>>({ ...RESULTADOS });
  const [status, setStatus] = useState<Record<string, SaveStatus>>({});
  const [filtro, setFiltro] = useState<'todos' | 'pendentes' | 'apurados'>('todos');
  const [salvandoTudo, setSalvandoTudo] = useState(false);
  const [msgGlobal, setMsgGlobal] = useState('');

  // Inputs temporários por jogo (antes de salvar)
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const jogo of JOGOS) {
      init[jogo.numero] = RESULTADOS[String(jogo.numero)] ?? '';
    }
    return init;
  });

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (senha === SENHA_CORRETA) {
      setAutenticado(true);
      setSenhaErro(false);
    } else {
      setSenhaErro(true);
    }
  }

  function handleInput(numero: number, valor: string) {
    setInputs((prev) => ({ ...prev, [numero]: valor }));
    setStatus((prev) => ({ ...prev, [numero]: 'idle' }));
  }

  function validarPlacar(valor: string): string | null {
    const trimmed = (valor ?? '').trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^(\d+)\s*[xX\-]\s*(\d+)$/);
    if (!match) return null;
    return `${match[1]}x${match[2]}`;
  }

  async function salvarJogo(numero: number) {
    const rawInput = inputs[numero];
    const placarValido = validarPlacar(rawInput);

    // Se há texto mas é inválido, marca erro
    if (rawInput.trim() && placarValido === null) {
      setStatus((prev) => ({ ...prev, [numero]: 'error' }));
      return;
    }

    setStatus((prev) => ({ ...prev, [numero]: 'saving' }));

    const novosResultados = { ...resultados };
    if (placarValido) {
      novosResultados[String(numero)] = placarValido;
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
        setInputs((prev) => ({ ...prev, [numero]: placarValido ?? '' }));
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
      const placar = validarPlacar(inputs[jogo.numero]);
      if (placar) novosResultados[String(jogo.numero)] = placar;
    }

    try {
      const res = await fetch('/api/admin/update-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: SENHA_CORRETA, resultados: novosResultados }),
      });

      if (res.ok) {
        setResultados(novosResultados);
        setMsgGlobal('Todos os resultados salvos! O site atualiza em ~1 minuto.');
        // Sincroniza os inputs com os dados salvos
        const novosInputs: Record<string, string> = {};
        for (const jogo of JOGOS) {
          const placar = validarPlacar(inputs[jogo.numero]);
          novosInputs[jogo.numero] = placar ?? '';
        }
        setInputs(novosInputs);
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
    const temResultado = !!resultados[String(j.numero)];
    if (filtro === 'pendentes') return !temResultado;
    if (filtro === 'apurados') return temResultado;
    return true;
  });

  // Tela de login
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
                  senhaErro
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                }`}
              />
              {senhaErro && (
                <p className="mt-1 text-xs text-red-500">Senha incorreta. Tente novamente.</p>
              )}
            </div>
            <button
              type="submit"
              className="touch-target w-full rounded-card bg-primary py-3 text-sm font-semibold text-accent"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            {salvandoTudo ? (
              <>
                <i className="ti ti-loader-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <i className="ti ti-device-floppy" />
                Salvar tudo
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Mensagem global */}
        {msgGlobal && (
          <div
            className={`mb-4 rounded-card border p-3 text-sm font-medium ${
              msgGlobal.startsWith('Erro')
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-700'
            }`}
          >
            {msgGlobal}
          </div>
        )}

        {/* Aviso de configuração */}
        <div className="mb-4 rounded-card border border-yellow-200 bg-yellow-50 p-3 text-[12px] text-yellow-800">
          <strong>Como funciona:</strong> ao salvar, o arquivo <code>resultados.json</code> é atualizado
          diretamente no GitHub e o Vercel redeploya o site automaticamente em ~1 minuto.
        </div>

        {/* Filtros */}
        <div className="mb-4 flex gap-2">
          {(['todos', 'pendentes', 'apurados'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`flex-1 rounded-card border py-2 text-sm font-medium capitalize transition-colors ${
                filtro === f
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Instrução de formato */}
        <p className="mb-3 text-[11px] text-gray-400">
          Formato do resultado: <strong>GolesTime1</strong>x<strong>GolesTime2</strong> — ex: <code>2x1</code>, <code>0x0</code>. Deixe vazio para remover.
        </p>

        {/* Lista de jogos */}
        <div className="flex flex-col gap-2">
          {jogosFiltrados.map((jogo) => {
            const st = status[jogo.numero] ?? 'idle';
            const temResultado = !!resultados[String(jogo.numero)];
            return (
              <div
                key={jogo.numero}
                className={`rounded-card border bg-white p-3 transition-all ${
                  temResultado ? 'border-success-border' : 'border-gray-200'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium uppercase text-gray-400">
                      #{jogo.numero} · {jogo.grupo} · {jogo.data}
                    </span>
                    <p className="text-[14px] font-semibold text-gray-800">
                      {jogo.time1} × {jogo.time2}
                    </p>
                  </div>
                  {temResultado && (
                    <span className="rounded-card bg-success-bg px-2 py-0.5 text-[11px] font-semibold text-success-text">
                      {resultados[String(jogo.numero)]}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputs[jogo.numero] ?? ''}
                    onChange={(e) => handleInput(jogo.numero, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && salvarJogo(jogo.numero)}
                    placeholder="ex: 2x1"
                    maxLength={5}
                    className={`flex-1 rounded-card border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      st === 'error'
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  <button
                    onClick={() => salvarJogo(jogo.numero)}
                    disabled={st === 'saving'}
                    className={`flex min-w-[80px] items-center justify-center gap-1 rounded-card px-3 py-2 text-sm font-medium transition-colors ${
                      st === 'success'
                        ? 'bg-success-bg text-success-text'
                        : st === 'error'
                        ? 'bg-red-100 text-red-700'
                        : st === 'saving'
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-primary text-accent'
                    }`}
                  >
                    {st === 'saving' && <i className="ti ti-loader-2 animate-spin" />}
                    {st === 'success' && <i className="ti ti-check" />}
                    {st === 'error' && <i className="ti ti-x" />}
                    {st === 'idle' && 'Salvar'}
                    {st === 'saving' ? '' : st === 'success' ? 'Salvo!' : st === 'error' ? 'Erro' : ''}
                  </button>
                </div>

                {st === 'error' && (
                  <p className="mt-1 text-[11px] text-red-500">
                    Formato inválido. Use NxN (ex: 2x1) ou deixe vazio.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
