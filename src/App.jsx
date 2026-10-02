import { useEffect, useState } from "react";
import {
  Bell, CaretDown, CaretRight, ChartBar, Check, CheckCircle,
  ClockCounterClockwise, DotsThreeVertical, DownloadSimple, ArrowSquareOut,
  DotsNine, House, List, MapPin, MapTrifold, Paperclip, SidebarSimple,
  Sparkle, WarningCircle, X,
} from "@phosphor-icons/react";
import AccountDrilldown from "./AccountDrilldown";

const navItems = [
  { label: "Home", icon: House },
  { label: "Comparação Detalhada", icon: ChartBar, active: true },
  { label: "Logs de Auditoria", icon: ClockCounterClockwise },
  { label: "Cadastros", icon: List },
  { label: "Mapa do Projeto", icon: MapTrifold },
];

function IconButton({ label, children, className = "", type = "button", ...props }) {
  return <button type={type} className={`icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>;
}

function AppShell({ children, currentNav, onNavigate, detailTabOpen }) {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [contextExpanded, setContextExpanded] = useState(false);
  const [company, setCompany] = useState("02 - Bourbon Curitiba Convention Hotel");
  const [companyDraft, setCompanyDraft] = useState(company);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerMenu, setHeaderMenu] = useState(null);
  const [environment, setEnvironment] = useState("Produção");
  const chooseEnvironment = (value) => {
    setEnvironment(value);
    setHeaderMenu(null);
    window.dispatchEvent(new CustomEvent("smartx-toast", { detail: `Ambiente alterado para ${value}.` }));
  };
  const navigate = (label) => { onNavigate(label); setMobileMenuOpen(false); };
  const tabs = ["TOTVS News", "Meu TOTVS", "Conciliações", ...(detailTabOpen ? ["Comparação Detalhada"] : [])];
  const toggleContext = () => {
    setCompanyDraft(company);
    setContextExpanded((value) => !value);
  };
  const applyContext = () => {
    setCompany(companyDraft);
    setContextExpanded(false);
    window.dispatchEvent(new CustomEvent("smartx-toast", { detail: "Empresa atualizada com sucesso." }));
  };
  return <div className={`app-shell ${menuExpanded ? "menu-expanded" : ""} ${contextExpanded ? "context-expanded" : ""}`}>
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    <header className="global-header">
      <IconButton className="mobile-menu-trigger" label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMobileMenuOpen((value) => !value)}>{mobileMenuOpen ? <X size={22} /> : <List size={22} />}</IconButton>
      <img src={`${import.meta.env.BASE_URL}assets/logo-totvs-dark.svg`} alt="TOTVS" />
      <div className="header-menu-anchor"><button type="button" className="environment" aria-label="Trocar ambiente" aria-expanded={headerMenu === "environment"} onClick={() => setHeaderMenu(headerMenu === "environment" ? null : "environment")}><span>{environment}</span><strong>Conciliador Contábil</strong><CaretDown size={16} /></button>{headerMenu === "environment" && <div className="header-popover environment-popover" role="menu"><strong>Ambiente</strong>{["Produção", "Homologação"].map((value) => <button type="button" role="menuitemradio" aria-checked={environment === value} key={value} onClick={() => chooseEnvironment(value)}>{environment === value && <Check weight="bold" />}{value}</button>)}</div>}</div>
      <div className="header-actions"><IconButton label="Aplicativos" onClick={() => navigate("Home")}><DotsNine size={22} /></IconButton><div className="header-menu-anchor"><IconButton label="Notificações" aria-expanded={headerMenu === "notifications"} onClick={() => setHeaderMenu(headerMenu === "notifications" ? null : "notifications")}><Bell size={22} /></IconButton>{headerMenu === "notifications" && <div className="header-popover notification-popover" role="dialog" aria-label="Notificações"><strong>Notificações</strong><p><span className="notification-dot" />A análise inteligente encontrou 3 sugestões.</p><button type="button" onClick={() => { setHeaderMenu(null); navigate("Comparação Detalhada"); }}>Ver comparação</button></div>}</div><IconButton className="lynn-action" label="Lynn, assistente TOTVS" onClick={() => window.dispatchEvent(new CustomEvent("smartx-toast", { detail: "Lynn está pronta para ajudar nesta rotina." }))}><Sparkle size={22} /></IconButton><div className="header-menu-anchor"><button type="button" className="avatar" aria-label="Perfil: Rafael R. Oliveira" aria-expanded={headerMenu === "profile"} onClick={() => setHeaderMenu(headerMenu === "profile" ? null : "profile")}>RO</button>{headerMenu === "profile" && <div className="header-popover profile-popover" role="menu"><strong>Rafael R. Oliveira</strong><span>Administrador</span><button type="button" role="menuitem" onClick={() => { setHeaderMenu(null); window.dispatchEvent(new CustomEvent("smartx-toast", { detail: "Preferências do perfil abertas." })); }}>Preferências</button></div>}</div></div>
    </header>
    <nav className="product-tabs" aria-label="Abas abertas">{tabs.map((tab) => {
      const destination = tab === "Conciliações" ? "Home" : tab;
      const active = currentNav === destination;
      return <button type="button" key={tab} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => tab === "TOTVS News" || tab === "Meu TOTVS" ? window.dispatchEvent(new CustomEvent("smartx-toast", { detail: `${tab} selecionada.` })) : navigate(destination)}>{tab}{tab === "Comparação Detalhada" && <X size={16} aria-hidden="true" />}</button>;
    })}</nav>
    <div className={`context-bar ${contextExpanded ? "expanded" : ""}`}>
      <div className="context-bar-row">
        <button type="button" className="context-options" aria-expanded={contextExpanded} aria-controls="context-options-panel" onClick={toggleContext}>{contextExpanded ? "Ocultar opções" : "Exibir opções"} <CaretDown className={contextExpanded ? "rotate" : ""} size={18} /></button>
        {!contextExpanded && <span className="context-company"><MapPin size={22} /><span>Empresa: <strong>{company}</strong></span></span>}
        <button type="button" className="context-shortcuts" onClick={() => window.dispatchEvent(new CustomEvent("smartx-toast", { detail: "Atalhos da rotina abertos." }))}>Atalhos <ArrowSquareOut size={20} /></button>
      </div>
      {contextExpanded && <div className="context-options-panel" id="context-options-panel">
        <div className="context-options-content">
          <label>Empresa
            <select value={companyDraft} onChange={(event) => setCompanyDraft(event.target.value)}>
              <option>02 - Bourbon Curitiba Convention Hotel</option>
              <option>01 - Matriz Curitiba</option>
              <option>03 - Bourbon Cataratas do Iguaçu</option>
            </select>
          </label>
        </div>
        <footer><button type="button" className="button ghost" onClick={() => { setCompanyDraft(company); setContextExpanded(false); }}>Cancelar</button><button type="button" className="button primary" onClick={applyContext}>Aplicar</button></footer>
      </div>}
    </div>
    {mobileMenuOpen && <button type="button" className="mobile-menu-scrim" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)} />}
    <aside className={`journey-menu ${mobileMenuOpen ? "mobile-open" : ""}`} aria-label="Menu da jornada">
      <div className="mobile-menu-header"><strong>Conciliador Contábil</strong><span>{environment}</span></div>
      <IconButton label={menuExpanded ? "Recolher menu" : "Expandir menu"} onClick={() => setMenuExpanded((value) => !value)}><SidebarSimple size={22} /></IconButton>
      <nav>{navItems.map(({ label }) => <button type="button" key={label} className={currentNav === label ? "active" : ""} title={label} aria-current={currentNav === label ? "page" : undefined} onClick={() => navigate(label)}><span>{label}</span></button>)}</nav>
      <button type="button" className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}><X />Fechar menu</button>
    </aside>
    {children}
  </div>;
}

export function App() {
  const [currentNav, setCurrentNav] = useState("Home");
  const [detailTabOpen, setDetailTabOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(DEFAULT_ACCOUNT);
  const [toast, setToast] = useState("");

  useEffect(() => { const listener = (event) => setToast(event.detail); window.addEventListener("smartx-toast", listener); return () => window.removeEventListener("smartx-toast", listener); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 3600); return () => clearTimeout(timer); }, [toast]);

  const navigateTo = (destination) => {
    if (destination === "Comparação Detalhada") {
      setDetailTabOpen(true);
      setSelectedAccount((account) => account || DEFAULT_ACCOUNT);
    }
    setCurrentNav(destination);
  };
  const openAccountComparison = (account) => {
    setSelectedAccount(account || DEFAULT_ACCOUNT);
    setDetailTabOpen(true);
    setCurrentNav("Comparação Detalhada");
  };

  return <AppShell currentNav={currentNav} onNavigate={navigateTo} detailTabOpen={detailTabOpen}>
    {currentNav === "Home" ? <HomeDashboard onOpenComparison={openAccountComparison} onToast={setToast} /> : currentNav !== "Comparação Detalhada" ? <ModulePage name={currentNav} onBack={() => navigateTo("Home")} /> : <AccountDrilldown account={selectedAccount} onBack={() => navigateTo("Home")} onToast={setToast} />}
    {toast && <div className="toast" role="status"><CheckCircle weight="fill" /><span>{toast}</span><IconButton label="Fechar notificação" onClick={() => setToast("")}><X /></IconButton></div>}
  </AppShell>;
}

const homeAccounts = {
  cash: { code: "1.1.1.001", routeId: "1110001", name: "Caixa Geral", balance: "R$ 25.000,00", systemValue: "R$ 25.000,00", difference: "R$ 0,00", status: "Conciliado", tone: "positive", updated: "21/08/2024 10:30", attachments: [{ name: "extrato_bancario_agosto.pdf", size: "1,95 MB", date: "21/08/2024", author: "João Silva" }] },
  bank: { code: "1.1.2.001", routeId: "1120001", name: "Banco Conta Movimento", balance: "R$ 850.000,00", systemValue: "R$ 849.200,00", difference: "R$ 800,00", status: "Divergente", tone: "negative", updated: "21/08/2024 10:28", attachments: [] },
  receivable: { code: "1.1.3.001", routeId: "1130001", name: "Contas a Receber - Clientes", balance: "R$ 375.000,00", systemValue: "R$ 374.300,00", difference: "R$ 700,00", status: "Divergente", tone: "negative", updated: "21/08/2024 10:25", attachments: [] },
};
const DEFAULT_ACCOUNT = homeAccounts.bank;
const matched = (code, name, value) => ({ code, name, balance: value, systemValue: value, difference: "R$ 0,00", status: "Conciliado", tone: "positive", updated: "21/08/2024 10:20", attachments: [] });
const divergent = (code, name, balance, systemValue, difference) => ({ code, name, balance, systemValue, difference, status: "Divergente", tone: "negative", updated: "21/08/2024 10:20", attachments: [] });

const patrimonialGroups = [
  { id: "current-assets", code: "1.1", title: "Ativo Circulante", status: "Divergência: R$ 1.500,00", tone: "negative", balance: "R$ 1.250.000,00", systemValue: "R$ 1.248.500,00", difference: "R$ 1.500,00", accounts: [homeAccounts.cash, homeAccounts.bank, homeAccounts.receivable] },
  { id: "noncurrent-assets", code: "1.2", title: "Ativo Não Circulante", status: "Conciliado", tone: "positive", balance: "R$ 2.850.000,00", systemValue: "R$ 2.850.000,00", difference: "R$ 0,00", accounts: [matched("1.2.1.001", "Imobilizado", "R$ 2.100.000,00"), matched("1.2.2.001", "Investimentos", "R$ 500.000,00"), matched("1.2.3.001", "Intangível", "R$ 250.000,00")] },
  { id: "current-liabilities", code: "2.1", title: "Passivo Circulante", status: "Divergência: R$ 2.300,00", tone: "negative", balance: "R$ 680.000,00", systemValue: "R$ 682.300,00", difference: "R$ 2.300,00", accounts: [divergent("2.1.1.001", "Fornecedores", "R$ 320.000,00", "R$ 321.500,00", "R$ 1.500,00"), divergent("2.1.2.001", "Obrigações Trabalhistas", "R$ 210.000,00", "R$ 210.800,00", "R$ 800,00"), matched("2.1.3.001", "Impostos a Recolher", "R$ 150.000,00")] },
  { id: "noncurrent-liabilities", code: "2.2", title: "Passivo Não Circulante", status: "Conciliado", tone: "positive", balance: "R$ 1.200.000,00", systemValue: "R$ 1.200.000,00", difference: "R$ 0,00", accounts: [matched("2.2.1.001", "Empréstimos e Financiamentos", "R$ 900.000,00"), matched("2.2.2.001", "Provisões de Longo Prazo", "R$ 300.000,00")] },
];

const systemGroups = [
  { id: "cap", code: "CAP", title: "Contas a Pagar", status: "Divergência: R$ 1.500,00", tone: "negative", balance: "R$ 500.000,00", systemValue: "R$ 501.500,00", difference: "-R$ 1.500,00", attachments: 2, accounts: patrimonialGroups[2].accounts },
  { id: "car", code: "CAR", title: "Contas a Receber", status: "Divergência: R$ 700,00", tone: "negative", balance: "R$ 375.000,00", systemValue: "R$ 374.300,00", difference: "R$ 700,00", accounts: [homeAccounts.receivable, matched("1.1.3.002", "Cartões a Receber", "R$ 210.000,00"), matched("1.1.3.003", "Adiantamentos", "R$ 95.000,00")] },
  { id: "alm", code: "ALM", title: "Almoxarifado", status: "Divergência: R$ 800,00", tone: "negative", balance: "R$ 180.000,00", systemValue: "R$ 179.200,00", difference: "R$ 800,00", accounts: [divergent("1.1.4.001", "Estoque Operacional", "R$ 110.000,00", "R$ 109.200,00", "R$ 800,00"), matched("1.1.4.002", "Estoque de Alimentos", "R$ 45.000,00"), matched("1.1.4.003", "Estoque de Bebidas", "R$ 25.000,00")] },
  { id: "pms", code: "PMS", title: "Sistema de Gestão", status: "Conciliado", tone: "positive", balance: "R$ 2.850.000,00", systemValue: "R$ 2.850.000,00", difference: "R$ 0,00", accounts: patrimonialGroups[1].accounts },
  { id: "fin", code: "FIN", title: "Controle Financeiro", status: "Divergência: R$ 800,00", tone: "negative", balance: "R$ 875.000,00", systemValue: "R$ 874.200,00", difference: "R$ 800,00", accounts: [homeAccounts.cash, homeAccounts.bank] },
];

const dailyValues = [44, 52, 48, 66, 58, 73, 61, 82, 76, 88, 79, 94];

function HomeDashboard({ onOpenComparison, onToast }) {
  const [view, setView] = useState("patrimonial");
  const [expandedGroups, setExpandedGroups] = useState(new Set(["current-assets"]));
  const [accountMenu, setAccountMenu] = useState(null);
  const groups = view === "patrimonial" ? patrimonialGroups : systemGroups;
  const summary = view === "patrimonial" ? { groups: "4 Grupos Patrimoniais", aligned: "2 Itens Alinhados", divergences: "2 Divergências Ativas" } : { groups: "5 Sistemas Monitorados", aligned: "1 Item Alinhado", divergences: "4 Divergências Ativas" };
  const toggleGroup = (id) => setExpandedGroups((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const chooseView = (nextView) => { setView(nextView); setExpandedGroups(new Set([nextView === "patrimonial" ? "current-assets" : "cap"])); setAccountMenu(null); };
  const action = (message) => { setAccountMenu(null); onToast?.(message); };

  useEffect(() => {
    if (!accountMenu) return undefined;
    const close = (event) => { if (!event.target.closest(".home-account-actions")) setAccountMenu(null); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [accountMenu]);

  return <main id="main-content" className="main-content home-dashboard">
    <nav className="breadcrumb" aria-label="Você está em"><span>Home</span></nav>
    <section className="home-heading">
      <div><span className="home-eyebrow">Conciliação contábil</span><h1>Dashboard de Conciliação</h1><p>{view === "patrimonial" ? "Auditoria patrimonial - Ativo e Passivo" : "Acompanhamento das conciliações por sistema de origem"}</p></div>
      <div className="home-view-controls" role="group" aria-label="Modo de visualização"><button type="button" className={view === "patrimonial" ? "active" : ""} onClick={() => chooseView("patrimonial")}>Visão Patrimonial</button><button type="button" className={view === "system" ? "active" : ""} onClick={() => chooseView("system")}>Por Sistema</button><span><WarningCircle weight="fill" />{view === "patrimonial" ? 2 : 4} Divergências</span></div>
    </section>
    <section className="home-groups" aria-label={view === "patrimonial" ? "Grupos patrimoniais" : "Sistemas monitorados"}>
      <header><div><h2>{view === "patrimonial" ? "Grupos Patrimoniais" : "Sistemas de Origem"}</h2><p>Expanda um grupo para consultar suas contas e ações.</p></div><span>{groups.length} grupos</span></header>
      {groups.map((group) => {
        const expanded = expandedGroups.has(group.id);
        return <article className={`home-group ${expanded ? "expanded" : ""}`} key={group.id}>
          <button type="button" className="home-group-toggle" aria-expanded={expanded} aria-controls={`accounts-${group.id}`} onClick={() => toggleGroup(group.id)}>
            <span className="home-group-title"><small>{group.code}</small><strong>{group.title}</strong><em className={`home-state ${group.tone}`}>{group.status}</em></span>
            <span className="home-group-metric"><small>Saldo Contábil</small><strong>{group.balance}</strong></span>
            <span className="home-group-metric"><small>Valor Sistema</small><strong>{group.systemValue}</strong></span>
            <span className="home-group-difference"><small>Diferença</small><strong className={group.tone === "negative" ? "negative" : ""}>{group.difference}</strong></span>
            <span className="home-group-meta">{group.attachments ? <><Paperclip />{group.attachments}</> : null}<b>{group.accounts.length} contas</b></span>
            <CaretDown className={expanded ? "rotate" : ""} />
          </button>
          {expanded && <div className="home-account-grid" id={`accounts-${group.id}`}>
            {group.accounts.map((account) => {
              const menuId = `${group.id}-${account.code}`;
              return <article className="home-account-card" key={account.code}>
                <header><span><small>{account.code}</small><strong>{account.name}</strong></span><div className="home-account-actions"><IconButton label={`Ações de ${account.name}`} aria-expanded={accountMenu === menuId} onClick={() => setAccountMenu(accountMenu === menuId ? null : menuId)}><DotsThreeVertical weight="bold" /></IconButton>{accountMenu === menuId && <div className="home-account-menu" role="menu"><button type="button" role="menuitem" onClick={() => { setAccountMenu(null); onOpenComparison(account); }}><ChartBar />Comparação detalhada</button><button type="button" role="menuitem" onClick={() => action(`Seleção de documento aberta para ${account.name}.`)}><Paperclip />Anexar documento</button><button type="button" role="menuitem" onClick={() => action(`Relatório de auditoria de ${account.name} exportado.`)}><DownloadSimple />Exportar para auditoria</button><button type="button" role="menuitem" onClick={() => action(`Análise de ${account.name} aprovada.`)}><CheckCircle />Aprovar análise</button></div>}</div></header>
                <dl><div><dt>Contábil</dt><dd>{account.balance}</dd></div><div><dt>Sistema</dt><dd>{account.systemValue}</dd></div><div><dt>Diferença</dt><dd className={account.tone === "negative" ? "negative" : ""}>{account.difference}</dd></div></dl>
                <footer><span className={`home-state ${account.tone}`}>{account.tone === "positive" ? <CheckCircle weight="fill" /> : <WarningCircle weight="fill" />}{account.status}</span><small>{account.attachments?.length ? <><Paperclip /> {account.attachments.length} documento</> : "Sem anexos"} · {account.updated}</small></footer>
              </article>;
            })}
          </div>}
        </article>;
      })}
    </section>
    <section className="daily-overview" aria-labelledby="daily-overview-title"><header><div><h2 id="daily-overview-title">Visão Geral Diária</h2><p>Comparativo dos valores totais diários entre sistemas de origem e contabilidade</p></div><div><select aria-label="Filtrar sistema"><option>Todos os Sistemas</option><option>CAP</option><option>CAR</option><option>ALM</option><option>PMS</option><option>FIN</option></select><select aria-label="Filtrar status"><option>Todos</option><option>Conciliados</option><option>Divergentes</option></select></div></header><div className="daily-chart"><div className="daily-chart-title"><strong>Valores Diários - Dezembro 2024</strong><span><i className="origin" />Sistema de Origem <i className="accounting" />Contabilidade <i className="divergence" />Divergência</span></div><div className="daily-bars" aria-label="Gráfico demonstrativo de valores diários">{dailyValues.map((value, index) => <span key={index}><i className="origin" style={{ height: `${value}%` }} /><i className="accounting" style={{ height: `${Math.max(20, value - (index % 4 === 0 ? 9 : 2))}%` }} /><small>{String(index + 1).padStart(2, "0")}/12</small></span>)}</div></div></section>
    <section className="home-summary" aria-label="Resumo da conciliação"><span><strong>{summary.groups.split(" ")[0]}</strong>{summary.groups.substring(summary.groups.indexOf(" ") + 1)}</span><span><strong>{summary.aligned.split(" ")[0]}</strong>{summary.aligned.substring(summary.aligned.indexOf(" ") + 1)}</span><span><strong>{summary.divergences.split(" ")[0]}</strong>{summary.divergences.substring(summary.divergences.indexOf(" ") + 1)}</span><span><strong>R$ 3.800,00</strong>Total de Divergências</span></section>
  </main>;
}

function ModulePage({ name, onBack }) {
  const item = navItems.find((entry) => entry.label === name) || navItems[0];
  const Icon = item.icon;
  const descriptions = { Home: "Visão geral das conciliações e pendências do projeto.", "Logs de Auditoria": "Histórico rastreável das ações realizadas na conciliação.", Cadastros: "Contas, regras e fontes de dados usadas pelo conciliador.", "Mapa do Projeto": "Estrutura das etapas e integrações do projeto." };
  return <main id="main-content" className="main-content module-page"><nav className="breadcrumb"><button type="button" onClick={onBack}>Comparação Detalhada</button><CaretRight /><span>{name}</span></nav><section className="module-hero"><Icon size={34} weight="duotone" /><div><h1>{name}</h1><p>{descriptions[name]}</p></div></section><section className="module-placeholder"><strong>Módulo acessível</strong><p>Este destino está conectado ao menu do protótipo. Volte para a comparação detalhada para continuar o fluxo principal.</p><button type="button" className="button primary" onClick={onBack}>Voltar para comparação</button></section></main>;
}
