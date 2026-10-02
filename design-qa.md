# Design QA — Módulos adicionais na V1

## Cadastros de Conciliação

- Fonte: tela `Cadastros de Conciliação - Natalia` e `Documentacao - Cadastros e Controle de Acesso` do projeto Claude Design compartilhado.
- Rota: `#/cadastros`, independente da comparação detalhada.
- Implementação própria em `src/ReconciliationRegistries.jsx` e `src/reconciliation-registries.css`; as abas Não Vinculadas, Vinculadas e Todas, filtros por sistema, seleção de contas, modal de vínculo, seleção de relatórios, edição, desvinculação com confirmação e desfazer são locais ao módulo.
- A seleção de contas em lote respeita a mesma Conta Gov (ECD); o CTA de vínculo exige ao menos uma conta e um relatório.
- Estilo reaproveita os tokens Smart X/Animália e o shell global existente da V1.
- Build de produção concluído após a inclusão.
- A comparação detalhada (`src/AccountDrilldown.jsx`) permaneceu sem diff.

## Controle de Acesso

- Source visual truth: `https://claude.ai/design/p/0413b3de-a625-4b20-831a-88e631bf8629?file=Controle+de+Acesso+-+Natalia.dc.html&via=share` (Codex Browser tab 45, embedded prototype at 953 × 658 CSS px).
- Implementation screenshot: `http://127.0.0.1:4175/?qa=access#/controle-de-acesso` (Codex Browser tab 47, captures at 953 × 658 and 390 × 844 CSS px).
- Pixel dimensions: desktop source capture 1280 × 720 containing the 953 × 658 prototype canvas; desktop implementation capture 953 × 658; mobile implementation capture 390 × 844.
- Density normalization: browser CSS pixels at device scale 1; the source comparison used the visible 953 × 658 embedded canvas and the implementation used the same CSS viewport.
- State: initial list, all accounts, comfortable density, no filter or overlay open.

## Full-view comparison evidence

The source and implementation were emitted in the same browser comparison pass. The content hierarchy matches: page title and update action, inactive-account warning, Todos/Membros/Grupos tabs, search/filter/view toolbar, record count, blue-gray list header, account rows, access-role pills and floating IA action. The global shell intentionally remains the existing V1 shell, per the requirement not to alter the V1 product context.

## Focused region comparison evidence

Focused DOM and interaction checks covered the toolbar, table rows and overlays because these are the fidelity-critical dense regions. Search reduced the list to one Luiz Fernandes record; tabs showed three members and three groups; the AUDITORIA drawer displayed its members; the role menu exposed the three roles; compact density updated the row treatment; the inactive review applied its filter and opened the revoke confirmation.

## Findings

- No actionable P0/P1/P2 visual mismatch remains.
- Accepted constraint: at 390 px the dense three-column list scrolls horizontally, matching the reference's table-first behavior rather than collapsing role data into a different mobile card pattern.
- Accepted intentional difference: environment, company and global navigation retain the existing V1 values and styling instead of copying the source prototype's separate shell.

## Required fidelity surfaces

- Fonts and typography: existing TOTVS Pro stack, weights and hierarchy preserved; app-specific labels and role text match the reference.
- Spacing and layout rhythm: 8 px card radii, 44 px controls, 48/64 px rows, warning spacing and toolbar rhythm match the source closely.
- Colors and visual tokens: reused V1 Animália/Smart X semantic tokens for brand, warning, surfaces, borders and focus states.
- Image quality and assets: no missing raster artwork; real Phosphor icons and the existing TOTVS logo asset are used.
- Copy and content: six source records, account labels, groups, roles, warning and review copy are represented.

## Interaction and regression checks

- Menu item opens `#/controle-de-acesso`.
- Search, tabs, sorting, filters, density, group drawer, role selection, inactive review and revoke confirmation work.
- Returning through the Comparison menu opens `#/comparacao/1.1.2.001/comparison` with Banco Conta Movimento and “Começar revisão”.
- Browser console: 0 warnings and 0 errors.
- `AccountDrilldown.jsx`: no diff.
- Automated interaction audit, Sites tests and production build: passed.

