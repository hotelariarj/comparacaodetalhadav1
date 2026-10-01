import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowsClockwise, Bell, CaretDown, CaretLeft, CaretRight, ChartBar, Check,
  CheckCircle, ClockCounterClockwise, DotsThreeVertical, DownloadSimple,
  FileArrowUp, Funnel, GearSix, House, Info, LinkSimple, List, MagnifyingGlass,
  MapTrifold, Paperclip, SidebarSimple, Sparkle, SpinnerGap, WarningCircle, X,
} from "@phosphor-icons/react";
import demo from "./data/detailed-comparison.sample.json";
import aiResults from "./data/ai-analysis-result.sample.json";

const primaryRows = [
  { id: "LOTE-2024-001", date: "14/08/2024", description: "Pagamentos Lote - Fornecedores Diversos", origin: 6000, accounting: 6800, difference: "+R$ 800,00", status: "Divergente", issue: "valor", ai: true },
  { id: "DOC-2024-001", date: "02/08/2024", description: "Pagamento Cliente Alpha", origin: 125, accounting: 125, difference: "data", status: "Divergente", issue: "data", ai: true },
  { id: "DOC-2024-005", date: "06/08/2024", description: "Recebimento Cliente Gamma", origin: 2850, accounting: 2850, difference: "data", status: "Divergente", issue: "data" },
  { id: "DOC-2024-003", date: "08/08/2024", description: "Pagamento Fornecedor Beta", origin: 1240, accounting: 1240, difference: "data", status: "Divergente", issue: "data" },
  { id: "DOC-2024-007", date: "20/08/2024", description: "Pagamento de imposto", origin: 780, accounting: 780, difference: "data", status: "Divergente", issue: "data" },
  { id: "DOC-2024-002", date: "26/08/2024", description: "Recebimento Fatura 1234", origin: 87.5, accounting: 87.5, difference: "data", status: "Divergente", issue: "data" },
  { id: "DOC-2024-009", date: "30/08/2024", description: "Pagamento de aluguel", origin: 4200, accounting: 4200, difference: "data", status: "Divergente", issue: "data" },
  { id: "DOC-2024-004", date: "03/08/2024", description: "Tarifa bancária", origin: 35.9, accounting: null, difference: "—", status: "Não encontrada", issue: "missing", ai: true },
  { id: "DOC-2024-010", date: "09/08/2024", description: "Recebimento de vendas", origin: 1180, accounting: null, difference: "—", status: "Não encontrada", issue: "missing" },
  { id: "DOC-2024-006", date: "21/08/2024", description: "Estorno de pagamento", origin: 430, accounting: null, difference: "—", status: "Não encontrada", issue: "missing" },
];

const demoRows = demo.entries
  .flatMap((entry) => entry.rows.map((row) => ({ entry, row })))
  .slice(0, 32)
  .map(({ entry, row }, index) => ({
    id: row.accounting.documentId || row.system.documentId || `MOV-${String(index + 11).padStart(3, "0")}`,
    date: row.accounting.date || row.system.date || "—",
    description: row.accounting.description || row.system.description || entry.accountName,
    origin: row.system.value || 0,
    accounting: row.accounting.id ? row.accounting.value : null,
    difference: "R$ 0,00",
    status: "Conciliada",
    issue: "ok",
  }));

const allRows = [...primaryRows, ...demoRows].slice(0, 42);
const money = (value) => value == null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const navItems = [
  { label: "Home", icon: House },
  { label: "Comparação Detalhada", icon: ChartBar, active: true },
  { label: "Logs de Auditoria", icon: ClockCounterClockwise },
  { label: "Cadastros", icon: List },
  { label: "Mapa do Projeto", icon: MapTrifold },
];

function IconButton({ label, children, className = "", ...props }) {
  return <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>;
}

function Status({ row }) {
  const Icon = row.issue === "ok" ? CheckCircle : row.issue === "missing" ? Info : WarningCircle;
  return <span className={`status status--${row.issue}`}><Icon size={16} weight="fill" />{row.status}</span>;
}

