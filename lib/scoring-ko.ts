import jogosKOData from '@/data/jogos-ko.json';
import palpitesKOData from '@/data/palpites-ko.json';
import resultadosKOData from '@/data/resultados-ko.json';
import { parsePlacar, getOutcome, type Placar } from '@/lib/scoring';

export interface JogoKO {
  numero: number;
  time1: string;
  time2: string;
  data: string;
}

export const JOGOS_KO: JogoKO[] = jogosKOData as JogoKO[];
export const PALPITES_KO: Record<string, Record<string, string>> = palpitesKOData as Record<string, Record<string, string>>;
export const RESULTADOS_KO: Record<string, string> = resultadosKOData as Record<string, string>;
export const PARTICIPANTS_KO: string[] = Object.keys(palpitesKOData);

export function getResultadoKO(numero: number): Placar | null {
  const r = RESULTADOS_KO[String(numero)];
  if (!r) return null;
  return parsePlacar(r);
}

export interface ParticipantStatsKO {
  name: string;
  pontos: number;
  exatos: number;
  vencedor: number;
  erros: number;
}

export function calcStatsKO(participant: string): ParticipantStatsKO {
  let pontos = 0, exatos = 0, vencedor = 0, erros = 0;
  for (const jogo of JOGOS_KO) {
    const resultado = getResultadoKO(jogo.numero);
    if (!resultado) continue;
    const palpite = PALPITES_KO[participant]?.[String(jogo.numero)];
    if (!palpite) continue;
    const outcome = getOutcome(palpite, resultado);
    if (outcome === 'exact') { pontos += 3; exatos++; }
    else if (outcome === 'win') { pontos += 1; vencedor++; }
    else if (outcome === 'miss') { erros++; }
  }
  return { name: participant, pontos, exatos, vencedor, erros };
}

export function getRankingKO(): ParticipantStatsKO[] {
  return PARTICIPANTS_KO.map(calcStatsKO).sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.exatos !== a.exatos) return b.exatos - a.exatos;
    return b.vencedor - a.vencedor;
  });
}

export function jogosApuradosKO(): number {
  return JOGOS_KO.filter((j) => getResultadoKO(j.numero) !== null).length;
}

const MONTH_NUM: Record<string, number> = {
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
};

function dateSort(data: string): number {
  const [day, month] = data.split('/');
  return (MONTH_NUM[month] ?? 0) * 100 + parseInt(day, 10);
}

export function groupByDateKO(jogos: JogoKO[]): { data: string; jogos: JogoKO[] }[] {
  const map = new Map<string, JogoKO[]>();
  for (const jogo of jogos) {
    if (!map.has(jogo.data)) map.set(jogo.data, []);
    map.get(jogo.data)!.push(jogo);
  }
  return Array.from(map.entries())
    .map(([data, jogos]) => ({ data, jogos }))
    .sort((a, b) => dateSort(a.data) - dateSort(b.data));
}

export interface JogoKOComPontos {
  jogo: JogoKO;
  palpite: string;
  resultado: Placar;
  outcome: 'exact' | 'win';
  pontos: number;
}

export function getJogosKOComPontos(participant: string): JogoKOComPontos[] {
  const result: JogoKOComPontos[] = [];
  for (const jogo of JOGOS_KO) {
    const resultado = getResultadoKO(jogo.numero);
    if (!resultado) continue;
    const palpite = PALPITES_KO[participant]?.[String(jogo.numero)];
    if (!palpite) continue;
    const outcome = getOutcome(palpite, resultado);
    if (outcome === 'exact' || outcome === 'win') {
      result.push({ jogo, palpite, resultado, outcome, pontos: outcome === 'exact' ? 3 : 1 });
    }
  }
  return result;
}
