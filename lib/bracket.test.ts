/**
 * Testes do critério de desempate FIFA 2026 — Confrontos Diretos
 *
 * Ordem de aplicação:
 *   Passo 1  — H2H pts → H2H saldo → H2H gols pró (recursor nos sub-empates)
 *   Passo 2  — Saldo geral → Gols pró geral → Ordem alfabética
 */

import { describe, it, expect } from 'vitest';
import { classifyGrupo } from './bracket';

// ---------------------------------------------------------------------------
// Cenário 1 — Empate entre 2 seleções
// ---------------------------------------------------------------------------
//
// Jogos:
//   Alpha 2×0 Beta      Alpha 1×0 Gamma     Delta 1×0 Alpha
//   Gamma 2×0 Beta      Beta  1×0 Delta      Gamma 2×0 Delta
//
// Tabela geral:
//   Alpha  6 pts  (V Beta, V Gamma, D Delta)  gp=3 gc=2 sg=+1
//   Gamma  6 pts  (V Beta, L Alpha, V Delta)  gp=3 gc=1 sg=+2
//   Beta   3 pts  (L Alpha, L Gamma, V Delta) gp=1 gc=4 sg=-3
//   Delta  3 pts  (V Alpha, L Beta, L Gamma)  gp=1 gc=2 sg=-1
//
// Desempate Alpha × Gamma (ambos 6 pts):
//   Confronto direto: Alpha 1×0 Gamma → Alpha: 3 H2H pts, Gamma: 0 H2H pts
//   → Alpha 1º, Gamma 2º  ✓
//
// Desempate Beta × Delta (ambos 3 pts):
//   Confronto direto: Beta 1×0 Delta → Beta: 3 H2H pts, Delta: 0 H2H pts
//   → Beta 3º, Delta 4º  ✓
//
// Resultado esperado: [ Alpha, Gamma, Beta, Delta ]

describe('Cenário 1 — empate entre 2 seleções', () => {
  it('H2H pts resolve o empate entre Alpha e Gamma', () => {
    const resultado = classifyGrupo([
      { time1: 'Alpha', time2: 'Beta',  g1: 2, g2: 0 }, // Alpha vence
      { time1: 'Alpha', time2: 'Gamma', g1: 1, g2: 0 }, // Alpha vence (confronto direto)
      { time1: 'Alpha', time2: 'Delta', g1: 0, g2: 1 }, // Delta vence
      { time1: 'Beta',  time2: 'Gamma', g1: 0, g2: 2 }, // Gamma vence
      { time1: 'Beta',  time2: 'Delta', g1: 1, g2: 0 }, // Beta vence
      { time1: 'Gamma', time2: 'Delta', g1: 2, g2: 0 }, // Gamma vence
    ]);

    expect(resultado).toEqual(['Alpha', 'Gamma', 'Beta', 'Delta']);
  });
});

// ---------------------------------------------------------------------------
// Cenário 2 — Empate entre 3 seleções
// ---------------------------------------------------------------------------
//
// Jogos:
//   Alpha 3×0 Beta      Gamma 1×0 Alpha     Beta 2×0 Gamma
//   Alpha 1×0 Delta     Beta  1×0 Delta      Gamma 1×0 Delta
//
// Tabela geral:
//   Alpha  6 pts  (V Beta 3-0, L Gamma 0-1, V Delta 1-0)  gp=4 gc=1 sg=+3
//   Beta   6 pts  (L Alpha 0-3, V Gamma 2-0, V Delta 1-0) gp=3 gc=3 sg=0
//   Gamma  6 pts  (V Alpha 1-0, L Beta 0-2, V Delta 1-0)  gp=2 gc=2 sg=0
//   Delta  0 pts  (todas derrotas)
//
// Desempate Alpha × Beta × Gamma (todos 6 pts) — H2H entre os 3:
//
//   Alpha vs Beta  3×0 → Alpha: +3 H2H pts, +3 H2H sg, 3 H2H gp
//                         Beta:  +0 H2H pts, -3 H2H sg, 0 H2H gp
//   Beta  vs Gamma 2×0 → Beta:  +3 H2H pts, +2 H2H sg, 2 H2H gp
//                         Gamma: +0 H2H pts, -2 H2H sg, 0 H2H gp
//   Gamma vs Alpha 1×0 → Gamma: +3 H2H pts, +1 H2H sg, 1 H2H gp
//                         Alpha: +0 H2H pts, -1 H2H sg, 0 H2H gp
//
//   H2H totais:
//     Alpha: 3 pts, sg=+3-1=+2, gp=3
//     Beta:  3 pts, sg=-3+2=-1, gp=2
//     Gamma: 3 pts, sg=-2+1=-1, gp=1
//
//   H2H pts iguais → desempatar por H2H saldo:
//     Alpha sg=+2 (melhor) → Alpha 1º
//
//   Sub-empate residual {Beta, Gamma}: H2H pts=-1 sg iguais → recursão
//     Jogo entre eles: Beta 2×0 Gamma → Beta 3 H2H pts, Gamma 0
//     → Beta 2º, Gamma 3º  ✓
//
// Resultado esperado: [ Alpha, Beta, Gamma, Delta ]

