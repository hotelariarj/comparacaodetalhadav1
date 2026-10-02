import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowSquareOut, ArrowsClockwise, CaretDown, Check, CheckCircle,
  DownloadSimple, FileArrowUp, Info, Paperclip, Sparkle, SpinnerGap, WarningCircle, X,
} from "@phosphor-icons/react";

const ledgerRows = [
  { date: "14/08/2024", document: "DOC-001", description: "Depósito Cliente ABC Ltda", meta: "Conta: 1.1.02.001", value: "R$ 25.000,00", status: "OK" },
  { date: "15/08/2024", document: "DOC-002", description: "Pagamento Fornecedor XYZ", meta: "Conta: 1.1.02.001", value: "-R$ 12.000,00", status: "Divergente" },
  { date: "16/08/2024", document: "DOC-003", description: "Transferência TED Recebida", meta: "Conta: 1.1.02.001", value: "R$ 8.500,00", status: "Divergente" },
  { date: "17/08/2024", document: "DOC-004", description: "Pagamento Taxa Bancária", meta: "Conta: 1.1.02.001", value: "-R$ 45,00", status: "Divergente" },
  { date: "18/08/2024", document: "DOC-005", description: "Recebimento Cliente Premium Corp", meta: "Conta: 1.1.02.001", value: "R$ 15.000,00", status: "Divergente" },
  { date: "19/08/2024", document: "DOC-006", description: "Pagamento Salários", meta: "Conta: 1.1.02.001", value: "-R$ 28.000,00", status: "OK" },
  { date: "20/08/2024", document: "DOC-007", description: "Depósito Cliente DEF", meta: "Conta: 1.1.02.001", value: "R$ 12.000,00", status: "OK" },
  { date: "20/08/2024", document: "DOC-008", description: "Pagamento Fornecedor ABC Materiais", meta: "Conta: 1.1.02.001", value: "-R$ 5.500,00", status: "Divergente" },
];

const systemRows = [
  { date: "14/08/2024", document: "DOC-001", description: "Depósito Cliente ABC Ltda", meta: "Sistema: SYS-FIN", value: "R$ 25.000,00", status: "OK" },
  { date: "15/08/2024", document: "DOC-002", description: "Pagamento Fornecedor XYZ", meta: "Sistema: SYS-FIN", value: "-R$ 10.500,00", status: "Divergente" },
  { date: "16/08/2024", document: "DOC-003", description: "TED Recebida Cliente", meta: "Sistema: SYS-FIN", value: "R$ 8.500,00", status: "Divergente" },
  { date: "17/08/2024", document: "DOC-004", description: "Taxa Bancária", meta: "Sistema: SYS-FIN", value: "-R$ 45,00", status: "Divergente" },
  { date: "19/08/2024", document: "DOC-005", description: "Recebimento Cliente Premium Corp", meta: "Sistema: SYS-FIN", value: "R$ 15.000,00", status: "Divergente" },
  { date: "19/08/2024", document: "DOC-006", description: "Pagamento Salários", meta: "Sistema: SYS-FIN", value: "-R$ 28.000,00", status: "OK" },
  { date: "20/08/2024", document: "DOC-007", description: "Depósito Cliente DEF", meta: "Sistema: SYS-FIN", value: "R$ 12.000,00", status: "OK" },
];

