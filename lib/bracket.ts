import { JOGOS, PALPITES, RESULTADOS, type Jogo } from '@/lib/scoring';

export interface TeamStats {
  time: string;
  grupo: string;
  j: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  sg: number;
  pts: number;
}

interface JogoComPlacar {
  time1: string;
  time2: string;
  g1: number;
  g2: number;
}

interface H2HInfo {
  pts: number;
  sg: number;
  gp: number;
}

export interface ClassificacaoGrupo {
  grupo: string;
  times: TeamStats[];
}

export type ClassificacaoGrupos = Record<string, ClassificacaoGrupo>;

export interface Classificados32 {
  primeiros: TeamStats[];
  segundos: TeamStats[];
  melhores3os: TeamStats[];
}

// --- Confrontos Diretos (Head-to-Head) ---

function getH2HStats(tiedTeams: string[], jogos: JogoComPlacar[]): Record<string, H2HInfo> {
  const stats: Record<string, H2HInfo> = {};
  for (const t of tiedTeams) stats[t] = { pts: 0, sg: 0, gp: 0 };

  for (const j of jogos) {
    if (!tiedTeams.includes(j.time1) || !tiedTeams.includes(j.time2)) continue;
    stats[j.time1]!.gp += j.g1;
    stats[j.time2]!.gp += j.g2;
    stats[j.time1]!.sg += j.g1 - j.g2;
    stats[j.time2]!.sg += j.g2 - j.g1;
    if (j.g1 > j.g2) {
      stats[j.time1]!.pts += 3;
    } else if (j.g1 === j.g2) {
      stats[j.time1]!.pts += 1;
      stats[j.time2]!.pts += 1;
    } else {
      stats[j.time2]!.pts += 3;
    }
  }

  return stats;
}

function applyGeneralStats(teams: TeamStats[]): TeamStats[] {
  return [...teams].sort((a, b) => {
    if (b.sg !== a.sg) return b.sg - a.sg;
    if (b.gp !== a.gp) return b.gp - a.gp;
    return a.time.localeCompare(b.time);
  });
}

// Recursively resolve a tied sub-group using FIFA 2026 tiebreaker rules:
// Passo 1: H2H pts → H2H sg → H2H gp (recurse on remaining sub-ties)
// Passo 2 (only if H2H is completely inconclusive): General sg → gp → alphabetical
function resolveH2H(teams: TeamStats[], jogos: JogoComPlacar[]): TeamStats[] {
  if (teams.length <= 1) return teams;

  const names = teams.map(t => t.time);
  const h2h = getH2HStats(names, jogos);

  const firstH2H = h2h[names[0]]!;
  const allSame = teams.every(
    t =>
      h2h[t.time]!.pts === firstH2H.pts &&
      h2h[t.time]!.sg === firstH2H.sg &&
      h2h[t.time]!.gp === firstH2H.gp,
  );
  if (allSame) return applyGeneralStats(teams);

  const sorted = [...teams].sort((a, b) => {
    const ha = h2h[a.time]!, hb = h2h[b.time]!;
    if (hb.pts !== ha.pts) return hb.pts - ha.pts;
    if (hb.sg !== ha.sg) return hb.sg - ha.sg;
    return hb.gp - ha.gp;
  });

  const result: TeamStats[] = [];
  let i = 0;
  while (i < sorted.length) {
    const cur = h2h[sorted[i]!.time]!;
    let j = i + 1;
    while (
      j < sorted.length &&
      h2h[sorted[j]!.time]!.pts === cur.pts &&
      h2h[sorted[j]!.time]!.sg === cur.sg &&
      h2h[sorted[j]!.time]!.gp === cur.gp
    )
      j++;

    const sub = sorted.slice(i, j);
    if (sub.length === 1) result.push(sub[0]!);
    else if (sub.length < teams.length) result.push(...resolveH2H(sub, jogos));
    else result.push(...applyGeneralStats(sub));
    i = j;
  }

  return result;
}

function sortGrupo(teams: TeamStats[], jogos: JogoComPlacar[]): TeamStats[] {
  const byPts = [...teams].sort((a, b) => b.pts - a.pts);
  const result: TeamStats[] = [];
  let i = 0;
  while (i < byPts.length) {
    let j = i + 1;
    while (j < byPts.length && byPts[j]!.pts === byPts[i]!.pts) j++;
    const group = byPts.slice(i, j);
    result.push(...(group.length === 1 ? group : resolveH2H(group as TeamStats[], jogos)));
    i = j;
  }
  return result;
}

