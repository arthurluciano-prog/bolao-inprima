import jogosData from '@/data/jogos.json';
import palpitesData from '@/data/palpites.json';
import resultadosData from '@/data/resultados.json';

export interface Jogo {
  numero: number;
  grupo: string;
  time1: string;
  time2: string;
  data: string;
}

export type Placar = [number, number];
export type Outcome = 'exact' | 'win' | 'miss' | 'pending';

export const PARTICIPANTS = Object.keys(palpitesData);

export const JOGOS: Jogo[] = jogosData as Jogo[];

export const PALPITES: Record<string, Record<string, string>> = palpitesData as Record<
  string,
  Record<string, string>
>;

export const RESULTADOS: Record<string, string> = resultadosData as Record<string, string>;

export function parsePlacar(placar: string): Placar {
  const [a, b] = placar.split('x').map(Number);
  return [a, b];
}

export function getResultado(numero: number): Placar | null {
  const r = RESULTADOS[String(numero)];
  if (!r) return null;
  return parsePlacar(r);
}

export function getOutcome(palpite: string, resultado: Placar | null): Outcome {
  if (!resultado) return 'pending';
  const [b1, b2] = parsePlacar(palpite);
  const [r1, r2] = resultado;
  if (b1 === r1 && b2 === r2) return 'exact';
  const betDiff = Math.sign(b1 - b2);
  const resDiff = Math.sign(r1 - r2);
  if (betDiff === resDiff) return 'win';
  return 'miss';
}

export interface ParticipantStats {
  name: string;
  pontos: number;
  exatos: number;
  vencedor: number;
  erros: number;
}

export function calcStats(participant: string): ParticipantStats {
  let pontos = 0;
  let exatos = 0;
  let vencedor = 0;
  let erros = 0;

  for (const jogo of JOGOS) {
    const resultado = getResultado(jogo.numero);
    if (!resultado) continue;
    const palpite = PALPITES[participant][String(jogo.numero)];
    const outcome = getOutcome(palpite, resultado);
    if (outcome === 'exact') {
      pontos += 3;
      exatos += 1;
    } else if (outcome === 'win') {
      pontos += 1;
      vencedor += 1;
    } else if (outcome === 'miss') {
      erros += 1;
    }
  }

  return { name: participant, pontos, exatos, vencedor, erros };
}

export function getRanking(): ParticipantStats[] {
  return PARTICIPANTS.map(calcStats).sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.exatos !== a.exatos) return b.exatos - a.exatos;
    return b.vencedor - a.vencedor;
  });
}

export function jogosApurados(): number {
  return JOGOS.filter((j) => getResultado(j.numero) !== null).length;
}

export function getProximoJogo(): Jogo | null {
  for (const jogo of JOGOS) {
    if (getResultado(jogo.numero) === null) return jogo;
  }
  return null;
}

export function groupByDate(jogos: Jogo[]): { data: string; jogos: Jogo[] }[] {
  const map = new Map<string, Jogo[]>();
  for (const jogo of jogos) {
    if (!map.has(jogo.data)) map.set(jogo.data, []);
    map.get(jogo.data)!.push(jogo);
  }
  return Array.from(map.entries()).map(([data, jogos]) => ({ data, jogos }));
}