const initialSuggestions = [
  { id: 1, movementIds: ["DOC-002"], kind: "Valor", score: 96, title: "Ajustar diferença de R$ 1.500,00", sourceDoc: "DOC-002", sourceDate: "15/08/2024", sourceDescription: "Pagamento Fornecedor XYZ", sourceValue: "-R$ 10.500,00", accountingDoc: "DOC-002", accountingDate: "15/08/2024", accountingDescription: "Pagamento Fornecedor XYZ", accountingValue: "-R$ 12.000,00", reason: "Documento e data coincidem. A diferença está concentrada no valor contabilizado." },
  { id: 2, movementIds: ["DOC-003"], kind: "Descrição", score: 94, title: "Confirmar descrições equivalentes", sourceDoc: "DOC-003", sourceDate: "16/08/2024", sourceDescription: "TED Recebida Cliente", sourceValue: "R$ 8.500,00", accountingDoc: "DOC-003", accountingDate: "16/08/2024", accountingDescription: "Transferência TED Recebida", accountingValue: "R$ 8.500,00", reason: "Documento, data e valor coincidem. Apenas a descrição foi abreviada no sistema de origem." },
  { id: 3, movementIds: ["DOC-004"], kind: "Correspondência", score: 93, title: "Conciliar taxa bancária", sourceDoc: "DOC-004", sourceDate: "17/08/2024", sourceDescription: "Taxa Bancária", sourceValue: "-R$ 45,00", accountingDoc: "DOC-004", accountingDate: "17/08/2024", accountingDescription: "Pagamento Taxa Bancária", accountingValue: "-R$ 45,00", reason: "Data, documento e valor coincidem; as descrições representam o mesmo lançamento." },
  { id: 4, movementIds: ["DOC-005"], kind: "Data", score: 89, title: "Aceitar diferença de data de 1 dia", sourceDoc: "DOC-005", sourceDate: "19/08/2024", sourceDescription: "Recebimento Cliente Premium Corp", sourceValue: "R$ 15.000,00", accountingDoc: "DOC-005", accountingDate: "18/08/2024", accountingDescription: "Recebimento Cliente Premium Corp", accountingValue: "R$ 15.000,00", reason: "Documento, descrição e valor coincidem. A diferença de data é compatível com a virada do dia operacional." },
  { id: 5, movementIds: ["DOC-008"], kind: "Documento", score: 84, title: "Vincular lançamento não encontrado", sourceDoc: "DOC-008", sourceDate: "20/08/2024", sourceDescription: "Pagamento Fornecedor ABC Materiais", sourceValue: "-R$ 5.500,00", accountingDoc: "DOC-008", accountingDate: "20/08/2024", accountingDescription: "Pagamento Fornecedor ABC Materiais", accountingValue: "-R$ 5.500,00", reason: "O lançamento contábil possui documento válido. O vínculo pode ser recuperado pelo identificador DOC-008." },
];

const workspaceOrder = ["comparison", "documents", "suggestions"];

function readReconciliationState(accountCode) {
  try {
    return JSON.parse(window.sessionStorage.getItem(`comparison-reconciliation-${accountCode}`)) || {};
  } catch {
    return {};
  }
}

function buildDocumentResults(attachments, selectedAccount) {
  return attachments.map((attachment, index) => ({
    ...attachment,
    checks: 3,
    score: Math.max(86, 96 - (index * 3)),
    state: "valid",
    label: "Válido",
    value: selectedAccount.balance,
    number: attachment.name.replace(/\.[^.]+$/, "").slice(0, 18).toUpperCase(),
    entity: selectedAccount.name,
  }));
}

function useAnalysisState() {
  const [state, setState] = useState("empty");
  useEffect(() => {
    if (state !== "loading") return undefined;
    const timer = window.setTimeout(() => setState("ready"), 900);
    return () => window.clearTimeout(timer);
  }, [state]);
  return [state, setState];
}

const fallbackAccount = { code: "1.1.2.001", name: "Banco Conta Movimento", balance: "R$ 850.000,00", systemValue: "R$ 849.200,00", difference: "R$ 800,00", status: "Divergente", tone: "negative", attachments: [] };

