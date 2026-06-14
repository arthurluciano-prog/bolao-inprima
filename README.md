# Bolão Copa do Mundo Inprima Santo Amaro

Site público de consulta para o bolão da Copa do Mundo 2026 — ranking, palpites e resultados.
Sem login. Qualquer pessoa com o link acessa as 4 telas (Início, Ranking, Meus Palpites, Resultados).

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000

## Estrutura de dados

Tudo fica em `data/`, em 3 arquivos JSON:

- **`jogos.json`** — os 72 jogos da 1ª fase (grupo, times, data). Não muda.
- **`palpites.json`** — os 1.152 palpites dos 16 participantes. Não muda.
- **`resultados.json`** — os placares reais. **Este é o único arquivo que o admin edita.**

## Como atualizar um resultado (administrador)

Abra `data/resultados.json` e adicione/edite uma linha no formato:

```json
{
  "1": "2x0",
  "5": "1x1"
}
```

A chave é o **número do jogo** (1 a 72, conforme `jogos.json`), e o valor é o placar real no
formato `"golsTime1xgolsTime2"`.

### Passo a passo (sem terminal, direto no GitHub)

1. Acesse o repositório no GitHub.
2. Abra `data/resultados.json`.
3. Clique no ícone de lápis (editar arquivo).
4. Adicione ou altere a linha do jogo correspondente.
5. Clique em "Commit changes".
6. O Vercel detecta o commit e republica o site automaticamente em ~30-60 segundos.

### Passo a passo (terminal / Claude Code)

```bash
# edite data/resultados.json manualmente, depois:
git add data/resultados.json
git commit -m "Atualiza resultado do jogo X"
git push
```

O ranking, "Meus Palpites" e "Resultados" recalculam tudo automaticamente a partir desse arquivo —
não é preciso tocar em nenhum outro lugar do código.

## Deploy no Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em https://vercel.com → "Add New Project" → importe o repositório.
3. O Vercel detecta Next.js automaticamente — não é preciso configurar nada.
4. Cada `git push` na branch principal gera um novo deploy automaticamente.

## Tecnologias

- Next.js 14 (App Router, export estático)
- Tailwind CSS
- Nenhum banco de dados, nenhuma autenticação, nenhum backend — tudo é estático.

## Sobre a seleção de participante

A tela "Início" e "Meus Palpites" pedem para o visitante escolher seu nome na primeira visita.
Essa escolha é salva apenas no `localStorage` do navegador (não é login, não é enviada para
nenhum servidor) — serve só para personalizar a experiência naquele aparelho. Pode ser trocada
a qualquer momento pelo botão "trocar".