function AppShell({ children }) {
  const [expanded, setExpanded] = useState(false);
  return <div className={`app-shell ${expanded ? "menu-expanded" : ""}`}>
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    <header className="global-header">
      <img src="/assets/logo-totvs-dark.svg" alt="TOTVS" />
      <button className="environment" aria-label="Trocar ambiente"><span>Produção</span><strong>Conciliador 12.1.2410</strong><CaretDown size={16} /></button>
      <div className="header-actions"><IconButton label="Notificações"><Bell size={22} /></IconButton><button className="avatar" aria-label="Perfil: Rafael R. Oliveira">RO</button></div>
    </header>
    <aside className="journey-menu" aria-label="Menu da jornada">
      <IconButton label={expanded ? "Recolher menu" : "Expandir menu"} onClick={() => setExpanded((v) => !v)}><SidebarSimple size={22} /></IconButton>
      <nav>{navItems.map(({ label, icon: Icon, active }) => <button key={label} className={active ? "active" : ""} title={label} aria-current={active ? "page" : undefined} onClick={() => !active && window.dispatchEvent(new CustomEvent("smartx-toast", { detail: `${label} está disponível no pacote DemoProduto.` }))}><Icon size={22} /><span>{label}</span></button>)}</nav>
    </aside>
    {children}
    <nav className="mobile-navigation" aria-label="Navegação mobile">{navItems.slice(0, 4).map(({ label, icon: Icon, active }) => <button key={label} className={active ? "active" : ""} aria-label={label}><Icon size={22} /><span>{label === "Comparação Detalhada" ? "Comparação" : label.split(" ")[0]}</span></button>)}</nav>
  </div>;
}