## Comparison history

- Pass 1: no P0/P1/P2 findings. No visual fix loop was required.

## Follow-up polish

- P3: a future dedicated mobile design could replace horizontal table scrolling with account cards, but that would intentionally diverge from the supplied reference.

final result: passed

---

# Design QA — Cadastros e Controle de Acesso (revisão de 02/10/2026)

## Escopo e evidência

- Escopo: somente **Cadastros de Conciliação** e **Controle de Acesso**. A Comparação Detalhada não foi aberta para edição nem alterada.
- Fonte visual de Cadastros: captura enviada pela usuária em 02/10/2026 (`/var/folders/rh/2hhh7vvd70sbk3nvm8kqkdbr0000gn/T/TemporaryItems/NSIRD_screencaptureui_n0rmdz/Captura de Tela 2026-10-02 às 14.54.22.png`).
- Fonte visual de Controle de Acesso: página `Controle de Acesso - Natalia.dc.html` do projeto Claude Design `Protótipo Animalia patrimônio` (project id `0413b3de-a625-4b20-831a-88e631bf8629`), aberta e capturada na tela.
- Implementação renderizada: `http://127.0.0.1:4175/#/cadastros` e `http://127.0.0.1:4175/#/controle-de-acesso`.
- Capturas locais feitas via navegador do Codex. O navegador não expôs caminho de arquivo para essas capturas; dimensões capturadas: Cadastros 955 × 779 px (e conferência adicional do agente a 1280 × 720 px), Controle de Acesso 955 × 779 px. A captura da fonte Claude mediu 2706 × 1750 px; densidade/escala CSS não foi disponibilizada.
- Estado: Cadastros em “Não Vinculadas” e depois “Vinculadas”; Controle de Acesso em “Todos”, incluindo abertura do drawer de membros e alteração local do papel de um grupo. Após o teste, a página local foi recarregada para restaurar o estado inicial.
- Comparação de tela inteira e região focada: telas de fonte e implementação foram abertas e capturadas. Não foi possível montar uma imagem comparativa normalizada em uma única captura; a política do navegador selecionado bloqueou a página local de composição e as capturas não têm dimensões/escala equivalentes. Portanto, diferenças pixel a pixel não são declaradas como verificadas.

## Findings

- [P1] Papel efetivo dos membros diverge do papel do grupo.
  Local: `src/AccessControl.jsx:80-84, 148-152, 169`.
  Evidência: reproduzido localmente ao alterar “CONTABILIDADE HOTEL” de “Permite Conciliar” para “Somente Visualização”. A linha do grupo mudou, mas “Contador” e “Luiz Fernandes” continuaram exibindo “Permite Conciliar”; o drawer aberto também preservou o papel anterior. O update modifica somente o item cujo id foi selecionado, enquanto as linhas e o drawer usam dados independentes.
  Impacto: a interface passa a apresentar permissões incompatíveis para pessoas que herdam o acesso do grupo.
  Correção: derivar o papel dos membros a partir do grupo em estado único, manter exceções explícitas e atualizar o drawer junto com o grupo.

- [P1] A contagem de membros não corresponde às pessoas listadas no drawer.
  Local: `src/AccessControl.jsx:11-15, 18-33, 150, 169`.
  Evidência: “CONTABILIDADE HOTEL” informa 8 membros, mas o drawer renderiza 3; “INFORMATICA” informa 5, também com 3 pessoas listadas. O texto do drawer menciona exceções, mas o modelo não define exceções.
  Impacto: enfraquece a confiança na revisão de acesso e não permite conferir quem será afetado por uma elevação/revogação.
  Correção: alinhar dados de demonstração e contagens; modelar exceções se o texto for mantido, ou remover a afirmação enquanto a regra não existir.

