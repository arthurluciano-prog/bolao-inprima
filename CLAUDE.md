# Bolão Copa do Mundo Inprima Santo Amaro

## O que é este projeto

Site público de consulta para o bolão da Copa do Mundo 2026 da empresa Inprima (unidade Santo
Amaro). Ranking, palpites de 16 participantes e resultados reais dos 72 jogos da 1ª fase.

**Decisão de arquitetura fundamental: não há login, autenticação, contas de usuário ou backend.**
É um site 100% estático (Next.js com `output: 'export'`), com export para HTML/CSS/JS puro,
hospedado no Vercel (plano gratuito). Qualquer pessoa com o link acessa as mesmas 4 telas. A
"identificação" do participante (para personalizar Início e Meus Palpites) é feita só por
`localStorage` no navegador — não é login, é apenas "lembrar neste aparelho".

A única operação de escrita do sistema inteiro é o administrador editando `data/resultados.json`
com os placares reais conforme os jogos acontecem, e fazendo `git push` (o Vercel redeploya
automaticamente).

## Stack

- Next.js 15 (App Router), `output: 'export'` — site estático, sem servidor
- React 19
- TypeScript
- Tailwind CSS
- Sem banco de dados, sem API routes, sem autenticação

## Estrutura de dados (em `data/`)

Três arquivos JSON são toda a "base de dados" do projeto:

- **`jogos.json`** — array com os 72 jogos: `{numero, grupo, time1, time2, data}`. Fixo, não muda.
- **`palpites.json`** — objeto `{ [participante]: { [numeroJogo]: "AxB" } }` com os 1.152
  palpites dos 16 participantes (Cida, Ray, Girleide, Van, Alexandre, Fabiano, Elizete, Bia,
  Augusto, Eliane, Pablo, Jose, Juliana, Fernando, Hariel, Everton). Fixo, não muda.
- **`resultados.json`** — objeto `{ [numeroJogo]: "AxB" }` com os placares reais. **Único
  arquivo editável**, começa vazio (`{}`) e o admin vai preenchendo conforme os jogos saem.

Toda a lógica de cálculo (ranking, pontuação, status de cada palpite) está centralizada em
`lib/scoring.ts` e é derivada cruzando `palpites.json` + `resultados.json` em tempo de
renderização. Não duplicar essa lógica em outros lugares.

### Regra de pontuação

- Placar exato = **3 pontos**
- Acerto do vencedor/empate (sem o placar exato) = **1 ponto**
- Errou = 0 pontos

## Estrutura de páginas (4 abas, navegação inferior fixa no mobile)

1. **`/` (Início)** — dashboard: card "Sua posição" em destaque, próximo jogo a sair, resumo de
   acertos, top 3. Pede o nome do participante na primeira visita (ParticipantPicker).
2. **`/ranking`** — tabela completa ordenada por pontos, com legenda fixa explicando a
   pontuação, pódio vertical (mobile-first), destaque amarelo na linha do participante
   selecionado e atalho "ir até minha posição".
3. **`/palpites`** (Meus Palpites) — os 72 palpites do participante selecionado, agrupados por
   data, com 4 estados visuais: exato (verde), vencedor (azul), erro (vermelho), pendente
   (cinza). Filtros: Todos / Hoje / Encerrados.
4. **`/resultados`** — somente leitura, agrupado por data, placares reais. Filtros: Todos /
   Encerrados / Pendentes.

## Identidade visual (já implementada em `tailwind.config.js` + `app/globals.css`)

- Cor primária: `#1B4332` (verde escuro Inprima)
- Cor de destaque: `#F5C518` (dourado)
- Fonte de títulos/números grandes: Bebas Neue (`font-display`)
- Fonte de corpo: Inter
- Cores de feedback: verde (`success`, exato), azul (`winner`, acerto de vencedor), vermelho
  (`miss`, erro), cinza (`pending`, ainda não apurado)
- Logo em `public/logo-inprima.webp`
- Ícones: Tabler Icons via CDN (`<i class="ti ti-...">`), já carregado no `app/layout.tsx`
- Área de toque mínima de 44px (`.touch-target` em `globals.css`)

## Estado atual

O projeto já foi gerado, `npm install` e `npm run build` foram testados com sucesso (build
estático limpo, 0 erros, 5 páginas geradas em `out/`). Os dados de `jogos.json` e
`palpites.json` já foram validados manualmente contra o PDF original dos palpites (revisão
feita página a página com o usuário). `resultados.json` está vazio — nenhum jogo da Copa
começou ainda.

## Próximos passos sugeridos

1. **Testar localmente**: `npm install && npm run dev`, abrir `http://localhost:3000`,
   verificar as 4 telas no modo responsivo do navegador (simular mobile).
2. **Inicializar git e subir para o GitHub**: `git init`, commit inicial, criar repositório
   remoto, `git push`.
3. **Deploy no Vercel**: importar o repositório no Vercel (detecta Next.js automaticamente, sem
   configuração extra). Confirmar que o build de produção funciona igual ao local.
4. **Testar o fluxo de atualização de resultado**: editar `data/resultados.json` adicionando um
   placar de teste (ex: `{"1": "2x0"}`), confirmar que Ranking, Meus Palpites e Resultados
   recalculam corretamente, depois remover o teste antes de ir ao ar.
5. **Polimento opcional** (não bloqueante para o lançamento):
   - Revisar responsividade em telas muito pequenas (320px)
   - Adicionar favicon baseado no logo Inprima
   - Considerar um botão de compartilhamento ("Compartilhar minha posição")
   - Considerar um pequeno gráfico de evolução de posição ao longo da Copa (melhoria futura,
     exigiria guardar histórico de `resultados.json` por data — fora do escopo do MVP)

## Convenções e restrições a manter

- Não adicionar autenticação, contas, sessões ou qualquer dependência de backend/banco de dados.
  Se uma funcionalidade parecer exigir isso, repensar a abordagem para caber no modelo estático.
- Não remover o `output: 'export'` do `next.config.js` sem necessidade explícita — é o que
  permite o deploy gratuito e simples no Vercel.
- Toda nova lógica de cálculo de pontuação/ranking deve passar por `lib/scoring.ts`, não
  duplicar em componentes.
- Manter a identidade visual (cores, Bebas Neue, logo) consistente em qualquer tela nova.
- `data/jogos.json` e `data/palpites.json` já foram validados manualmente — não alterar sem
  confirmação explícita do usuário, pois representam dados reais conferidos contra o PDF
  original do bolão.