export function App() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [actionsFor, setActionsFor] = useState(null);
  const [details, setDetails] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiState, setAiState] = useState("ready");
  const [progress, setProgress] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [justification, setJustification] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const modalInput = useRef(null);

  useEffect(() => { const listener = (event) => setToast(event.detail); window.addEventListener("smartx-toast", listener); return () => window.removeEventListener("smartx-toast", listener); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 3600); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { if (reviewOpen) requestAnimationFrame(() => modalInput.current?.focus()); }, [reviewOpen]);
  useEffect(() => {
    if (aiState !== "processing") return;
    setProgress(14);
    const timer = setInterval(() => setProgress((current) => {
      if (current >= 92) { clearInterval(timer); setTimeout(() => setAiState("ready"), 500); return 100; }
      return Math.min(100, current + 13);
    }), 420);
    return () => clearInterval(timer);
  }, [aiState]);

  const filtered = useMemo(() => allRows.filter((row) => `${row.id} ${row.description}`.toLowerCase().includes(query.toLowerCase()) && (statusFilter === "Todos" || row.status === statusFilter)), [query, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const rows = filtered.slice((page - 1) * 10, page * 10);
  const chooseFilter = (value) => { setStatusFilter(value); setFilterOpen(false); setPage(1); };
  const toggleSelected = (id) => setSelected((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const approveReview = () => { setReviewed(true); setReviewOpen(false); setToast("Conciliação marcada como revisada com sucesso."); };

  return <AppShell>
    <main id="main-content" className="main-content">
      <nav className="breadcrumb" aria-label="Você está em"><a href="#">Home</a><CaretRight /><a href="#">Ativo Circulante</a><CaretRight /><span>1.1.2.001 Banco Conta Movimento</span></nav>
      <section className="page-heading">
        <div><div className="heading-line"><h1>1.1.2.001 Banco Conta Movimento</h1><span className={`analysis-tag ${reviewed ? "success" : ""}`}>{reviewed ? <CheckCircle weight="fill" /> : <WarningCircle weight="fill" />}{reviewed ? "Revisada" : "Em análise"}</span></div><p>Comparação detalhada · <strong>02 - Bourbon Curitiba Convention Hotel</strong> · Atualizado hoje às 08:12 <IconButton label="Atualizar dados" onClick={() => setToast("Dados atualizados agora.")}><ArrowsClockwise /></IconButton></p></div>
        <div className="page-actions"><label>Escopo<select defaultValue="1.1.2.001"><option>Todas as contas</option><option value="1.1.2.001">1.1.2.001 Banco Conta Movimento</option><option>1.1.2.002 Banco Conta Aplicação</option><option>1.1.3.001 Clientes Nacionais</option></select></label><label>Período<select defaultValue="ago/2024"><option>ago/2024</option><option>jul/2024</option><option>jun/2024</option></select></label><button className="button secondary" onClick={() => setToast("Exportação preparada em CSV.")}><DownloadSimple />Exportar<CaretDown /></button></div>
      </section>

      <section className="summary-card" aria-label="Resumo da conciliação">
        <div className="desktop-balances"><span><small>Saldo contábil</small><strong>{money(850000)}</strong></span><span><small>Valor origem</small><strong>{money(849200)}</strong></span></div>
        <div className="summary-primary"><span>Sem explicação</span><strong><WarningCircle weight="fill" />+R$ 800,00</strong></div>
        <div className="summary-progress"><strong>32 de 42</strong><span>conciliadas</span><div><i /></div></div>
        <div className="summary-filters" role="group" aria-label="Filtrar por situação"><button onClick={() => chooseFilter("Divergente")}><WarningCircle weight="fill" /><strong>7</strong><span>divergentes</span></button><button onClick={() => chooseFilter("Não encontrada")}><Info weight="fill" /><strong>3</strong><span>não encontradas</span></button><button onClick={() => { setAiOpen(true); setStatusFilter("Todos"); }}><Sparkle weight="fill" /><strong>3</strong><span>sugestões</span></button></div>
        <IconButton label={summaryExpanded ? "Recolher resumo" : "Expandir resumo"} onClick={() => setSummaryExpanded((v) => !v)}><CaretDown className={summaryExpanded ? "rotate" : ""} /></IconButton>
        {summaryExpanded && <div className="summary-details"><span><small>Taxa de conciliação</small><strong>76%</strong></span><span><small>Itens pendentes</small><strong>10</strong></span><span><small>Sugestões da IA</small><strong>3</strong></span></div>}
      </section>

      {!aiOpen && <section className="ai-callout" role="status"><Sparkle weight="fill" /><span>Há +R$ 800,00 sem explicação nesta conta. A IA pode analisar as causas.</span><button className="button primary" onClick={() => { setAiOpen(true); setAiState("processing"); }}><Sparkle />Analisar com IA</button><button className="button ghost" onClick={() => setToast("Lembrete dispensado por enquanto.")}>Agora não</button></section>}

      <div className={`workspace ${aiOpen ? "with-ai" : ""}`}>
        <section className="table-card">
          <div className="toolbar">
            <label className="search"><MagnifyingGlass /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Buscar documento, descrição ou planilha…" aria-label="Buscar documento, descrição ou planilha" /></label>
            <div className="menu-anchor"><button className={`button secondary ${statusFilter !== "Todos" ? "active" : ""}`} onClick={() => { setFilterOpen((v) => !v); setViewOpen(false); }}><Funnel />Filtros{statusFilter !== "Todos" && <span className="badge">1</span>}</button>{filterOpen && <div className="popover filter-popover"><strong>Status</strong>{["Todos", "Divergente", "Não encontrada", "Conciliada"].map((value) => <button key={value} onClick={() => chooseFilter(value)}><span className={`radio ${statusFilter === value ? "selected" : ""}`} />{value}</button>)}</div>}</div>
            <div className="menu-anchor"><button className="button secondary" onClick={() => { setViewOpen((v) => !v); setFilterOpen(false); }}><GearSix />Visão</button>{viewOpen && <div className="popover view-popover"><strong>Gerenciar visão</strong><label><input type="checkbox" defaultChecked /> Valores</label><label><input type="checkbox" defaultChecked /> Status</label><label><input type="checkbox" defaultChecked /> Documento</label></div>}</div>
            <div className="toolbar-meta"><strong>{filtered.length} registros</strong><IconButton label="Diferença = Valor contábil menos valor origem"><Info /></IconButton></div>
            <button className="button ai-panel-button" onClick={() => setAiOpen((v) => !v)}><Sparkle weight="fill" />Painel da IA<span className="badge">3</span></button>
          </div>
          {statusFilter !== "Todos" && <div className="applied-filters"><span>Status: {statusFilter}<button aria-label={`Remover filtro ${statusFilter}`} onClick={() => chooseFilter("Todos")}><X /></button></span><button onClick={() => chooseFilter("Todos")}>Remover todos</button></div>}

          <div className="desktop-table-wrap"><table aria-label="Transações pareadas: sistema de origem e contabilidade"><thead><tr><th><input type="checkbox" aria-label="Selecionar linhas elegíveis desta página" checked={rows.length > 0 && rows.every((row) => selected.has(row.id))} onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((row) => row.id)) : new Set())} /></th><th>Data</th><th>Descrição</th><th>Documento</th><th>Valor origem</th><th>Valor contábil</th><th>Diferença</th><th>Status</th><th>Ações</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className={selected.has(row.id) ? "selected" : ""}>
            <td><input type="checkbox" aria-label={`Marcar ${row.id} para vincular`} checked={selected.has(row.id)} onChange={() => toggleSelected(row.id)} /></td><td>{row.date}</td><td><div className="description">{row.ai && <span className="ai-mark" title="Sugestão da IA"><Sparkle weight="fill" />IA</span>}<span title={row.description}>{row.description}</span></div></td><td><code>{row.id}</code></td><td className="number">{money(row.origin)}</td><td className="number">{money(row.accounting)}</td><td className={`difference difference--${row.issue}`}>{row.issue === "data" && <Info weight="fill" />}{row.difference}</td><td><Status row={row} /></td><td className="actions-cell"><IconButton label={`Ações de ${row.id}`} onClick={() => setActionsFor(actionsFor === row.id ? null : row.id)}><DotsThreeVertical weight="bold" /></IconButton>{actionsFor === row.id && <RowMenu row={row} onDetails={() => { setDetails(row); setActionsFor(null); }} onAction={(message) => { setToast(message); setActionsFor(null); }} />}</td>
          </tr>)}</tbody></table></div>

          <div className="mobile-cards">{rows.map((row) => <article key={row.id} className="transaction-card"><header><label><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelected(row.id)} /> <code>{row.id}</code></label><Status row={row} /></header><strong>{row.description}</strong><span>{row.date}</span><dl><div><dt>Origem</dt><dd>{money(row.origin)}</dd></div><div><dt>Contábil</dt><dd>{money(row.accounting)}</dd></div><div><dt>Diferença</dt><dd className={`difference--${row.issue}`}>{row.difference}</dd></div></dl><button className="button secondary full" onClick={() => setDetails(row)}>Ver detalhes</button></article>)}</div>
          {rows.length === 0 && <div className="empty-state"><MagnifyingGlass size={30} /><strong>Nenhuma transação encontrada</strong><span>Ajuste a busca ou remova os filtros aplicados.</span><button className="button secondary" onClick={() => { setQuery(""); chooseFilter("Todos"); }}>Limpar filtros</button></div>}
          <footer className="table-footer"><span>Mostrando {rows.length ? (page - 1) * 10 + 1 : 0}–{Math.min(page * 10, filtered.length)} de {filtered.length} · Diferença = Valor contábil − Valor origem</span><nav aria-label="Paginação"><IconButton label="Página anterior" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><CaretLeft /></IconButton>{Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((number) => <button key={number} className={page === number ? "current" : ""} onClick={() => setPage(number)} aria-label={`Página ${number}`}>{number}</button>)}<IconButton label="Próxima página" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><CaretRight /></IconButton></nav></footer>
        </section>

        {aiOpen && <aside className="ai-panel" aria-label="Painel da IA"><header><div><Sparkle weight="fill" /><span><strong>Análise inteligente</strong><small>{aiState === "processing" ? "Analisando as divergências" : "3 sugestões prontas"}</small></span></div><IconButton label="Fechar painel da IA" onClick={() => setAiOpen(false)}><X /></IconButton></header>{aiState === "processing" ? <div className="ai-processing"><SpinnerGap className="spin" size={36} /><strong>Analisando 42 transações…</strong><p>Comparando datas, valores, documentos e padrões históricos.</p><div className="progress"><i style={{ width: `${progress}%` }} /></div><span>{progress}% concluído</span><button className="button secondary" onClick={() => { setAiState("ready"); setProgress(0); }}>Cancelar análise</button></div> : <div className="suggestion-list"><div className="ai-summary"><Sparkle weight="fill" /><div><strong>3 correspondências encontradas</strong><span>Revise antes de aplicar qualquer sugestão.</span></div></div>{aiResults.suggestions.slice(0, 3).map((item) => <article key={item.id}><div><span className={`confidence confidence--${item.confidencePercent >= 85 ? "high" : "medium"}`}>{item.confidencePercent}% confiança</span><strong>{item.comparison.sourceSystem.documentId || "Sem documento"}</strong></div><p>{item.reasoning}</p><button className="button secondary full" onClick={() => setToast("Sugestão aberta para revisão.")}>Revisar sugestão</button></article>)}<button className="button primary full" onClick={() => setToast("Sugestões aplicadas à seleção.")}><Check />Aplicar sugestões selecionadas</button></div>}</aside>}
      </div>
    </main>

    <footer className="review-bar" aria-label="Ações da conciliação"><div><Info weight="fill" /><span>{reviewed ? "Conciliação revisada. Reabra para fazer novos ajustes." : "Diferença sem explicação +R$ 800,00 e 10 itens pendentes: aprovar exige justificativa."}</span></div><IconButton label="Mais ações" onClick={() => setToast("Ações adicionais: exportar pendências ou solicitar nova análise.")}><DotsThreeVertical /></IconButton><button className="button primary" disabled={reviewed} onClick={() => setReviewOpen(true)}>{reviewed ? <CheckCircle weight="fill" /> : <CheckCircle />} {reviewed ? "Revisada" : "Marcar como revisado"}</button></footer>
    {details && <DetailsDrawer row={details} onClose={() => setDetails(null)} onToast={setToast} />}
    {reviewOpen && <ReviewDialog justification={justification} setJustification={setJustification} inputRef={modalInput} onClose={() => setReviewOpen(false)} onApprove={approveReview} />}
    {toast && <div className="toast" role="status"><CheckCircle weight="fill" /><span>{toast}</span><IconButton label="Fechar notificação" onClick={() => setToast("")}><X /></IconButton></div>}
  </AppShell>;
}