describe('Cenário 2 — empate entre 3 seleções', () => {
  it('H2H saldo resolve Alpha; recursão sobre sub-empate Beta×Gamma', () => {
    const resultado = classifyGrupo([
      { time1: 'Alpha', time2: 'Beta',  g1: 3, g2: 0 }, // Alpha vence (margem grande)
      { time1: 'Alpha', time2: 'Gamma', g1: 0, g2: 1 }, // Gamma vence (margem pequena)
      { time1: 'Alpha', time2: 'Delta', g1: 1, g2: 0 },
      { time1: 'Beta',  time2: 'Gamma', g1: 2, g2: 0 }, // Beta vence (margem média)
      { time1: 'Beta',  time2: 'Delta', g1: 1, g2: 0 },
      { time1: 'Gamma', time2: 'Delta', g1: 1, g2: 0 },
    ]);

    expect(resultado).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta']);
  });
});

// ---------------------------------------------------------------------------
// Cenário 3 — Empate entre 4 seleções
// ---------------------------------------------------------------------------
//
// Jogos (vitórias circulares + empates cruzados):
//   Alpha 3×0 Beta    (Alpha vence por grande margem)
//   Alpha 0×0 Gamma   (empate)
//   Alpha 0×2 Delta   (Delta vence)
//   Beta  2×0 Gamma   (Beta vence)
//   Beta  0×0 Delta   (empate)
//   Gamma 2×0 Delta   (Gamma vence)
//
// Tabela geral:
//   Alpha  4 pts  (V Beta, E Gamma, D Delta)  gp=3 gc=2 sg=+1
//   Beta   4 pts  (L Alpha, V Gamma, E Delta) gp=2 gc=3 sg=-1
//   Gamma  4 pts  (E Alpha, L Beta, V Delta)  gp=2 gc=2 sg=0
//   Delta  4 pts  (V Alpha, E Beta, L Gamma)  gp=2 gc=2 sg=0
//
// Empate entre TODOS os 4 — H2H geral:
//
//   Alpha vs Beta  3×0 → Alpha: +3 pts, +3 sg, 3 gp; Beta:  0, -3, 0
//   Alpha vs Gamma 0×0 → Alpha: +1 pt,  0 sg, 0 gp; Gamma: +1, 0, 0
//   Delta vs Alpha 2×0 → Delta: +3 pts, +2 sg, 2 gp; Alpha: 0, -2, 0
//   Beta  vs Gamma 2×0 → Beta:  +3 pts, +2 sg, 2 gp; Gamma: 0, -2, 0
//   Beta  vs Delta 0×0 → Beta:  +1 pt,  0 sg, 0 gp; Delta: +1, 0, 0
//   Gamma vs Delta 2×0 → Gamma: +3 pts, +2 sg, 2 gp; Delta: 0, -2, 0
//
//   H2H totais:
//     Alpha: 4 pts, sg=+3+0-2=+1, gp=3
//     Beta:  4 pts, sg=-3+2+0=-1, gp=2
//     Gamma: 4 pts, sg=0-2+2=0,   gp=2
//     Delta: 4 pts, sg=+2+0-2=0,  gp=2
//
//   H2H pts iguais (4) → desempatar por H2H saldo:
//     Alpha sg=+1 → Alpha 1º (isolado)
//     Beta  sg=-1 → Beta  4º (isolado)
//     Gamma sg=0, Delta sg=0 → sub-empate {Gamma, Delta}
//
//   Recursão {Gamma, Delta}:
//     Confronto direto: Gamma 2×0 Delta → Gamma: 3 H2H pts, Delta: 0
//     → Gamma 2º, Delta 3º  ✓
//
// Resultado esperado: [ Alpha, Gamma, Delta, Beta ]

describe('Cenário 3 — empate entre 4 seleções', () => {
  it('H2H saldo cria dois sub-grupos; recursão resolve cada sub-grupo', () => {
    const resultado = classifyGrupo([
      { time1: 'Alpha', time2: 'Beta',  g1: 3, g2: 0 }, // Alpha vence
      { time1: 'Alpha', time2: 'Gamma', g1: 0, g2: 0 }, // empate
      { time1: 'Alpha', time2: 'Delta', g1: 0, g2: 2 }, // Delta vence
      { time1: 'Beta',  time2: 'Gamma', g1: 2, g2: 0 }, // Beta vence
      { time1: 'Beta',  time2: 'Delta', g1: 0, g2: 0 }, // empate
      { time1: 'Gamma', time2: 'Delta', g1: 2, g2: 0 }, // Gamma vence
    ]);

    expect(resultado).toEqual(['Alpha', 'Gamma', 'Delta', 'Beta']);
  });
});