export default function AccountDrilldown({ account = fallbackAccount, initialWorkspace = "comparison", onBack, onToast, versionLabel = "" }) {
  const selectedAccount = account || fallbackAccount;
  const isInitiallyMatched = selectedAccount.tone === "positive";
  const savedReconciliation = readReconciliationState(selectedAccount.code);
  const [documentState, setDocumentState] = useAnalysisState();
  const [suggestionState, setSuggestionState] = useAnalysisState();
  const [expandedDocument, setExpandedDocument] = useState(null);
  const [expandedMovement, setExpandedMovement] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState(initialWorkspace);
  const [focusedSuggestionDoc, setFocusedSuggestionDoc] = useState(null);
  const [resolvedMovementIds, setResolvedMovementIds] = useState(savedReconciliation.resolvedMovementIds || []);
  const [suggestions, setSuggestions] = useState(initialSuggestions.map((item) => ({ ...item, decision: savedReconciliation.decisions?.[item.id] || "pending" })));
  const tabRefs = useRef({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setDocumentState("empty");
    setSuggestionState("empty");
    setExpandedDocument(null);
    setExpandedMovement(null);
    setActiveWorkspace(initialWorkspace);
    setFocusedSuggestionDoc(null);
    if (initialWorkspace === "suggestions" && !isInitiallyMatched) setSuggestionState("ready");
  }, [selectedAccount.code, initialWorkspace, isInitiallyMatched, setDocumentState, setSuggestionState]);

  useEffect(() => {
    if (isInitiallyMatched) return;
    const decisions = Object.fromEntries(suggestions.map((item) => [item.id, item.decision]));
    window.sessionStorage.setItem(`comparison-reconciliation-${selectedAccount.code}`, JSON.stringify({ resolvedMovementIds, decisions }));
  }, [isInitiallyMatched, resolvedMovementIds, selectedAccount.code, suggestions]);

  const decide = (id, decision) => {
    setSuggestions((items) => items.map((item) => item.id === id ? { ...item, decision } : item));
    if (decision === "accepted") {
      const acceptedSuggestion = suggestions.find((item) => item.id === id);
      setResolvedMovementIds((current) => [...new Set([...current, ...(acceptedSuggestion?.movementIds || [])])]);
    }
    onToast?.(decision === "accepted" ? "Sugestão aceita e vinculada à conciliação." : "Sugestão rejeitada sem alterar os registros.");
  };
  const comparisonRows = ledgerRows.map((ledger, index) => ({
    id: ledger.document,
    ledger: { ...ledger, meta: `Conta: ${selectedAccount.code}` },
    system: (isInitiallyMatched || resolvedMovementIds.includes(ledger.document)) ? { ...ledger, meta: "Sistema: SYS-FIN", status: "OK" } : (systemRows[index] || null),
    matched: isInitiallyMatched || resolvedMovementIds.includes(ledger.document) || (ledger.status === "OK" && systemRows[index]?.status === "OK"),
  }));
  const divergentMovements = comparisonRows.filter((row) => !row.matched).length;
  const isComplete = divergentMovements === 0;
  const progressTotal = 42;
  const progressDone = progressTotal - divergentMovements;
  const progressPercent = Math.round((progressDone / progressTotal) * 100);
  const pending = isInitiallyMatched ? 0 : suggestions.filter((item) => item.decision === "pending" && item.movementIds.some((movementId) => !resolvedMovementIds.includes(movementId))).length;
  const accepted = suggestions.filter((item) => item.decision === "accepted").length;
  const visibleSuggestions = focusedSuggestionDoc ? suggestions.filter((item) => item.movementIds.includes(focusedSuggestionDoc)) : suggestions;
  const accountDocuments = buildDocumentResults(selectedAccount.attachments || [], selectedAccount);
  const firstDivergentId = comparisonRows.find((row) => !row.matched)?.id;
  const currentStatus = isComplete ? "Conciliado" : selectedAccount.status;
  const currentSystemValue = isComplete ? selectedAccount.balance : selectedAccount.systemValue;
  const currentDifference = isComplete ? "R$ 0,00" : selectedAccount.difference;
  const isMatched = isComplete;

  const activateWorkspace = (workspace, focus = false) => {
    setActiveWorkspace(workspace);
    if (workspace !== "suggestions") setFocusedSuggestionDoc(null);
    if (focus) window.requestAnimationFrame(() => tabRefs.current[workspace]?.focus());
  };

  const handleTabKeyDown = (event, workspace) => {
    const currentIndex = workspaceOrder.indexOf(workspace);
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % workspaceOrder.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + workspaceOrder.length) % workspaceOrder.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = workspaceOrder.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    activateWorkspace(workspaceOrder[nextIndex], true);
  };

  const openSuggestionsFor = (documentId) => {
    setFocusedSuggestionDoc(documentId);
    setSuggestionState("ready");
    setActiveWorkspace("suggestions");
    onToast?.(`Sugestão para ${documentId} carregada.`);
  };

  return <main id="main-content" className="main-content account-drilldown">
    <nav className="breadcrumb" aria-label="Você está em"><button type="button" onClick={onBack}>Home</button><span>/</span><span>{selectedAccount.code} {selectedAccount.name}</span></nav>
    <section className="workspace-hero" aria-labelledby="comparison-title">
      <div className="workspace-hero-heading">
        <button type="button" className="icon-button" aria-label="Voltar para a Home" onClick={onBack}><ArrowLeft /></button>
        <div><span className="workspace-eyebrow">{isComplete ? "Conta concluída" : "Conta em revisão"}</span><div className="heading-line"><h1 id="comparison-title">{selectedAccount.name}</h1>{versionLabel && <span className="analysis-tag success">{versionLabel}</span>}</div><p>{selectedAccount.code} · Comparação detalhada</p></div>
      </div>
      <div className="workspace-status" aria-live="polite"><span className={`status ${isComplete ? "status--ok" : "status--valor"}`}>{isComplete ? <CheckCircle weight="fill" /> : <WarningCircle weight="fill" />}{currentStatus}</span><small>Última atualização {selectedAccount.updated || "hoje, 08:12"}</small></div>
      <dl className="workspace-metrics"><div><dt>Saldo contábil</dt><dd>{selectedAccount.balance}</dd></div><div><dt>Sistema de origem</dt><dd>{currentSystemValue}</dd></div><div><dt>Diferença a tratar</dt><dd className={isComplete ? "positive" : "negative"}>{currentDifference}</dd></div><div><dt>Progresso</dt><dd>{progressDone} de {progressTotal}</dd><span aria-label={`${progressPercent}% concluído`}><i style={{ width: `${progressPercent}%` }} /></span></div></dl>
    </section>

    <nav className="workspace-tabs" aria-label="Etapas da análise" role="tablist" onKeyDown={(event) => handleTabKeyDown(event, activeWorkspace)}>
      <button ref={(node) => { tabRefs.current.comparison = node; }} id="workspace-tab-comparison" type="button" role="tab" aria-controls="workspace-panel-comparison" aria-selected={activeWorkspace === "comparison"} tabIndex={activeWorkspace === "comparison" ? 0 : -1} className={activeWorkspace === "comparison" ? "active" : ""} onClick={() => activateWorkspace("comparison")}><ArrowsClockwise />Comparar movimentos <span>{divergentMovements}</span></button>
      <button ref={(node) => { tabRefs.current.documents = node; }} id="workspace-tab-documents" type="button" role="tab" aria-controls="workspace-panel-documents" aria-selected={activeWorkspace === "documents"} tabIndex={activeWorkspace === "documents" ? 0 : -1} className={activeWorkspace === "documents" ? "active" : ""} onClick={() => activateWorkspace("documents")}><Paperclip />Validar documentos <span>{accountDocuments.length}</span></button>
      <button ref={(node) => { tabRefs.current.suggestions = node; }} id="workspace-tab-suggestions" type="button" role="tab" aria-controls="workspace-panel-suggestions" aria-selected={activeWorkspace === "suggestions"} tabIndex={activeWorkspace === "suggestions" ? 0 : -1} className={activeWorkspace === "suggestions" ? "active" : ""} onClick={() => { setFocusedSuggestionDoc(null); activateWorkspace("suggestions"); }}><Sparkle />Sugestões da IA <span>{pending}</span></button>
    </nav>

    {activeWorkspace === "comparison" && <section id="workspace-panel-comparison" className="workspace-comparison" role="tabpanel" aria-labelledby="workspace-tab-comparison" tabIndex="0">
      {isMatched && <aside className="review-priority" aria-labelledby="review-complete-title" aria-live="polite">
        <span><CheckCircle weight="fill" /></span>
        <div><small>CONCILIAÇÃO CONCLUÍDA</small><h2 id="review-complete-title">Todos os 42 movimentos estão conciliados</h2><p>Não há divergências pendentes nesta conta. Você pode consultar documentos e decisões anteriores nas demais etapas.</p></div>
      </aside>}
      {!isMatched && <aside className="review-priority" aria-labelledby="review-priority-title">
        <span><WarningCircle weight="fill" /></span>
        <div><small>PRÓXIMA AÇÃO RECOMENDADA</small><h2 id="review-priority-title">{divergentMovements === 1 ? "Revise o movimento divergente" : `Revise os ${divergentMovements} movimentos divergentes`}</h2><p>Comece pelos lançamentos com o mesmo documento e valores diferentes. Eles costumam ser resolvidos mais rapidamente.</p></div>
        <button type="button" className="button primary" aria-controls={`movement-review-${firstDivergentId}`} onClick={() => setExpandedMovement(firstDivergentId)}>Começar revisão</button>
      </aside>}

      <section className="unified-comparison" aria-labelledby="movements-title">
        <header><div><h2 id="movements-title">Movimentos pareados</h2><p>Contabilidade e sistema lado a lado, organizados pelo documento correspondente.</p></div><span>{comparisonRows.length} movimentos</span></header>
        <div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th>Data e documento</th><th>Contabilidade</th><th aria-label="Resultado da comparação">Comparação</th><th>Sistema de origem</th><th><span className="visually-hidden">Ações</span></th></tr></thead><tbody>{comparisonRows.map((row) => <tr key={row.id} className={row.matched ? "matched" : "divergent"}>
          <td><strong>{row.ledger.date}</strong><small>{row.ledger.document}</small></td>
          <td><strong>{row.ledger.description}</strong><span className="number">{row.ledger.value}</span></td>
          <td><span className={`comparison-state ${row.matched ? "matched" : "divergent"}`}>{row.matched ? <CheckCircle weight="fill" /> : <WarningCircle weight="fill" />}{row.matched ? "Conciliado" : "Divergente"}</span></td>
          <td>{row.system ? <><strong>{row.system.description}</strong><span className="number">{row.system.value}</span></> : <><strong>Não encontrado</strong><span>Sem correspondência</span></>}</td>
          <td><button type="button" className="button ghost compact-button" aria-controls={`movement-review-${row.id}`} aria-expanded={expandedMovement === row.id} onClick={() => setExpandedMovement(expandedMovement === row.id ? null : row.id)}>{expandedMovement === row.id ? "Fechar" : "Revisar"}</button></td>
        </tr>).flatMap((row, index) => {
          const data = comparisonRows[index];
          return expandedMovement === data.id ? [row, <tr id={`movement-review-${data.id}`} className="movement-review-row" key={`${data.id}-review`}><td colSpan="5"><div><span><Info weight="fill" /></span><p><strong>{data.matched ? "Movimento já conciliado" : "Possível diferença de lançamento"}</strong>{data.matched ? "Os valores, datas e documentos coincidem nas duas fontes." : "Documento e data são compatíveis. Confira o valor e escolha uma sugestão de conciliação para concluir."}</p>{!data.matched && <button type="button" className="button secondary" onClick={() => openSuggestionsFor(data.id)}>Ver sugestão</button>}</div></td></tr>] : [row]; })}</tbody></table></div>
      </section>
    </section>}

    {activeWorkspace === "documents" && <div id="workspace-panel-documents" className="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-documents" tabIndex="0">
    {selectedAccount.attachments?.length > 0 && <section className="drilldown-card attached-documents" aria-labelledby="attached-documents-title"><header><div><h2 id="attached-documents-title"><Paperclip />Documentos da conta</h2><p>Arquivos enviados para apoiar a conciliação.</p></div><span>{selectedAccount.attachments.length} documento</span></header>{selectedAccount.attachments.map((document) => <article key={document.name}><div className="attached-document-icon"><FileArrowUp /></div><div><strong>{document.name}</strong><span>{document.size} · {document.date} · {document.author}</span></div><div><button type="button" className="button ghost" onClick={() => onToast?.(`${document.name} aberto para visualização.`)}><ArrowSquareOut />Visualizar</button><button type="button" className="icon-button" aria-label={`Baixar ${document.name}`} onClick={() => onToast?.(`Download de ${document.name} iniciado.`)}><DownloadSimple /></button></div></article>)}</section>}
    <section className="drilldown-card document-analysis" aria-labelledby="document-analysis-title">
      <header><h2 id="document-analysis-title"><FileArrowUp />Análise de Documentos com IA</h2>{documentState === "ready" && <button className="button secondary" onClick={() => setDocumentState("loading")}><ArrowsClockwise />Nova análise</button>}</header>
      {accountDocuments.length === 0 && <div className="analysis-empty"><Paperclip size={46} /><strong>Nenhum documento anexado</strong><p>Volte à Home, abra o menu de três pontos desta conta e escolha “Anexar documento”. Depois, retorne para validar o arquivo.</p><button type="button" className="button primary" onClick={onBack}><ArrowLeft />Voltar à Home para anexar</button></div>}
      {accountDocuments.length > 0 && documentState === "empty" && <div className="analysis-empty"><FileArrowUp size={46} /><strong>Validar {accountDocuments.length === 1 ? "documento anexado" : "documentos anexados"}</strong><p>A IA irá analisar somente os arquivos desta conta e verificar valores, datas e identificação.</p><button type="button" className="button primary" onClick={() => setDocumentState("loading")}><FileArrowUp />Analisar {accountDocuments.length === 1 ? "documento" : `${accountDocuments.length} documentos`}</button></div>}
      {accountDocuments.length > 0 && documentState === "loading" && <div className="analysis-empty" role="status" aria-live="polite"><SpinnerGap className="spin" size={42} /><strong>Analisando {accountDocuments.length === 1 ? "documento" : "documentos"}...</strong><p>Extraindo dados e validando informações com as transações.</p></div>}
      {documentState === "ready" && <div className="document-results">
        <div className="document-kpis" aria-live="polite"><span><strong>{accountDocuments.length}</strong>Total</span><span className="positive"><strong>{accountDocuments.filter((document) => document.state === "valid").length}</strong>Válidos</span><span className="warning"><strong>{accountDocuments.filter((document) => document.state === "warning").length}</strong>Atenção</span><span className="negative"><strong>{accountDocuments.filter((document) => document.state === "invalid").length}</strong>Inválido</span></div>
        {accountDocuments.map((document) => <article key={document.name} className={`document-result ${document.state}`}>
          <div className="document-result-head"><span><CheckCircle weight="fill" /><span><strong>{document.name}</strong><small>{document.checks} verificações realizadas</small></span></span><span className="document-score"><strong>{document.score}%</strong><em>{document.label}</em><i><b style={{ width: `${document.score}%` }} /></i></span></div>
          <dl><div><dt>Valor</dt><dd>{document.value}</dd></div><div><dt>Data</dt><dd>{document.date}</dd></div><div><dt>Nº Doc</dt><dd>{document.number}</dd></div><div><dt>Entidade</dt><dd>{document.entity}</dd></div></dl>
          <button type="button" className="button ghost document-details" aria-controls={`document-checks-${document.number}`} aria-expanded={expandedDocument === document.name} onClick={() => setExpandedDocument(expandedDocument === document.name ? null : document.name)}><CaretDown className={expandedDocument === document.name ? "rotate" : ""} />Ver detalhes ({document.checks})</button>
          {expandedDocument === document.name && <div id={`document-checks-${document.number}`} className="document-checks"><span><Check />Valor reconhecido</span><span><Check />Data compatível</span><span><Info />Documento relacionado à conta</span></div>}
        </article>)}
      </div>}
    </section>
    </div>}

    {activeWorkspace === "suggestions" && <section id="workspace-panel-suggestions" className="drilldown-card suggestion-analysis workspace-panel" aria-labelledby="workspace-tab-suggestions suggestion-analysis-title" role="tabpanel" tabIndex="0">
      <header><h2 id="suggestion-analysis-title"><Sparkle weight="fill" />{focusedSuggestionDoc ? `Sugestão para ${focusedSuggestionDoc}` : "Sugestões de Conciliação com IA"}</h2><div>{focusedSuggestionDoc && <button type="button" className="button ghost" onClick={() => setFocusedSuggestionDoc(null)}>Ver todas</button>}{suggestionState === "ready" && !isInitiallyMatched && <button type="button" className="button ghost" onClick={() => { setSuggestions(initialSuggestions.map((item) => ({ ...item, decision: "pending" }))); setResolvedMovementIds([]); setFocusedSuggestionDoc(null); setSuggestionState("empty"); }}><ArrowsClockwise />Reiniciar</button>}{!isComplete && <button type="button" className="button secondary" disabled={suggestionState === "loading"} onClick={() => setSuggestionState("loading")}><Sparkle />{suggestionState === "loading" ? "Analisando..." : "Analisar com IA"}</button>}</div></header>
      {isInitiallyMatched && <div className="analysis-empty compact"><CheckCircle size={42} weight="fill" /><strong>Conta totalmente conciliada</strong><p>Não existem movimentos divergentes que precisem de sugestões nesta conta.</p></div>}
      {!isInitiallyMatched && suggestionState === "empty" && <div className="analysis-empty compact"><Sparkle size={42} /><strong>Nenhuma análise realizada</strong><p>Clique em “Analisar com IA” para buscar sugestões ligadas aos {divergentMovements} movimentos divergentes.</p></div>}
      {!isInitiallyMatched && suggestionState === "loading" && <div className="analysis-empty compact" role="status" aria-live="polite"><SpinnerGap className="spin" size={42} /><strong>Analisando transações divergentes...</strong><p>A IA está comparando valores, datas e descrições para sugerir correspondências.</p></div>}
      {!isInitiallyMatched && suggestionState === "ready" && <div className="suggestion-results">
        <div className="suggestion-kpis" aria-live="polite"><span>{visibleSuggestions.length} {visibleSuggestions.length === 1 ? "sugestão" : "sugestões"}</span><span>{accepted} aceitas</span><span>{pending} pendentes</span></div>
        {visibleSuggestions.map((item) => <article key={item.id} className={`match-suggestion ${item.decision}`}>
          <header><div><Sparkle weight="fill" /><strong>Sugestão de Match</strong><span>{item.kind}</span></div><strong>{item.score}%</strong></header>
          <h3>{item.title}</h3>
          <div className="match-columns"><section><small>Sistema Origem</small><code>{item.sourceDoc}</code><span>{item.sourceDate}</span><strong>{item.sourceDescription}</strong><b>{item.sourceValue}</b></section><section><small>Contabilidade</small><code>{item.accountingDoc}</code><span>{item.accountingDate}</span><strong>{item.accountingDescription}</strong><b>{item.accountingValue}</b></section></div>
          <p><Sparkle weight="fill" /> <strong>Motivo:</strong> {item.reason}</p>
          {item.decision === "pending" ? <footer><button type="button" className="button primary" onClick={() => decide(item.id, "accepted")}><Check />Aceitar e conciliar</button><button type="button" className="button secondary" onClick={() => decide(item.id, "rejected")}><X />Rejeitar</button></footer> : <footer><span className={`decision ${item.decision}`}>{item.decision === "accepted" ? <><CheckCircle weight="fill" />{item.movementIds.join(", ")} conciliado</> : <><X />Sugestão rejeitada</>}</span></footer>}
        </article>)}
      </div>}
    </section>
    }
  </main>;
}
