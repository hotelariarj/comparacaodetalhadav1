import { useMemo, useState } from "react";
import {
  ArrowsClockwise, CaretDown, CaretLeft, CaretRight, Check, FunnelSimple,
  GearSix, Info, MagnifyingGlass, Robot, ShieldCheck, SortAscending,
  UserMinus, UsersThree, Warning, X,
} from "@phosphor-icons/react";
import "./access-control.css";

const initialAccounts = [
  { id: "auditoria", initials: "AU", name: "AUDITORIA", type: "group", detail: "Grupo · AUDITORIA", members: 3, role: "Somente Visualização" },
  { id: "contabilidade", initials: "CO", name: "CONTABILIDADE HOTEL", type: "group", detail: "Grupo · CONTABILIDADE", members: 8, role: "Permite Conciliar" },
  { id: "contador", initials: "CO", name: "Contador", type: "member", detail: "@CELIO.CONT", group: "CONTABILIDADE", role: "Permite Conciliar" },
  { id: "informatica", initials: "IN", name: "INFORMATICA", type: "group", detail: "Grupo · INFORMATICA", members: 5, role: "Controle Administrativo" },
  { id: "luiz", initials: "LU", name: "Luiz Fernandes", type: "member", detail: "@LUIZ.CONT", group: "CONTABILIDADE", role: "Permite Conciliar", inactive: true },
  { id: "supervisor", initials: "SU", name: "Supervisor de Informatica", type: "member", detail: "@MARIO.INF", group: "INFORMATICA", role: "Controle Administrativo" },
];

const groupMembers = {
  auditoria: [
    ["AN", "Ana Paula Souza", "@ANA.AUDI", "Somente Visualização"],
    ["BR", "Bruno Carvalho", "@BRUNO.AUDI", "Somente Visualização"],
    ["CA", "Carla Mendes", "@CARLA.AUDI", "Somente Visualização"],
  ],
  contabilidade: [
    ["CE", "Célio Contador", "@CELIO.CONT", "Permite Conciliar"],
    ["LU", "Luiz Fernandes", "@LUIZ.CONT", "Permite Conciliar"],
    ["MA", "Mariana Alves", "@MARIANA.CONT", "Permite Conciliar"],
  ],
  informatica: [
    ["SU", "Supervisor de Informatica", "@MARIO.INF", "Controle Administrativo"],
    ["PA", "Paulo Andrade", "@PAULO.INF", "Controle Administrativo"],
    ["RE", "Renata Costa", "@RENATA.INF", "Controle Administrativo"],
  ],
};

const roles = [
  ["Somente Visualização", "Consulta dashboard, comparações e logs. Não executa conciliações nem altera cadastros."],
  ["Permite Conciliar", "Tudo de Visualização, mais executar conciliações e aceitar ou rejeitar divergências."],
  ["Controle Administrativo", "Tudo de Conciliar, mais gerenciar cadastros de conciliação e papéis de acesso."],
];