- [P1] Ações da tabela de contas vinculadas ficam cortadas e o botão flutuante de IA cobre a área de ação.
  Local: `src/ReconciliationRegistries.jsx:193, 202`; `src/reconciliation-registries.css:43-48, 60-62, 95`.
  Evidência: na captura da aba “Vinculadas” a 1280 × 720 px, “Editar” aparece inteiro, mas “Desvincular” é cortado na borda direita. A coluna final está fixada em 145 px, embora contenha dois botões com ícone e texto. Na captura de “Não Vinculadas”, o botão IA, fixo no canto inferior direito, sobrepõe a área da última coluna/linhas visíveis.
  Impacto: ações essenciais ficam visualmente truncadas ou parcialmente obstruídas.
  Correção: dimensionar a coluna Ações para seu conteúdo real ou agrupar ações secundárias; reposicionar/recolher o FAB quando cobrir conteúdo e validar o alvo final da tabela.

- [P2] A tabela de Controle de Acesso fica maior que a área móvel sem indicar rolagem horizontal.
  Local: `src/access-control.css:35-36, 114-119, 122-133`.
  Evidência: tabela/lista exige pelo menos 760 px e os tracks mínimos somam 820 px; no breakpoint móvel a lista continua com 720 px, dentro de um cartão rolável horizontalmente. A captura a 390 × 844 px mostra colunas parcialmente fora da tela sem affordance de rolagem.
  Impacto: parece conteúdo quebrado e esconde informações de grupo/papel.
  Correção: criar um wrapper de tabela com affordance visível e scroll só na região tabular, ou adaptar colunas para cartão/resumo móvel; conferir em 390, 768, 1024 e 1280 px, com menu expandido.

- [P2] Paginação e seletor “Mostrar linhas” de Controle de Acesso não executam o que prometem.
  Local: `src/AccessControl.jsx:162`.
  Evidência: o seletor não tem estado nem `onChange`; anterior/próxima são sempre desabilitados e a página 1 é fixa. Selecionar 20 ou 50 linhas não altera o conjunto.
  Impacto: controles de tabela aparentam estar quebrados e induzem expectativa falsa.
  Correção: implementar estado real de tamanho de página e paginação, ou remover/desabilitar controles enquanto o protótipo só tiver seis registros.

- [P2] Diálogos de Controle de Acesso não têm encerramento por Escape nem gestão explícita de foco.
  Local: `src/AccessControl.jsx:167-173`.
  Evidência: a revogação abre, mas Escape não a fecha. Os overlays usam `aria-modal`, porém não foi identificado tratamento de foco inicial, contenção e devolução ao disparador. O botão Cancelar/X continua funcionando.
  Impacto: fluxo incompleto para teclado e tecnologia assistiva.
  Correção: reutilizar Modal/Page Slide oficial com foco inicial, focus trap, Escape e retorno de foco; preservar Cancelar e clique no backdrop conforme padrão do DS.

- [P2] Mensagens afirmam registro em Logs de Auditoria, mas essa tela é um placeholder.
  Local: `src/AccessControl.jsx:84, 90, 171, 173`; `src/App.jsx:371-376`.
  Evidência: alteração/revogação anunciam que a ação foi registrada ou será registrada; a rota “Logs de Auditoria” renderiza uma página placeholder, sem histórico dessas ações.
  Impacto: feedback de sucesso promete rastreabilidade que o protótipo não demonstra.
  Correção: registrar as ações no estado de auditoria visível, ou ajustar o texto para não afirmar persistência ainda inexistente.

- [P2] O código usa uma aproximação local do DS, não comprova consumo do Animalia TOTVS atualizado.
  Local: `src/tokens.css:1-52`; `src/styles.css:1`; `src/AccessControl.jsx:7`; `src/ReconciliationRegistries.jsx:7`; `src/access-control.css`; `src/reconciliation-registries.css`.
  Evidência: TOTVS Pro Variable está carregada localmente e a paleta tem semelhança com TOTVS, mas variáveis `--ani-*`, tabela, tabs, drawer e modais são declarados/implementados à mão; não há import da biblioteca oficial de componentes nem componente oficial `ani-*` usado por essas telas. Há cores/radii hard-coded fora dos tokens.
  Impacto: aparência inspirada no DS não garante atualização dos componentes nem fidelidade às especificações atuais.
  Correção: mapear valores para os tokens oficiais do Animalia TOTVS atualizado e usar seus componentes publicados quando disponíveis (por exemplo, Page Slide para os painéis). Registrar exceções quando o protótipo precisar de comportamento próprio.

