export default function RegrasPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-[28px] text-primary">Regras</h1>
        <p className="text-sm text-gray-500">Como funciona a pontuação do bolão</p>
      </div>

      {/* Sistema de pontuação */}
      <div className="rounded-card border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
          Sistema de Pontuação
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-card border border-success-border bg-success-bg p-3">
            <span className="font-display text-[28px] text-success-text">+3</span>
            <div>
              <p className="text-[13px] font-semibold text-gray-800">Placar exato</p>
              <p className="text-[12px] text-gray-500">Acertou o resultado completo</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-card border border-winner-border bg-winner-bg p-3">
            <span className="font-display text-[28px] text-winner-text">+1</span>
            <div>
              <p className="text-[13px] font-semibold text-gray-800">Acerto do vencedor ou empate</p>
              <p className="text-[12px] text-gray-500">Acertou quem ganhou, mas não o placar</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-card border border-miss-border bg-miss-bg p-3">
            <span className="font-display text-[28px] text-miss-text">0</span>
            <div>
              <p className="text-[13px] font-semibold text-gray-800">Errou</p>
              <p className="text-[12px] text-gray-500">Resultado diferente do esperado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exemplos */}
      <div className="rounded-card border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
          Exemplos práticos
        </h2>
        <div className="flex flex-col gap-4">
          {/* Exemplo +3 */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-card bg-success-bg px-2 py-0.5 text-[11px] font-bold text-success-text">
                +3 pontos
              </span>
              <span className="text-[12px] text-gray-400">Placar exato</span>
            </div>
            <div className="rounded-card border border-gray-100 bg-gray-50 p-3 text-[13px]">
              <p className="font-medium text-gray-700">Brasil 2 × 1 Marrocos</p>
              <p className="text-gray-500">
                Palpite: <span className="font-semibold text-success-text">2x1</span> ✓
              </p>
            </div>
          </div>

          {/* Exemplo +1 */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-card bg-winner-bg px-2 py-0.5 text-[11px] font-bold text-winner-text">
                +1 ponto
              </span>
              <span className="text-[12px] text-gray-400">Acerto do vencedor</span>
            </div>
            <div className="rounded-card border border-gray-100 bg-gray-50 p-3 text-[13px]">
              <p className="font-medium text-gray-700">Brasil 3 × 0 Marrocos</p>
              <p className="text-gray-500">
                Palpite: <span className="font-semibold text-winner-text">2x1</span> — acertou que o Brasil ganharia
              </p>
            </div>
          </div>

          {/* Exemplo 0 */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-card bg-miss-bg px-2 py-0.5 text-[11px] font-bold text-miss-text">
                0 pontos
              </span>
              <span className="text-[12px] text-gray-400">Errou</span>
            </div>
            <div className="rounded-card border border-gray-100 bg-gray-50 p-3 text-[13px]">
              <p className="font-medium text-gray-700">Marrocos 1 × 0 Brasil</p>
              <p className="text-gray-500">
                Palpite: <span className="font-semibold text-miss-text">2x1</span> — previu vitória do Brasil
              </p>
            </div>
          </div>

          {/* Exemplo empate */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-card bg-winner-bg px-2 py-0.5 text-[11px] font-bold text-winner-text">
                +1 ponto
              </span>
              <span className="text-[12px] text-gray-400">Acerto do empate</span>
            </div>
            <div className="rounded-card border border-gray-100 bg-gray-50 p-3 text-[13px]">
              <p className="font-medium text-gray-700">Brasil 1 × 1 Marrocos</p>
              <p className="text-gray-500">
                Palpite: <span className="font-semibold text-winner-text">0x0</span> — acertou o empate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desempate */}
      <div className="rounded-card border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
          Critério de desempate
        </h2>
        <ol className="flex flex-col gap-1 text-[13px] text-gray-600">
          <li className="flex items-start gap-2">
            <span className="font-display mt-0.5 shrink-0 text-[16px] text-primary">1.</span>
            Maior pontuação total
          </li>
          <li className="flex items-start gap-2">
            <span className="font-display mt-0.5 shrink-0 text-[16px] text-primary">2.</span>
            Maior número de acertos exatos (+3)
          </li>
          <li className="flex items-start gap-2">
            <span className="font-display mt-0.5 shrink-0 text-[16px] text-primary">3.</span>
            Maior número de acertos de vencedor (+1)
          </li>
        </ol>
      </div>

      {/* Info sobre os jogos */}
      <div className="rounded-card border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-[13px] text-gray-500">
          São <span className="font-semibold text-primary">72 jogos</span> na fase de grupos da Copa do Mundo 2026
        </p>
        <p className="text-[12px] text-gray-400">de 11 de junho a 27 de junho de 2026</p>
      </div>
    </div>
  );
}