function RowMenu({ row, onDetails, onAction }) {
  return <div className="row-menu" role="menu"><button role="menuitem" onClick={onDetails}><List />Ver detalhes</button><button role="menuitem" onClick={() => onAction(`${row.id} selecionado para vinculação manual.`)}><LinkSimple />Vincular manualmente</button><button role="menuitem" onClick={() => onAction(`Envio de documento aberto para ${row.id}.`)}><Paperclip />Anexar documento</button></div>;
}

function DetailsDrawer({ row, onClose, onToast }) {
  return <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><aside className="details-drawer" role="dialog" aria-modal="true" aria-labelledby="detail-title"><header><div><small>Detalhes da transação</small><h2 id="detail-title">{row.id}</h2></div><IconButton label="Fechar detalhes" onClick={onClose}><X /></IconButton></header><div className="drawer-body"><Status row={row} /><section><h3>Movimento na origem</h3><dl><div><dt>Data</dt><dd>{row.date}</dd></div><div><dt>Documento</dt><dd>{row.id}</dd></div><div><dt>Descrição</dt><dd>{row.description}</dd></div><div><dt>Valor</dt><dd>{money(row.origin)}</dd></div></dl></section><section><h3>Lançamento contábil</h3><dl><div><dt>Valor</dt><dd>{money(row.accounting)}</dd></div><div><dt>Diferença</dt><dd>{row.difference}</dd></div><div><dt>Conta</dt><dd>1.1.2.001 Banco Conta Movimento</dd></div></dl></section>{row.ai && <div className="drawer-insight"><Sparkle weight="fill" /><div><strong>Sugestão da IA</strong><p>Encontramos uma provável correspondência com base em documento, valor e proximidade de datas.</p></div></div>}</div><footer><button className="button secondary" onClick={() => onToast(`Documento solicitado para ${row.id}.`)}><FileArrowUp />Anexar documento</button><button className="button primary" onClick={() => onToast(`${row.id} enviado para vinculação.`)}><LinkSimple />Vincular manualmente</button></footer></aside></div>;
}

