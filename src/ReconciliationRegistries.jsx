import { useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise, ArrowUUpLeft, Check, CheckCircle, CaretDown, CaretLeft, CaretRight,
  FunnelSimple, GearSix, Info, MagnifyingGlass, Plus, Question, SortAscending,
  WarningCircle, X, LinkSimple, LinkBreak, PencilSimple,
} from "@phosphor-icons/react";
import "./reconciliation-registries.css";

const accountsWithoutLink = [
  { id: "1", code: "1", name: "ATIVO", government: "1.01.01.01", governmentName: "CAIXA GERAL" },
  { id: "11", code: "11", name: "ATIVO CIRCULANTE", government: "1.01.01.01", governmentName: "CAIXA GERAL" },
  { id: "111", code: "111", name: "DISPONIBILIDADES", government: "1.01.01.01", governmentName: "CAIXA GERAL" },
  { id: "11101", code: "11101", name: "CAIXA", government: "1.01.01.01", governmentName: "CAIXA GERAL" },
  { id: "11102", code: "11102", name: "BANCOS CONTA MOVIMENTO", government: "1.01.01.01", governmentName: "CAIXA GERAL" },
  { id: "1110101", code: "1110101", name: "CAIXA GERAL", government: "1.01.01.01", governmentName: "CAIXA GERAL" },
  { id: "1110102", code: "1110102", name: "CAIXA GERAL FILIAL", government: "1.01.01.01", governmentName: "CAIXA GERAL" },
  { id: "1110201", code: "1110201", name: "BANCOS CONTA MOVIMENTO", government: "1.01.01.01", governmentName: "CAIXA GERAL" },
  { id: "1110101001", code: "1110101001", name: "CAIXA", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País" },
  { id: "1110101002", code: "1110101002", name: "FUNDO FIXO FINANCEIRO", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País" },
  { id: "1120101001", code: "1120101001", name: "DUPLICATAS A RECEBER COBRANÇA", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País" },
  { id: "1120101003", code: "1120101003", name: "HÓSPEDES NA CASA", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País" },
  { id: "1120301002", code: "1120301002", name: "VISA", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País" },
  { id: "1130101002", code: "1130101002", name: "BEBIDAS", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País" },
  { id: "2120101001", code: "2120101001", name: "FORNECEDORES DIVERSOS", government: "2.03.04.01.90", governmentName: "Contas do Patrimônio Líquido Não Classificadas" },
  { id: "2180102001", code: "2180102001", name: "ADIANTAMENTO DE CLIENTES", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País" },
  ...Array.from({ length: 8 }, (_, index) => ({ id: `2${index}`, code: `2${index}`, name: ["CLIENTES NACIONAIS", "ADIANTAMENTOS", "APLICAÇÕES FINANCEIRAS", "CRÉDITOS TRIBUTÁRIOS", "ESTOQUES", "DESPESAS ANTECIPADAS", "CAIXA FILIAL", "OUTRAS DISPONIBILIDADES"][index], government: index < 4 ? "1.01.01.02.01" : "1.01.02.01.00", governmentName: index < 4 ? "Bancos Conta Movimento - No País" : "Créditos e Valores" })),
];

const systems = {
  PMS: ["Receita de Hospedagem", "Receita de A&B", "Receita de Eventos", "Receita de Lavanderia", "Contas a Receber Hóspedes"],
  "Contas a Receber": ["Aging de Clientes", "Relatório de Recebimentos", "Notas Fiscais Emitidas", "Boletos em Aberto"],
  "Contas a Pagar": ["Aging de Fornecedores", "Relatório de Pagamentos", "Notas Fiscais Recebidas", "Provisões de Pagamento"],
  "Controle Financeiro": ["Extrato Bancário", "Conciliação Bancária", "Fluxo de Caixa", "Movimentação de Caixa"],
  Almoxarifado: ["Posição de Estoque", "Entradas de Material", "Saídas de Material", "Inventário Físico"],
};
const systemNames = Object.keys(systems);

const initialLinked = [
  { id: "1110201002", code: "1110201002", name: "BANCO DO BRASIL C/C 5293-0", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País", systems: ["PMS"] },
  { id: "1120101001", code: "1120101001", name: "DUPLICATAS A RECEBER COBRANCA", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País", systems: ["PMS", "Contas a Receber"] },
  { id: "1120101003", code: "1120101003", name: "HOSPEDES NA CASA", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País", systems: ["PMS"] },
  { id: "1120301002", code: "1120301002", name: "VISA", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País", systems: ["Contas a Receber"] },
  { id: "1130101002", code: "1130101002", name: "BEBIDAS", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País", systems: ["PMS"] },
  { id: "2120101001", code: "2120101001", name: "FORNECEDORES DIVERSOS", government: "2.03.04.01.90", governmentName: "Contas do Patrimônio Líquido Não Classificadas", systems: ["Contas a Pagar", "Controle Financeiro"] },
  { id: "2180102001", code: "2180102001", name: "ADIANTAMENTO DE CLIENTES", government: "1.01.01.02.01", governmentName: "Bancos Conta Movimento - No País", systems: ["Contas a Receber"] },
];

const emptySelection = () => Object.fromEntries(systemNames.map((system) => [system, []]));

export default function ReconciliationRegistries({ onToast }) {
  const [unlinked, setUnlinked] = useState(accountsWithoutLink);
  const [linked, setLinked] = useState(initialLinked);
  const [activeTab, setActiveTab] = useState("unlinked");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [systemFilters, setSystemFilters] = useState(systemNames);
  const [openMenu, setOpenMenu] = useState(null);
  const [density, setDensity] = useState("comfortable");
  const [sortAscending, setSortAscending] = useState(true);
  const [sortBy, setSortBy] = useState("code");
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [modalAccount, setModalAccount] = useState(null);
  const [selectedRelated, setSelectedRelated] = useState([]);
  const [editingLinkedId, setEditingLinkedId] = useState(null);
  const [activeSystem, setActiveSystem] = useState(systemNames[0]);
  const [reportSelection, setReportSelection] = useState(emptySelection);
  const [unlinkTarget, setUnlinkTarget] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [showTip, setShowTip] = useState(null);
  const [showAll, setShowAll] = useState({ linked: false, unlinked: false });
  const [undoEntry, setUndoEntry] = useState(null);

  useEffect(() => {
    if (!modalAccount && !unlinkTarget) return undefined;
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      if (unlinkTarget) setUnlinkTarget(null);
      else setModalAccount(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [modalAccount, unlinkTarget]);

  const ordered = (list) => [...list].sort((a, b) => {
    const left = sortBy === "code" ? a.code : a.name;
    const right = sortBy === "code" ? b.code : b.name;
    return sortAscending ? left.localeCompare(right, "pt-BR", { numeric: true }) : right.localeCompare(left, "pt-BR", { numeric: true });
  });
  const filteredUnlinked = useMemo(() => ordered(unlinked.filter((item) => `${item.code} ${item.name} ${item.government} ${item.governmentName}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")))), [unlinked, query, sortAscending, sortBy]);
  const filteredLinked = useMemo(() => ordered(linked.filter((item) => `${item.code} ${item.name} ${item.government} ${item.governmentName} ${item.systems.join(" ")}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR"))).filter((item) => item.systems.some((system) => systemFilters.includes(system)))), [linked, query, sortAscending, sortBy, systemFilters]);
  const displayedUnlinked = filteredUnlinked.slice((page - 1) * pageSize, page * pageSize);
  const displayedLinked = filteredLinked.slice((page - 1) * pageSize, page * pageSize);
  const reportCount = Object.values(reportSelection).flat().length;
  const selectedRelatedCount = selectedRelated.length;
  const totalAccounts = linked.length + unlinked.length;
  const mappedPercent = totalAccounts ? Math.round((linked.length / totalAccounts) * 100) : 0;
  const modalPeers = modalAccount ? [
    ...unlinked.filter((item) => item.government === modalAccount.government),
    ...(editingLinkedId ? linked.filter((item) => item.id === editingLinkedId) : []),
  ] : [];

  const toggleSelection = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleAllOnPage = (rows) => {
    const ids = rows.map((row) => row.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds((current) => allSelected ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])]);
  };
  const openLinkDialog = (account, linkedEdit = false) => {
    const peers = linkedEdit ? [account] : unlinked.filter((item) => item.government === account.government);
    setModalAccount(account);
    setEditingLinkedId(linkedEdit ? account.id : null);
    setSelectedRelated(peers.map((item) => item.id));
    setReportSelection(linkedEdit ? Object.fromEntries(systemNames.map((system) => [system, account.systems.includes(system) ? systems[system] : []])) : emptySelection());
    setActiveSystem(systemNames[0]);
    setOpenMenu(null);
  };
  const toggleReport = (system, report) => setReportSelection((current) => ({ ...current, [system]: current[system].includes(report) ? current[system].filter((item) => item !== report) : [...current[system], report] }));
  const toggleAllReports = (system) => setReportSelection((current) => ({ ...current, [system]: current[system].length === systems[system].length ? [] : [...systems[system]] }));
  const commitLink = () => {
    if (!modalAccount || selectedRelatedCount === 0 || reportCount === 0) return;
    const itemsToLink = unlinked.filter((item) => selectedRelated.includes(item.id));
    const systemsSelected = systemNames.filter((system) => reportSelection[system].length > 0);
    setLinked((current) => [
      ...itemsToLink.map((item) => ({ ...item, systems: systemsSelected })),
      ...(editingLinkedId ? current.filter((item) => item.id === editingLinkedId).map((item) => ({ ...item, systems: systemsSelected })) : []),
      ...current.filter((item) => item.id !== editingLinkedId),
    ]);
    setUnlinked((current) => current.filter((item) => !selectedRelated.includes(item.id)));
    setSelectedIds((current) => current.filter((id) => !selectedRelated.includes(id)));
    const message = `${itemsToLink.length} ${itemsToLink.length === 1 ? "conta vinculada" : "contas vinculadas"} a ${systemsSelected.join(", ")}.`;
    setModalAccount(null);
    setEditingLinkedId(null);
    setActiveTab("linked");
    onToast?.(message);
  };
  const confirmUnlink = () => {
    if (!unlinkTarget) return;
    const existing = linked.find((item) => item.id === unlinkTarget.id);
    if (!existing) return;
    setLinked((current) => current.filter((item) => item.id !== unlinkTarget.id));
    setUnlinked((current) => [{ ...existing, systems: undefined }, ...current]);
    setUndoEntry(existing);
    setUnlinkTarget(null);
    setActiveTab("unlinked");
    onToast?.(`${existing.name} desvinculada. Você pode desfazer esta ação.`);
  };
  const undoUnlink = () => {
    if (!undoEntry) return;
    setUnlinked((current) => current.filter((item) => item.id !== undoEntry.id));
    setLinked((current) => [undoEntry, ...current]);
    setUndoEntry(null);
    onToast?.("Vínculo restaurado.");
  };

  const toggleSystemFilter = (system) => {
    if (system === "Todos") {
      setSystemFilters(systemFilters.length === systemNames.length ? [] : systemNames);
    } else {
      setSystemFilters((current) => current.includes(system) ? current.filter((item) => item !== system) : [...current, system]);
    }
    setPage(1);
  };

  const pageButtons = (total) => {
    const pageTotal = Math.max(1, Math.ceil(total / pageSize));
    return <nav className="registry-pagination" aria-label="Paginação"><button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><CaretLeft /></button>{Array.from({ length: Math.min(pageTotal, 3) }, (_, index) => <button key={index + 1} type="button" className={page === index + 1 ? "current" : ""} aria-current={page === index + 1 ? "page" : undefined} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button type="button" aria-label="Próxima página" disabled={page >= pageTotal} onClick={() => setPage((value) => value + 1)}><CaretRight /></button></nav>;
  };

  return <main id="main-content" className={`main-content reconciliation-registries density-${density}`}>
    <header className="registry-page-heading"><div><h1>Cadastros de Conciliação</h1><p>Atualizado hoje às 14:37 <button type="button" className="registry-icon-button" aria-label="Atualizar dados" title="Atualizar dados" onClick={() => onToast?.("Cadastros atualizados.")}><ArrowsClockwise /></button></p></div></header>

    {noticeVisible && <aside className="registry-notice" role="status"><Info /><div><p><strong>Mapeamento automático via SPED em breve.</strong> Atualmente <strong>{linked.length} de {totalAccounts}</strong> contas disponíveis já estão vinculadas; a lista será ampliada quando o vínculo automático for liberado.</p><div className="registry-progress"><span><i style={{ width: `${mappedPercent}%` }} /></span><strong>{mappedPercent}% mapeado</strong><span className="registry-deadline">Prazo em validação com produto</span></div></div><button type="button" className="registry-icon-button" aria-label="Fechar aviso" onClick={() => setNoticeVisible(false)}><X /></button></aside>}

    <nav className="registry-tabs" role="tablist" aria-label="Situação do vínculo">{[["unlinked", "Não Vinculadas"], ["linked", "Vinculadas"], ["all", "Todas"]].map(([value, label]) => <button type="button" role="tab" key={value} aria-selected={activeTab === value} className={activeTab === value ? "active" : ""} onClick={() => { setActiveTab(value); setPage(1); setSelectedIds([]); setOpenMenu(null); }}>{label}</button>)}</nav>

    {undoEntry && <div className="registry-undo-toast" role="status"><CheckCircle /><span>Vínculo removido de {undoEntry.name}</span><button type="button" onClick={undoUnlink}><ArrowUUpLeft />Desfazer</button><button type="button" aria-label="Fechar aviso" onClick={() => setUndoEntry(null)}><X /></button></div>}

    {(activeTab === "unlinked" || activeTab === "linked") && <section className="registry-card">
      <div className="registry-toolbar">
        <label className="registry-search"><MagnifyingGlass /><span className="visually-hidden">Buscar conta</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por código, nome ou conta" /></label>
        {activeTab === "linked" && <div className="registry-source-filters" role="group" aria-label="Filtrar por sistema de origem"><span>Sistema de origem:</span>{["Todos", ...systemNames].map((system) => <label key={system}><input type="checkbox" checked={system === "Todos" ? systemFilters.length === systemNames.length : systemFilters.includes(system)} onChange={() => toggleSystemFilter(system)} />{system === "Todos" ? `Todos ${linked.length}` : `${system} ${linked.filter((item) => item.systems.includes(system)).length}`}</label>)}</div>}
        <div className="registry-toolbar-tail">
          <div className="registry-menu-anchor"><button type="button" className="button ghost" aria-expanded={openMenu === "view"} onClick={() => setOpenMenu(openMenu === "view" ? null : "view")}><GearSix />Gerenciar visão</button>{openMenu === "view" && <div className="registry-popover"><strong>DENSIDADE</strong><button type="button" onClick={() => { setDensity("comfortable"); setOpenMenu(null); }}>Confortável</button><button type="button" onClick={() => { setDensity("compact"); setOpenMenu(null); }}>Compacta</button></div>}</div>
          <span className="registry-count" role="status">Exibindo <strong>{activeTab === "unlinked" ? filteredUnlinked.length : filteredLinked.length}</strong> registros</span>
        </div>
      </div>
      {showTip && <div className="registry-help-inline" role="status"><Info /><span>{showTip === "government" ? "Conta referencial do plano de contas do governo associada à conta contábil." : "Relatórios dos sistemas de origem alimentam os dados da conciliação."}</span><button type="button" aria-label="Fechar explicação" onClick={() => setShowTip(null)}><X /></button></div>}
      {selectedIds.length > 0 && activeTab === "unlinked" && <div className="registry-bulk-bar"><strong>{selectedIds.length} contas selecionadas</strong><span>O vínculo em lote exige a mesma Conta Gov.</span><button type="button" className="button secondary" onClick={() => { const account = unlinked.find((item) => selectedIds.includes(item.id)); if (account) openLinkDialog(account); }}><LinkSimple />Configurar vínculo</button><button type="button" className="registry-icon-button" aria-label="Limpar seleção" onClick={() => setSelectedIds([])}><X /></button></div>}

      {activeTab === "unlinked" && <div className="registry-table-wrap" role="region" aria-label="Contas não vinculadas; role horizontalmente para acessar todas as ações" tabIndex={0}><table className="registry-table"><thead><tr><th><input type="checkbox" aria-label="Selecionar todas as contas da página" checked={displayedUnlinked.length > 0 && displayedUnlinked.every((item) => selectedIds.includes(item.id))} onChange={() => toggleAllOnPage(displayedUnlinked)} /></th><th><button type="button" onClick={() => { setSortBy("code"); setSortAscending((value) => !value); }}>Código <SortAscending className={sortAscending ? "" : "descending"} /></button></th><th><button type="button" onClick={() => { setSortBy("name"); setSortAscending((value) => !value); }}>Conta contábil <SortAscending className={sortAscending ? "" : "descending"} /></button></th><th>Conta Gov (ECD) <button type="button" className="registry-info-button" aria-label="O que é Conta Gov (ECD)" title="Conta referencial do plano de contas do governo associada à conta contábil." onClick={() => setShowTip(showTip === "government" ? null : "government")}><Question /></button></th><th>Ações</th></tr></thead><tbody>{displayedUnlinked.map((item) => <tr key={item.id} className={selectedIds.includes(item.id) ? "selected" : ""}><td><input type="checkbox" aria-label={`Selecionar ${item.code} - ${item.name}`} checked={selectedIds.includes(item.id)} onChange={() => toggleSelection(item.id)} /></td><td><code>{item.code}</code></td><td>{item.name}</td><td><code>{item.government}</code><span>{item.governmentName}</span></td><td><button type="button" className="button ghost compact-button" aria-label={`Vincular ${item.code} - ${item.name}`} onClick={() => openLinkDialog(item)}><LinkSimple />Vincular</button></td></tr>)}</tbody></table>{filteredUnlinked.length === 0 && <div className="registry-empty"><MagnifyingGlass /><strong>Nenhuma conta encontrada</strong><p>Ajuste a busca ou limpe o campo.</p><button type="button" className="button ghost" onClick={() => setQuery("")}>Limpar busca</button></div>}<p className="registry-scroll-hint">Deslize a tabela para acessar as ações de cada conta.</p></div>}

      {activeTab === "linked" && <div className="registry-table-wrap" role="region" aria-label="Contas vinculadas; role horizontalmente para acessar todas as ações" tabIndex={0}><table className="registry-table"><thead><tr><th><input type="checkbox" aria-label="Selecionar todas as correlações da página" checked={displayedLinked.length > 0 && displayedLinked.every((item) => selectedIds.includes(item.id))} onChange={() => toggleAllOnPage(displayedLinked)} /></th><th><button type="button" onClick={() => { setSortBy("name"); setSortAscending((value) => !value); }}>Conta contábil <SortAscending className={sortAscending ? "" : "descending"} /></button></th><th>Sistemas vinculados <button type="button" className="registry-info-button" aria-label="O que são sistemas de origem" title="Relatórios dos sistemas que alimentam a conciliação." onClick={() => setShowTip(showTip === "systems" ? null : "systems")}><Question /></button></th><th>Conta Gov (ECD) <button type="button" className="registry-info-button" aria-label="O que é Conta Gov (ECD)" title="Conta referencial do plano de contas do governo associada à conta contábil." onClick={() => setShowTip(showTip === "government" ? null : "government")}><Question /></button></th><th>Ações</th></tr></thead><tbody>{displayedLinked.map((item) => <tr key={item.id} className={selectedIds.includes(item.id) ? "selected" : ""}><td><input type="checkbox" aria-label={`Selecionar ${item.code} - ${item.name}`} checked={selectedIds.includes(item.id)} onChange={() => toggleSelection(item.id)} /></td><td><code>{item.code}</code><strong>{item.name}</strong></td><td><div className="registry-system-tags">{item.systems.map((system) => <span key={system}>{system}</span>)}</div></td><td><code>{item.government}</code><span>{item.governmentName}</span></td><td><div className="registry-actions"><button type="button" className="button ghost compact-button" aria-label={`Editar vínculo de ${item.code} - ${item.name}`} onClick={() => openLinkDialog(item, true)}><PencilSimple />Editar</button><button type="button" className="button ghost compact-button danger-text" aria-label={`Desvincular ${item.code} - ${item.name}`} onClick={() => setUnlinkTarget(item)}><LinkBreak />Desvincular</button></div></td></tr>)}</tbody></table>{filteredLinked.length === 0 && <div className="registry-empty"><FunnelSimple /><strong>Nenhum vínculo para os filtros atuais</strong><button type="button" className="button ghost" onClick={() => setSystemFilters(systemNames)}>Limpar filtros</button></div>}<p className="registry-scroll-hint">Deslize a tabela para acessar todas as ações.</p></div>}

      <footer className="registry-footer">{pageButtons(activeTab === "unlinked" ? filteredUnlinked.length : filteredLinked.length)}<label>Mostrar:<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={10}>10 linhas</option><option value={20}>20 linhas</option><option value={50}>50 linhas</option></select></label></footer>
    </section>}

    {activeTab === "all" && <section className="registry-summary-grid" aria-label="Todas as contas">
      {[{ key: "linked", title: "Vinculadas", items: linked }, { key: "unlinked", title: "Não Vinculadas", items: unlinked }].map(({ key, title, items }) => <article className="registry-summary-card" key={key}><header><h2>{title} <span>({items.length})</span></h2><span>{items.length} registros</span></header><div>{items.slice(0, showAll[key] ? items.length : 5).map((item) => <div className="registry-summary-row" key={item.id}><div><strong>{item.code} <span>–</span> {item.name}</strong><small>Gov: {item.government} {item.governmentName}</small></div>{key === "linked" ? <button type="button" className="button ghost compact-button danger-text" onClick={() => setUnlinkTarget(item)}><LinkBreak />Desvincular</button> : <button type="button" className="button ghost compact-button" onClick={() => openLinkDialog(item)}><LinkSimple />Vincular</button>}</div>)}</div><button type="button" className="registry-summary-link" onClick={() => { setActiveTab(key); setPage(1); }}>{showAll[key] ? "Abrir lista completa" : `Ver todas as ${title.toLowerCase()} (${items.length})`} <CaretRight /></button></article>)}
    </section>}

    <button type="button" className="registry-ai" title="Assistente IA" aria-label="Assistente IA" onClick={() => onToast?.("Assistente IA aberto para apoiar os cadastros.")}>IA</button>

    {modalAccount && <div className="registry-overlay registry-side-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalAccount(null); }}><aside className="registry-link-side-modal" role="dialog" aria-modal="true" aria-labelledby="registry-link-title"><header><div><small>CADASTRO DE CONCILIAÇÃO</small><h2 id="registry-link-title">Configurar vínculo</h2></div><button type="button" className="registry-icon-button" aria-label="Fechar" onClick={() => setModalAccount(null)}><X /></button></header><div className="registry-modal-body">
      <section className="registry-government-pair"><small>ASSOCIAÇÃO AO PLANO DO GOVERNO</small><div><span><em>CONTA CONTÁBIL · PLANO EMPRESA</em><strong>{modalAccount.code} {modalAccount.name}</strong></span><b>vs</b><span><em>CONTA REFERENCIAL · PLANO GOVERNO</em><strong>{modalAccount.government} {modalAccount.governmentName}</strong></span></div><small>SOMENTE LEITURA · ECD</small></section>
      <section className="registry-related-accounts"><header><div><strong>Contas do sistema (mesma Conta Gov)</strong><small>Encontramos {modalPeers.length} contas ainda não vinculadas à mesma Conta Gov {modalAccount.government}. Selecione todas ou só algumas.</small></div><span>{selectedRelatedCount} de {modalPeers.length} selecionada(s)</span></header><div className="registry-inline-actions"><button type="button" className="button ghost" onClick={() => setSelectedRelated(modalPeers.map((item) => item.id))}>Selecionar todas</button><button type="button" className="button ghost" onClick={() => setSelectedRelated([])}>Limpar seleção</button></div><div className="registry-related-list">{modalPeers.map((item) => <label key={item.id}><input type="checkbox" checked={selectedRelated.includes(item.id)} onChange={() => setSelectedRelated((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} /><code>{item.code}</code><span>{item.name}</span></label>)}</div></section>
      <section className="registry-report-picker"><header><div><strong>Sistemas de origem</strong><small>Escolha os relatórios que alimentam a conciliação dessas contas.</small></div><button type="button" className="registry-info-button" aria-label="O que são sistemas de origem" title="Sistemas que fornecem os dados financeiros conciliados."><Question /></button></header><nav role="tablist" aria-label="Sistemas de origem">{systemNames.map((system) => <button type="button" role="tab" aria-selected={activeSystem === system} className={activeSystem === system ? "active" : ""} key={system} onClick={() => setActiveSystem(system)}>{system}<span>{reportSelection[system].length || ""}</span></button>)}</nav><div className="registry-report-heading"><strong>{activeSystem}</strong><button type="button" className="button ghost compact-button" onClick={() => toggleAllReports(activeSystem)}>{reportSelection[activeSystem].length === systems[activeSystem].length ? "Limpar seleção" : "Marcar todos"}</button></div><div className="registry-report-list">{systems[activeSystem].map((report) => <label key={report}><input type="checkbox" checked={reportSelection[activeSystem].includes(report)} onChange={() => toggleReport(activeSystem, report)} />{report}</label>)}</div>{reportCount === 0 && <p className="registry-validation"><WarningCircle />Selecione ao menos um relatório de origem.</p>}</section>
      </div><footer><span>{selectedRelatedCount} contas · {reportCount} relatórios</span><button type="button" className="button ghost" onClick={() => setModalAccount(null)}>Cancelar</button><button type="button" className="button primary" disabled={selectedRelatedCount === 0 || reportCount === 0} onClick={commitLink}><LinkSimple />Vincular selecionadas ({selectedRelatedCount})</button></footer></aside></div>}

    {unlinkTarget && <div className="registry-overlay registry-modal-overlay" role="presentation"><section className="registry-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="registry-unlink-title"><header><WarningCircle /><div><h2 id="registry-unlink-title">Desvincular conta</h2><p>Deseja remover este vínculo?</p></div><button type="button" className="registry-icon-button" aria-label="Fechar" onClick={() => setUnlinkTarget(null)}><X /></button></header><div><strong>{unlinkTarget.code} – {unlinkTarget.name}</strong><span>Conta Gov: {unlinkTarget.government} {unlinkTarget.governmentName}</span><p>A conta voltará para a aba “Não Vinculadas”.</p></div><footer><button type="button" className="button ghost" onClick={() => setUnlinkTarget(null)}>Cancelar</button><button type="button" className="button danger" onClick={confirmUnlink}>Desvincular</button></footer></section></div>}
  </main>;
}
