# Como contribuir

Obrigado por querer ajudar. Este app é usado por pessoas em um momento frágil da vida, então cada mudança passa por
uma pergunta só:

> **Isso ajuda uma pessoa em recuperação, com evidência de que funciona?**
> Se a evidência é fraca, a mudança precisa ser barata, opcional e não pode atrapalhar o momento de crise.

## Princípios que não mudam

1. **Nenhum dado sai do aparelho.** Sem analytics, crash reporting, conta ou servidor. Uma exceção só entra com
   decisão registrada no [`CLAUDE.md`](CLAUDE.md).
2. **A ajuda abre na hora.** "Ajuda agora" abre sem dados, sem cadastro e sem PIN, em no máximo 2 toques.
3. **Nada zera e nada culpa.** Recaída vira informação, não fracasso (efeito de violação da abstinência, Marlatt).
   Textos diretos, acolhedores, sem moralismo e sem "você falhou".
4. **Linguagem simples.** Sem jargão clínico nem esotérico sem explicação.
5. **Discrição.** Notificações e lembretes não mencionam droga nem recaída.

## Começando

Requisitos: Node.js 22 LTS.

```bash
npm install
npm run dev        # http://localhost:5173 (e no IP da rede, para abrir no celular)
npm test           # Vitest + Testing Library
npm run typecheck
npm run build
```

Para ver o app com dados de exemplo sem tocar em nada real: `http://localhost:5173/?demo`.
Também abre pronto no GitHub Codespaces (`.devcontainer/`).

## Onde fica cada coisa

- `src/domain/` — regras puras (rotina, previsão do dia, armadilhas do pensamento, progresso, jogos). **Toda mudança aqui tem teste.**
- `src/data/` — repositórios (`localStorage`). A interface nunca toca no armazenamento direto: usa `useData()`.
  Mudou o formato dos dados? Continue lendo o formato antigo: tem gente com dados no celular.
- `src/features/<tela>/` — telas e componentes.
- `src/ui/` — estilos e componentes compartilhados. Cores só por variáveis CSS (tema claro e noite).

## Fluxo

1. Abra uma issue (ideia ou problema) antes de mudanças grandes.
2. Crie um branch, faça commits pequenos **em português, no imperativo**: `adiciona …`, `corrige …`.
3. Antes do PR: `npm run typecheck && npm test && npm run build`.
4. No PR, conte o antes e o depois em linguagem simples e, se for recurso novo, a evidência por trás.

## Evidência

Cite a fonte no PR e, se for uma decisão de produto, no [`docs/visao-produto.md`](docs/visao-produto.md).
Funcionalidades sem evidência sólida entram como opcionais.

## Conteúdo sensível

Nunca commite dados pessoais, chaves, `.env` ou capturas de tela com dados reais (use `?demo`).
Este projeto segue o [Código de Conduta](CODE_OF_CONDUCT.md).