export default function AccessControl({ onToast }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos os papéis");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [openMenu, setOpenMenu] = useState(null);
  const [density, setDensity] = useState("comfortable");
  const [ascending, setAscending] = useState(true);
  const [sortBy, setSortBy] = useState("name");
  const [roleHelpOpen, setRoleHelpOpen] = useState(false);
  const [groupDrawer, setGroupDrawer] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState(null);

  const visibleAccounts = useMemo(() => accounts
    .filter((account) => activeTab === "all" || (activeTab === "members" ? account.type === "member" : account.type === "group"))
    .filter((account) => roleFilter === "Todos os papéis" || account.role === roleFilter)
    .filter((account) => statusFilter === "Todos" || (statusFilter === "Somente inativas" ? account.inactive : !account.inactive))
    .filter((account) => `${account.name} ${account.detail} ${account.group || ""}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")))
    .sort((a, b) => {
      const left = sortBy === "role" ? a.role : a.name;
      const right = sortBy === "role" ? b.role : b.name;
      return ascending ? left.localeCompare(right, "pt-BR") : right.localeCompare(left, "pt-BR");
    }),
  [accounts, activeTab, roleFilter, statusFilter, query, ascending, sortBy]);

  const inactiveAccount = accounts.find((account) => account.inactive);
  const chooseRole = (accountId, role) => {
    const target = accounts.find((item) => item.id === accountId);
    if (!target) return;
    if (role === "Controle Administrativo" && target.role !== role) {
      setRoleChangeTarget({ ...target, nextRole: role });
      setOpenMenu(null);
      return;
    }
    applyRoleChange(target, role);
  };
  const applyRoleChange = (target, role) => {
    setAccounts((items) => items.map((item) => item.id === target.id ? { ...item, role } : item));
    setOpenMenu(null);
    setRoleChangeTarget(null);
    onToast?.(`Papel de ${target.name} alterado para ${role}. Consulte os Logs de Auditoria.`);
  };
  const revokeAccess = () => {
    const revokedName = revokeTarget?.name;
    setAccounts((items) => items.filter((item) => item.id !== revokeTarget?.id));
    setRevokeTarget(null);
    onToast?.(`Acesso de ${revokedName} revogado e registrado nos Logs de Auditoria.`);
  };
  const reviewInactive = () => {
    setActiveTab("members");
    setStatusFilter("Somente inativas");
    setOpenMenu(null);
  };
  const clearFilters = () => {
    setRoleFilter("Todos os papéis");
    setStatusFilter("Todos");
  };

  return <main id="main-content" className={`main-content access-control-page density-${density}`}>
    <header className="access-heading">
        <div><h1>Controle de Acesso</h1><p>Atualizado hoje às 14:21 <button type="button" className="access-icon-button" aria-label="Atualizar dados" title="Atualizar dados" onClick={() => onToast?.("Dados de acesso atualizados.")}><ArrowsClockwise /></button></p></div>
    </header>

    {inactiveAccount && <aside className="access-warning" role="status">
      <Warning weight="fill" />
      <p><strong>1 conta inativa ainda tem acesso.</strong> {inactiveAccount.name} ({inactiveAccount.role}).<br />Revogue o acesso de quem saiu da empresa.</p>
      <button type="button" className="button secondary" onClick={reviewInactive}>Revisar contas inativas</button>
    </aside>}

    <nav className="access-tabs" role="tablist" aria-label="Tipo de conta">
      {[['all', 'Todos'], ['members', 'Membros'], ['groups', 'Grupos']].map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={activeTab === value} className={activeTab === value ? "active" : ""} onClick={() => { setActiveTab(value); setOpenMenu(null); }}>{label}</button>)}
    </nav>

    <section className="access-card" aria-label="Contas e grupos">
      <div className="access-toolbar">
        <label className="access-search"><MagnifyingGlass /><span className="visually-hidden">Buscar conta ou grupo</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar conta ou grupo" /></label>
        <div className="access-menu-anchor">
          <button type="button" className="button ghost" aria-expanded={openMenu === "filters"} onClick={() => setOpenMenu(openMenu === "filters" ? null : "filters")}><FunnelSimple />Filtros{(roleFilter !== "Todos os papéis" || statusFilter !== "Todos") && <span className="access-count">1</span>}</button>
          {openMenu === "filters" && <div className="access-popover access-filter-popover">
            <strong>PAPEL DE ACESSO</strong>
            {["Todos os papéis", ...roles.map(([role]) => role)].map((role) => <button type="button" key={role} onClick={() => { setRoleFilter(role); setOpenMenu(null); }}><span className={`radio ${roleFilter === role ? "selected" : ""}`} />{role}</button>)}
            <strong>STATUS DA CONTA</strong>
            {["Todos", "Somente ativas", "Somente inativas"].map((status) => <button type="button" key={status} onClick={() => { setStatusFilter(status); setOpenMenu(null); }}><span className={`radio ${statusFilter === status ? "selected" : ""}`} />{status}</button>)}
          </div>}
        </div>
        <div className="access-menu-anchor">
          <button type="button" className="button ghost" aria-expanded={openMenu === "view"} onClick={() => setOpenMenu(openMenu === "view" ? null : "view")}><GearSix />Gerenciar visão</button>
          {openMenu === "view" && <div className="access-popover access-view-popover"><strong>DENSIDADE</strong><button type="button" onClick={() => { setDensity("comfortable"); setOpenMenu(null); }}><span className={`radio ${density === "comfortable" ? "selected" : ""}`} />Confortável</button><button type="button" onClick={() => { setDensity("compact"); setOpenMenu(null); }}><span className={`radio ${density === "compact" ? "selected" : ""}`} />Compacta</button></div>}
        </div>
        <span className="access-results" role="status">Exibindo <strong>{visibleAccounts.length}</strong> {visibleAccounts.length === 1 ? "registro" : "registros"}</span>
      </div>

      {(roleFilter !== "Todos os papéis" || statusFilter !== "Todos") && <div className="access-applied-filters">
        {roleFilter !== "Todos os papéis" && <span>Papel: {roleFilter}<button type="button" aria-label="Remover filtro de papel" onClick={() => setRoleFilter("Todos os papéis")}><X /></button></span>}
        {statusFilter !== "Todos" && <span>Status: {statusFilter}<button type="button" aria-label="Remover filtro de status" onClick={() => setStatusFilter("Todos")}><X /></button></span>}
        <button type="button" onClick={clearFilters}>Limpar filtros</button>
      </div>}

      <div className="access-list" role="table" aria-label="Contas e grupos">
        <div className="access-row access-list-head" role="row">
          <button type="button" role="columnheader" onClick={() => setAscending((value) => !value)}>Conta <SortAscending className={ascending ? "" : "descending"} /></button>
          <span role="columnheader">Grupos</span>
          <span role="columnheader"><button type="button" onClick={() => { setSortBy("role"); setAscending((value) => !value); }}>Papel de acesso <SortAscending className={ascending ? "" : "descending"} /></button><button type="button" className="access-info-button" aria-label="O que cada papel permite" title="O que cada papel permite" aria-expanded={roleHelpOpen} onClick={() => setRoleHelpOpen((value) => !value)}><Info /></button></span>
        </div>
        {visibleAccounts.map((account) => <div className={`access-row ${account.inactive ? "inactive" : ""}`} role="row" key={account.id}>
          <div className="access-account-cell" role="cell"><span className="access-initials">{account.initials}</span><span><strong>{account.name}{account.inactive && <em>Inativa</em>}</strong><small>{account.detail}</small></span></div>
          <div role="cell">{account.type === "group" ? <button type="button" className="access-members" onClick={() => setGroupDrawer(account)}><UsersThree />{account.members} membros</button> : <span className="access-group-label"><UsersThree />Grupo: {account.group}</span>}</div>
          <div className="access-role-cell" role="cell">
            {account.type === "group" ? <button type="button" className="access-role-button" aria-label={`Papel de ${account.name}: ${account.role}. Alterar papel`} title={`${account.role}: ${roles.find(([role]) => role === account.role)?.[1]}. Clique para alterar.`} aria-expanded={openMenu === account.id} onClick={() => setOpenMenu(openMenu === account.id ? null : account.id)}>{account.role}<CaretDown /></button> : <span className="access-role-inherited" title={`Herdado do grupo ${account.group}. Papel individual por membro ainda não está definido.`}>{account.role}<Info /></span>}
            {openMenu === account.id && <div className="access-popover access-role-popover">
              {roles.map(([role, description]) => <button type="button" key={role} onClick={() => chooseRole(account.id, role)}><span><strong>{role}</strong><small>{description}</small></span>{account.role === role && <Check />}</button>)}
            </div>}
            {account.inactive && <button type="button" className="access-revoke" onClick={() => setRevokeTarget(account)}><UserMinus />Revogar acesso</button>}
          </div>
        </div>)}
        {visibleAccounts.length === 0 && <div className="access-empty"><MagnifyingGlass /><strong>Nenhuma conta encontrada</strong><span>Revise a busca ou limpe os filtros.</span><button type="button" className="button ghost" onClick={() => { setQuery(""); clearFilters(); }}>Limpar busca e filtros</button></div>}
      </div>

      <footer className="access-footer"><nav aria-label="Paginação"><button type="button" aria-label="Página anterior" disabled><CaretLeft /></button><button type="button" className="current" aria-current="page">1</button><button type="button" aria-label="Próxima página" disabled><CaretRight /></button></nav><label>Mostrar:<select defaultValue="10"><option value="10">10 linhas</option><option value="20">20 linhas</option><option value="50">50 linhas</option></select></label></footer>
    </section>

    <button type="button" className="access-ai" title="Assistente IA" aria-label="Assistente IA" onClick={() => onToast?.("Assistente IA aberto para apoiar o controle de acessos.")}><Robot />IA</button>

    {roleHelpOpen && <div className="access-overlay access-help-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRoleHelpOpen(false); }}><aside className="access-help-panel" role="dialog" aria-modal="true" aria-labelledby="access-help-title"><header><div><small>CONTROLE DE ACESSO</small><h2 id="access-help-title">O que cada papel permite</h2></div><button type="button" className="access-icon-button" aria-label="Fechar" onClick={() => setRoleHelpOpen(false)}><X /></button></header>{roles.map(([role, description]) => <article key={role}><strong>{role}</strong><p>{description}</p></article>)}</aside></div>}

    {groupDrawer && <div className="access-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setGroupDrawer(null); }}><aside className="access-drawer" role="dialog" aria-modal="true" aria-labelledby="group-drawer-title"><header><div><small>MEMBROS DO GRUPO</small><h2 id="group-drawer-title">{groupDrawer.name}</h2></div><button type="button" className="access-icon-button" aria-label="Fechar" onClick={() => setGroupDrawer(null)}><X /></button></header><div className="access-drawer-summary"><ShieldCheck /><span><strong>{groupDrawer.role}</strong><small>{groupDrawer.members} membros</small></span></div><div className="access-member-list">{(groupMembers[groupDrawer.id] || []).map(([initials, name, login, role]) => <article key={login}><span className="access-initials">{initials}</span><span><strong>{name}</strong><small>{login}</small></span><em>{role}</em></article>)}</div><p>Membros herdam o papel do grupo, exceto quando marcados como Exceção.</p></aside></div>}

    {revokeTarget && <div className="access-overlay access-modal-overlay" role="presentation"><section className="access-modal" role="dialog" aria-modal="true" aria-labelledby="revoke-title"><header><Warning weight="fill" /><div><h2 id="revoke-title">Revogar acesso</h2><p>Revogar o acesso desta conta inativa?</p></div><button type="button" className="access-icon-button" aria-label="Fechar" onClick={() => setRevokeTarget(null)}><X /></button></header><div><strong>{revokeTarget.name} ({revokeTarget.detail})</strong><span>Conta inativa · Papel atual: {revokeTarget.role}</span><p>A conta deixa de acessar o Conciliador Contábil. A alteração fica registrada em Logs de Auditoria.</p></div><footer><button type="button" className="button ghost" onClick={() => setRevokeTarget(null)}>Cancelar</button><button type="button" className="button danger" onClick={revokeAccess}>Sim, revogar</button></footer></section></div>}

    {roleChangeTarget && <div className="access-overlay access-modal-overlay" role="presentation"><section className="access-modal" role="dialog" aria-modal="true" aria-labelledby="role-change-title"><header><Warning weight="fill" /><div><h2 id="role-change-title">Confirmar elevação de privilégio</h2><p>Este grupo receberá Controle Administrativo.</p></div><button type="button" className="access-icon-button" aria-label="Fechar" onClick={() => setRoleChangeTarget(null)}><X /></button></header><div><strong>{roleChangeTarget.name}: {roleChangeTarget.members} membros afetados</strong><span>O novo papel permite gerenciar cadastros de conciliação e papéis de acesso.</span><p>A alteração será registrada nos Logs de Auditoria e valerá para todos os membros deste grupo.</p></div><footer><button type="button" className="button ghost" onClick={() => setRoleChangeTarget(null)}>Cancelar</button><button type="button" className="button primary" onClick={() => applyRoleChange(roleChangeTarget, roleChangeTarget.nextRole)}>Confirmar alteração</button></footer></section></div>}
  </main>;
}