- [P2] Pesos e tamanhos tipográficos não seguem uma escala semântica comprovável.
  Local: `src/tokens.css:1-10`; `src/access-control.css:9-12, 39, 54-66`; `src/reconciliation-registries.css:12, 46, 55-57`.
  Evidência: a família base é TOTVS Pro, mas há pesos como 400, 600, 650 e 700 e tamanhos isolados de 10 a 22 px espalhados pelas telas; esses valores não são aliases/tokens de tipografia. Na captura local, a tabela fica visualmente mais densa que o restante da interface; isso é consistente com a falta de escala central, embora a correspondência tipográfica exata não possa ser julgada sem captura normalizada.
  Impacto: diferença perceptível de “peso” entre títulos, abas, labels e conteúdo da tabela, especialmente em densidade elevada.
  Correção: conferir a família e a escala oficial do DS (tokens de corpo, label, título e pesos), centralizar esses estilos e remover valores arbitrários após comparação no mesmo viewport.

- [P2] Semântica acessível da tabela de Controle de Acesso está incompleta.
  Local: `src/AccessControl.jsx:142-158`.
  Evidência: a tabela usa `div role="table"`, mas não há `rowgroup`; o botão de ordenação “Conta” recebe `role="columnheader"`, substituindo a semântica nativa do botão.
  Impacto: leitores de tela podem não anunciar corretamente a estrutura e a ação de ordenar.
  Correção: preferir `<table>/<thead>/<tbody>/<th>/<td>`; se mantiver ARIA, definir a hierarquia completa e manter botão dentro de `columnheader`.

## Required Fidelity Surfaces

- Fontes/tipografia: TOTVS Pro Variable está carregada localmente. O problema observado é a falta de escala semântica central, não evidência de família errada.
- Espaçamento/layout: a tabela de Cadastros corta ações; o FAB se sobrepõe ao conteúdo; em mobile, Controle de Acesso depende de scroll horizontal sem indicação.
- Cores/tokens: paleta se aproxima do tema TOTVS, mas backgrounds, estados semânticos e bordas ainda incluem valores hard-coded sem mapeamento oficial demonstrado.
- Imagens/assets: não encontrei ilustrações ou logos substituídos nas duas regiões auditadas; ícones funcionais vêm de Phosphor. O logo do cabeçalho não foi objeto desta captura focada.
- Copy/conteúdo: inconsistência 8/5 vs 3 membros e promessas de auditoria sem log visível são divergências funcionais de conteúdo.

## Open Questions

- O protótipo deve exibir os seis integrantes de cada grupo ou os contadores 8/5 são dados de referência que precisam de listas completas?
- “Animalia TOTVS atualizado” deve ser uma dependência oficial consumida pelo app ou basta mapear fielmente os tokens e padrões visuais disponíveis?

## Implementation Checklist

1. Corrigir derivação de permissões de membros/grupos e alinhar as contagens dos drawers.
2. Corrigir largura/overflow da coluna Ações em Cadastros e impedir que o FAB cubra ações.
3. Definir comportamento mobile da tabela de acesso e implementar ou retirar paginação/seletor sem efeito.
4. Padronizar Modal/Page Slide, foco e Escape; alinhar feedback de auditoria ao que realmente existe.
5. Mapear a tipografia e os tokens visuais para o Animalia TOTVS atualizado e conferir as capturas no mesmo viewport.

## Comparison History

- Iteração visual: nenhuma correção foi aplicada nesta auditoria; a usuária pediu uma revisão criteriosa e afirmou que a Comparação Detalhada está fechada/redonda. Nenhum arquivo dessa tela foi alterado.
- Interações reproduzidas: abrir drawer de grupo; 8 membros exibidos no resumo versus 3 no drawer; alterar papel do grupo e observar divergência em membros e resumo do drawer; estado local foi restaurado com reload.
- Testes reportados pelos subagentes: `npm run build` e `npm run test:interactions` passaram. Estes testes não eliminam os defeitos funcionais acima.