function calcGrupoComPlacares(
  grupo: string,
  jogosDoGrupo: Jogo[],
  placares: Record<string, string>,
): ClassificacaoGrupo {
  const teamsSet = new Set<string>();
  for (const j of jogosDoGrupo) {
    teamsSet.add(j.time1);
    teamsSet.add(j.time2);
  }

  const statsMap: Record<string, TeamStats> = {};
  for (const time of teamsSet) {
    statsMap[time] = { time, grupo, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, pts: 0 };
  }

  const jogosComPlacar: JogoComPlacar[] = [];

  for (const jogo of jogosDoGrupo) {
    const placar = placares[String(jogo.numero)];
    if (!placar) continue;
    const parts = placar.split('x');
    if (parts.length !== 2) continue;
    const g1 = parseInt(parts[0]!, 10);
    const g2 = parseInt(parts[1]!, 10);
    if (isNaN(g1) || isNaN(g2)) continue;

    jogosComPlacar.push({ time1: jogo.time1, time2: jogo.time2, g1, g2 });

    statsMap[jogo.time1]!.j++;
    statsMap[jogo.time2]!.j++;
    statsMap[jogo.time1]!.gp += g1;
    statsMap[jogo.time1]!.gc += g2;
    statsMap[jogo.time2]!.gp += g2;
    statsMap[jogo.time2]!.gc += g1;
    statsMap[jogo.time1]!.sg += g1 - g2;
    statsMap[jogo.time2]!.sg += g2 - g1;

    if (g1 > g2) {
      statsMap[jogo.time1]!.v++;
      statsMap[jogo.time2]!.d++;
      statsMap[jogo.time1]!.pts += 3;
    } else if (g1 === g2) {
      statsMap[jogo.time1]!.e++;
      statsMap[jogo.time2]!.e++;
      statsMap[jogo.time1]!.pts++;
      statsMap[jogo.time2]!.pts++;
    } else {
      statsMap[jogo.time2]!.v++;
      statsMap[jogo.time1]!.d++;
      statsMap[jogo.time2]!.pts += 3;
    }
  }

  return { grupo, times: sortGrupo(Object.values(statsMap), jogosComPlacar) };
}

function buildClassificacao(placares: Record<string, string>): ClassificacaoGrupos {
  const grupos = [...new Set(JOGOS.map(j => j.grupo))];
  const result: ClassificacaoGrupos = {};
  for (const grupo of grupos) {
    result[grupo] = calcGrupoComPlacares(grupo, JOGOS.filter(j => j.grupo === grupo), placares);
  }
  return result;
}

// --- Test helper ---

export interface JogoInput {
  time1: string;
  time2: string;
  g1: number;
  g2: number;
}

// Accepts raw game data, returns team names in final classification order.
// Used by tests to exercise the full sorting pipeline without depending on real palpites/resultados.
export function classifyGrupo(games: JogoInput[]): string[] {
  const grupo = 'Grupo Teste';
  const jogosDoGrupo = games.map((g, i) => ({
    numero: i + 1,
    grupo,
    time1: g.time1,
    time2: g.time2,
    data: '01/jan',
  }));
  const placares = Object.fromEntries(games.map((g, i) => [String(i + 1), `${g.g1}x${g.g2}`]));
  return calcGrupoComPlacares(grupo, jogosDoGrupo, placares).times.map(t => t.time);
}

// --- Public API ---

export function calcClassificacaoGrupos(participant: string): ClassificacaoGrupos {
  return buildClassificacao(PALPITES[participant] ?? {});
}

export function calcClassificacaoReal(): ClassificacaoGrupos {
  return buildClassificacao(RESULTADOS);
}

export function rankMelhores3os(classificacao: ClassificacaoGrupos): TeamStats[] {
  return Object.values(classificacao)
    .filter(g => g.times.length >= 3)
    .map(g => g.times[2]!)
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.sg !== a.sg) return b.sg - a.sg;
      if (b.gp !== a.gp) return b.gp - a.gp;
      return a.time.localeCompare(b.time);
    });
}

export function get32Classificados(classificacao: ClassificacaoGrupos): Classificados32 {
  const primeiros: TeamStats[] = [];
  const segundos: TeamStats[] = [];
  for (const g of Object.values(classificacao)) {
    if (g.times[0]) primeiros.push(g.times[0]);
    if (g.times[1]) segundos.push(g.times[1]);
  }
  const melhores3os = rankMelhores3os(classificacao).slice(0, 8);
  return { primeiros, segundos, melhores3os };
}