function ReviewDialog({ justification, setJustification, inputRef, onClose, onApprove }) {
  const valid = justification.trim().length >= 20;
  return <div className="overlay modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title"><header><div><WarningCircle weight="fill" /><div><h2 id="review-title">Marcar conciliação como revisada?</h2><p>Ainda existem pendências que precisam ser registradas.</p></div></div><IconButton label="Fechar" onClick={onClose}><X /></IconButton></header><div className="dialog-body"><div className="pending-summary"><strong>Antes de confirmar</strong><ul><li><WarningCircle />7 transações divergentes</li><li><Info />3 transações não encontradas</li><li><WarningCircle />+R$ 800,00 sem explicação</li></ul></div><label>Justificativa <span>Obrigatória</span><textarea ref={inputRef} value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Descreva por que a conciliação pode ser marcada como revisada…" rows={4} /><small className={valid ? "valid" : ""}>{justification.length} caracteres — mínimo 20 {valid && <Check weight="bold" />}</small></label><div className="review-attachment"><button className="button ghost" onClick={() => window.dispatchEvent(new CustomEvent("smartx-toast", { detail: "Área de anexos preparada para PDF de até 10 MB." }))}><Paperclip />Anexar arquivo</button><span>Anexo opcional (PDF, até 10 MB)</span></div></div><footer><button className="button secondary" onClick={onClose}>Cancelar</button><button className="button primary" disabled={!valid} onClick={onApprove}><CheckCircle />Confirmar revisão</button></footer></section></div>;
}