## Follow-up Polish

- Unificar pesos e tamanhos tipográficos por aliases semânticos oficiais.
- Revisar cores hard-coded do prazo, cabeçalho de tabela e status semânticos.
- Conferir o Page Slide de vínculo e drawers em alturas menores; os CTAs permanecem no rodapé, enquanto parte do formulário começa abaixo da dobra.

## Final result

blocked

Motivos: existem achados P1/P2 sem correção; além disso, a comparação visual normalizada lado a lado e os caminhos locais das capturas de implementação não foram produzidos nesta sessão. As evidências do código, das capturas renderizadas e dos fluxos reproduzidos bastam para confirmar os defeitos funcionais listados, mas não para declarar fidelidade visual completa ao DS atualizado.

## Implementação e revalidação — 02/10/2026

- [Resolvido] O papel aplicado ao grupo agora atualiza as contas-membro representadas na tabela e o papel exibido no drawer.
- [Resolvido] Os totais de referência 3/8/5 foram preservados. O drawer agora informa “3 de 8 membros exibidos” (ou “3 de 5”) e explica que a lista é uma amostra, sem sugerir que está completa. Ao revogar uma conta, o total e a amostra são atualizados.
- [Resolvido] A paginação e o seletor de linhas do Controle de Acesso têm estado funcional. Com os seis registros atuais e tamanho padrão 10, há uma página; por isso não há segunda página a navegar nessa amostra.
- [Resolvido] O scroll horizontal de cada tabela fica restrito ao próprio viewport, recebe foco por teclado e tem instrução visível em telas menores. A página não cria overflow horizontal global em 390 px.
- [Resolvido] Coluna Ações de Cadastros aumentada e alinhada com um container flex interno, sem aplicar `display:flex` ao `<td>`. O botão de IA saiu de `position: fixed` e não encobre linhas.
- [Resolvido] Diálogos de Controle de Acesso fecham com Escape, prendem a navegação por Tab e devolvem foco ao acionador. O drawer de vínculo/desvínculo de Cadastros mantém fechamento por Escape.
- [Resolvido] Papel alterado e revogação são registrados em eventos de sessão; Logs de Auditoria passou a mostrar esses eventos sem alegar persistência no servidor.
- Pesos/tamanhos de texto e cores de tabela/estados recorrentes foram centralizados em aliases semânticos locais `--ani-*`. A família TOTVS Pro local permanece.
- Nenhum diff em `src/AccountDrilldown.jsx`; nenhuma implementação interna da Comparação Detalhada foi modificada.

### Evidência de validação

- `npm run build`: passou.
- `npm run test:interactions`: passou.
- `npm run test:sites`: 4 testes passaram.
- Verificação manual no navegador local: mudança de papel do grupo refletiu em Célio e Luiz e no drawer; resumo exibiu “3 de 8”; controle de inativas filtrou Luiz; página 2 e troca de 10 para 20 linhas foram exercitadas antes de alinhar a amostra à referência; confirmação de elevação e revogação fecharam com Escape sem executar a ação; evento apareceu em Logs de Auditoria.
- Viewport 390 × 844: largura do documento = 390 px em ambos os módulos; viewport rolável da tabela de acesso = 355 px com conteúdo de 820 px; da tabela de Cadastros = 364 px com conteúdo de 980 px; affordances de scroll aparecem e os botões IA estão no fluxo normal.
- Cadastros a 1280 px: coluna Ações mede 220 px e os botões “Editar”/“Desvincular” terminam dentro do viewport. Console do navegador: nenhum erro/aviso.

### Limite que permanece

O repositório não tem dependência da biblioteca oficial de componentes Animalia TOTVS atualizado; as telas continuam usando componentes locais e os aliases `--ani-*` do protótipo. Assim, a consistência interna melhorou, mas o consumo do pacote oficial e a fidelidade visual pixel a pixel continuam **não verificados**. A Comparação Detalhada não foi aberta nem alterada.

Resultado desta implementação: **fluxos e defeitos listados corrigidos e revalidados; certificação de fidelidade ao pacote oficial do DS permanece pendente**.
