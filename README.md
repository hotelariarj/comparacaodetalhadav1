# Smart X — Comparação Detalhada

Réplica web responsiva do protótipo `Comparação Detalhada v3`, ajustada após a auditoria de conformidade Smart X.

## O que está incluído

- Shell Smart X validado no Figma: header TOTVS, abas, barra de contexto e navegação da jornada.
- Home de conciliação com indicadores, grupos expansíveis e cards de contas.
- Menu de três pontos que abre a comparação detalhada em uma nova aba interna.
- Resumo da conciliação e filtros rápidos.
- Busca, filtros, visão, paginação e seleção de registros.
- Tabela desktop e cartões responsivos no mobile.
- Menu de ações e drawer funcional de detalhes.
- Painel da IA com processamento, cancelamento e sugestões.
- Modal de revisão com validação de justificativa e anexo opcional.
- Feedbacks de sucesso e estados vazio/desabilitado.
- Tokens semânticos `--ani-*` e fonte TOTVS Pro Variable.
- Dados de demonstração derivados de `DemoProduto/Package`.

## Executar

```bash
npm install
npm run dev
```

## Validar

```bash
npm run build
npm run test:interactions
npm run test:sites
```

O relatório visual e funcional está em `design-qa.md`.

## Arquivos principais

- `src/App.jsx` — tela, componentes e interações.
- `src/styles.css` — layout e responsividade.
- `src/tokens.css` — tokens Smart X/Animalia consumidos pelo protótipo.
- `src/data/` — mocks do DemoProduto.
- `public/assets/` — fonte e logotipo oficiais usados na réplica.
