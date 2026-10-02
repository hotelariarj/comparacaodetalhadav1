import { useEffect, useRef, useState } from "react";
import {
  Bell, CaretDown, CaretRight, ChartBar, Check, CheckCircle,
  ClockCounterClockwise, DotsThreeVertical, DownloadSimple, FileArrowUp, ArrowSquareOut,
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

const routeByNav = {
  Home: "home",
  "Comparação Detalhada": "comparacao",
  "Logs de Auditoria": "logs",
  Cadastros: "cadastros",
  "Mapa do Projeto": "mapa",
};

const readHomeSession = (key, fallback) => {
  try {
    const saved = window.sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

function routeFromLocation() {
  const [route = "home", accountCode = "", workspace = "comparison"] = window.location.hash.replace(/^#\/?/, "").split("/");
  const currentNav = Object.entries(routeByNav).find(([, value]) => value === route)?.[0] || "Home";
  return { currentNav, accountCode: decodeURIComponent(accountCode), workspace };
}

function writeRoute(destination, account, workspace = "comparison", replace = false) {
  const route = routeByNav[destination] || "home";
  const hash = destination === "Comparação Detalhada" && account?.code
    ? `#/${route}/${encodeURIComponent(account.code)}/${workspace}`
    : `#/${route}`;
  window.history[replace ? "replaceState" : "pushState"]({}, "", hash);
}

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
  useEffect(() => {
    if (!headerMenu) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setHeaderMenu(null); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [headerMenu]);
  const chooseEnvironment = (value) => {
    setEnvironment(value);
    setHeaderMenu(null);
    window.dispatchEvent(new CustomEvent("smartx-toast", { detail: `Ambiente alterado para ${value}.` }));
  };
  const navigate = (label, options) => { onNavigate(label, options); setMobileMenuOpen(false); };
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
      <div className="header-menu-anchor"><button type="button" className="environment" aria-label="Trocar ambiente" aria-haspopup="menu" aria-expanded={headerMenu === "environment"} onClick={() => setHeaderMenu(headerMenu === "environment" ? null : "environment")}><span>{environment}</span><strong>Conciliador Contábil</strong><CaretDown size={16} /></button>{headerMenu === "environment" && <div className="header-popover environment-popover" role="menu"><strong>Ambiente</strong>{["Produção", "Homologação"].map((value) => <button type="button" role="menuitemradio" aria-checked={environment === value} key={value} onClick={() => chooseEnvironment(value)}>{environment === value && <Check weight="bold" />}{value}</button>)}</div>}</div>
      <div className="header-actions"><IconButton label="Aplicativos" onClick={() => navigate("Home")}><DotsNine size={22} /></IconButton><div className="header-menu-anchor"><IconButton label="Notificações" aria-haspopup="dialog" aria-expanded={headerMenu === "notifications"} onClick={() => setHeaderMenu(headerMenu === "notifications" ? null : "notifications")}><Bell size={22} /></IconButton>{headerMenu === "notifications" && <div className="header-popover notification-popover" role="dialog" aria-label="Notificações"><strong>Notificações</strong><p><span className="notification-dot" />A análise inteligente encontrou 5 sugestões.</p><button type="button" onClick={() => { setHeaderMenu(null); navigate("Comparação Detalhada", { workspace: "suggestions", account: DEFAULT_ACCOUNT }); }}>Ver sugestões</button></div>}</div><IconButton className="lynn-action" label="Lynn, assistente TOTVS" onClick={() => window.dispatchEvent(new CustomEvent("smartx-toast", { detail: "Lynn está pronta para ajudar nesta rotina." }))}><Sparkle size={22} /></IconButton><div className="header-menu-anchor"><button type="button" className="avatar" aria-label="Perfil: Rafael R. Oliveira" aria-haspopup="menu" aria-expanded={headerMenu === "profile"} onClick={() => setHeaderMenu(headerMenu === "profile" ? null : "profile")}>RO</button>{headerMenu === "profile" && <div className="header-popover profile-popover" role="menu"><strong>Rafael R. Oliveira</strong><span>Administrador</span><button type="button" role="menuitem" onClick={() => { setHeaderMenu(null); window.dispatchEvent(new CustomEvent("smartx-toast", { detail: "Preferências do perfil abertas." })); }}>Preferências</button></div>}</div></div>
    </header>
    <nav className="product-tabs" aria-label="Abas abertas">{tabs.map((tab) => {
      const destination = tab === "Conciliações" ? "Home" : tab;
      const active = currentNav === destination;
      if (tab === "Comparação Detalhada") return <span className={`product-tab-with-close ${active ? "active" : ""}`} key={tab}><button type="button" aria-current={active ? "page" : undefined} onClick={() => navigate(destination)}>{tab}</button><button type="button" className="product-tab-close" aria-label="Fechar Comparação Detalhada" onClick={() => onNavigate("close-detail")}><X size={16} /></button></span>;
      return <button type="button" key={tab} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => tab === "TOTVS News" || tab === "Meu TOTVS" ? window.dispatchEvent(new CustomEvent("smartx-toast", { detail: `${tab} selecionada.` })) : navigate(destination)}>{tab}</button>;
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
  const [currentNav, setCurrentNav] = useState(() => routeFromLocation().currentNav);
  const [detailTabOpen, setDetailTabOpen] = useState(() => routeFromLocation().currentNav === "Comparação Detalhada");
  const [selectedAccount, setSelectedAccount] = useState(() => findAccountByCode(routeFromLocation().accountCode) || DEFAULT_ACCOUNT);
  const [detailWorkspace, setDetailWorkspace] = useState(() => routeFromLocation().workspace || "comparison");
  const [homeView, setHomeView] = useState("patrimonial");
  const [homeExpandedGroups, setHomeExpandedGroups] = useState(new Set(["current-assets"]));
  const [homeApprovedAccounts, setHomeApprovedAccounts] = useState(() => new Set(readHomeSession("comparison-home-approved", [])));
  const [homeSessionAttachments, setHomeSessionAttachments] = useState(() => readHomeSession("comparison-home-attachments", {}));
  const [homeDailySystem, setHomeDailySystem] = useState("Todos os Sistemas");
  const [homeDailyStatus, setHomeDailyStatus] = useState("Todos");
  const [toast, setToast] = useState("");

  useEffect(() => { const listener = (event) => setToast(event.detail); window.addEventListener("smartx-toast", listener); return () => window.removeEventListener("smartx-toast", listener); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 3600); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { window.sessionStorage.setItem("comparison-home-approved", JSON.stringify([...homeApprovedAccounts])); }, [homeApprovedAccounts]);
  useEffect(() => { window.sessionStorage.setItem("comparison-home-attachments", JSON.stringify(homeSessionAttachments)); }, [homeSessionAttachments]);
  useEffect(() => {
    if (!window.location.hash) writeRoute("Home", null, "comparison", true);
    const restoreRoute = () => {
      const route = routeFromLocation();
      setCurrentNav(route.currentNav);
      setDetailTabOpen(route.currentNav === "Comparação Detalhada");
      setDetailWorkspace(route.workspace || "comparison");
      if (route.accountCode) setSelectedAccount(findAccountByCode(route.accountCode) || DEFAULT_ACCOUNT);
    };
    window.addEventListener("popstate", restoreRoute);
    return () => window.removeEventListener("popstate", restoreRoute);
  }, []);

  const navigateTo = (destination, options = {}) => {
    if (destination === "close-detail") {
      setDetailTabOpen(false);
      if (currentNav === "Comparação Detalhada") {
        setCurrentNav("Home");
        writeRoute("Home");
      }
      return;
    }
    if (destination === "Comparação Detalhada") {
      const targetAccount = options.account || selectedAccount || DEFAULT_ACCOUNT;
      setDetailTabOpen(true);
      setSelectedAccount(targetAccount);
      setDetailWorkspace(options.workspace || "comparison");
      setCurrentNav(destination);
      writeRoute(destination, targetAccount, options.workspace || "comparison");
      return;
    }
    setCurrentNav(destination);
    writeRoute(destination, selectedAccount || DEFAULT_ACCOUNT, options.workspace || "comparison");
  };
  const openAccountComparison = (account) => {
    setSelectedAccount(account || DEFAULT_ACCOUNT);
    setDetailWorkspace("comparison");
    setDetailTabOpen(true);
    setCurrentNav("Comparação Detalhada");
    writeRoute("Comparação Detalhada", account || DEFAULT_ACCOUNT);
  };

  return <AppShell currentNav={currentNav} onNavigate={navigateTo} detailTabOpen={detailTabOpen}>
    {currentNav === "Home" ? <HomeDashboard view={homeView} onViewChange={setHomeView} expandedGroups={homeExpandedGroups} onExpandedGroupsChange={setHomeExpandedGroups} approvedAccounts={homeApprovedAccounts} onApprovedAccountsChange={setHomeApprovedAccounts} sessionAttachments={homeSessionAttachments} onSessionAttachmentsChange={setHomeSessionAttachments} dailySystem={homeDailySystem} onDailySystemChange={setHomeDailySystem} dailyStatus={homeDailyStatus} onDailyStatusChange={setHomeDailyStatus} onOpenComparison={openAccountComparison} onToast={setToast} /> : currentNav !== "Comparação Detalhada" ? <ModulePage name={currentNav} onBack={() => navigateTo("Home")} /> : <AccountDrilldown account={selectedAccount} initialWorkspace={detailWorkspace} onBack={() => navigateTo("Home")} onToast={setToast} />}
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

function findAccountByCode(code) {
  if (!code) return null;
  const accounts = [...patrimonialGroups, ...systemGroups].flatMap((group) => group.accounts);
  return accounts.find((account) => account.code === code) || null;
}

const dailySeriesBySystem = {
  "Todos os Sistemas": { origin: [44, 52, 48, 66, 58, 73, 61, 82, 76, 88, 79, 94], accounting: [35, 50, 46, 57, 56, 71, 52, 80, 74, 79, 77, 92] },
  CAP: { origin: [34, 47, 43, 58, 50, 62, 55, 70, 67, 72, 69, 81], accounting: [34, 45, 43, 50, 50, 60, 55, 63, 67, 70, 62, 81] },
  CAR: { origin: [41, 44, 50, 55, 61, 68, 64, 74, 71, 83, 77, 89], accounting: [39, 44, 47, 55, 57, 68, 61, 74, 65, 83, 75, 89] },
  ALM: { origin: [28, 36, 31, 44, 40, 51, 47, 56, 52, 61, 58, 66], accounting: [28, 31, 31, 44, 35, 51, 47, 50, 52, 61, 53, 66] },
  PMS: { origin: [56, 61, 58, 72, 67, 79, 71, 86, 82, 91, 87, 96], accounting: [56, 61, 58, 72, 67, 79, 71, 86, 82, 91, 87, 96] },
  FIN: { origin: [38, 49, 45, 63, 55, 70, 58, 78, 72, 84, 75, 90], accounting: [31, 49, 42, 55, 55, 63, 58, 70, 72, 76, 75, 82] },
};

function HomeDashboard({ view, onViewChange, expandedGroups, onExpandedGroupsChange, approvedAccounts, onApprovedAccountsChange, sessionAttachments, onSessionAttachmentsChange, dailySystem, onDailySystemChange, dailyStatus, onDailyStatusChange, onOpenComparison, onToast }) {
  const [accountMenu, setAccountMenu] = useState(null);
  const [homeDialog, setHomeDialog] = useState(null);
  const groups = view === "patrimonial" ? patrimonialGroups : systemGroups;
  const summary = view === "patrimonial" ? { groups: "4 Grupos Patrimoniais", aligned: "2 Itens Alinhados", divergences: "2 Divergências Ativas" } : { groups: "5 Sistemas Monitorados", aligned: "1 Item Alinhado", divergences: "4 Divergências Ativas" };
  const activeDailySeries = dailySeriesBySystem[dailySystem];
  const dailyBars = activeDailySeries.origin.map((origin, index) => ({ index, origin, accounting: activeDailySeries.accounting[index], divergent: Math.abs(origin - activeDailySeries.accounting[index]) >= 5 })).filter((item) => dailyStatus === "Todos" || (dailyStatus === "Divergentes" ? item.divergent : !item.divergent));
  const toggleGroup = (id) => onExpandedGroupsChange((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const chooseView = (nextView) => { onViewChange(nextView); onExpandedGroupsChange(new Set([nextView === "patrimonial" ? "current-assets" : "cap"])); setAccountMenu(null); };
  const openHomeDialog = (type, target) => { setAccountMenu(null); setHomeDialog({ type, target }); };
  const decorateAccount = (account) => ({ ...account, attachments: [...(account.attachments || []), ...(sessionAttachments[account.code] || [])] });
  const attachDocument = (account, file, category) => {
    const attachment = { name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, date: new Date().toLocaleDateString("pt-BR"), author: "Rafael R. Oliveira", category };
    onSessionAttachmentsChange((current) => ({ ...current, [account.code]: [...(current[account.code] || []), attachment] }));
    setHomeDialog(null);
    onToast?.(`${file.name} anexado como ${category} em ${account.name}.`);
  };
  const approveAccount = (account) => {
    onApprovedAccountsChange((current) => new Set(current).add(account.code));
    setHomeDialog(null);
    onToast?.(`Análise de ${account.name} aprovada. As divergências permanecem visíveis.`);
  };
  const exportAuditCsv = (payload) => {
    const account = decorateAccount(payload.target);
    const rows = [
      ["Campo", "Valor"], ["Conta", account.code], ["Nome", account.name], ["Saldo contábil", account.balance], ["Valor sistema", account.systemValue], ["Diferença", account.difference], ["Status", account.status], ["Análise aprovada", approvedAccounts.has(account.code) ? "Sim" : "Não"], ["Período", `${payload.dateFrom} a ${payload.dateTo}`], ["Tipo", payload.reportTitle], ["Documentos", account.attachments.map((item) => `${item.name}${item.category ? ` (${item.category})` : ""}`).join(" | ") || "Nenhum"],
    ];
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = rows.map((row) => row.map(escape).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `auditoria-${account.code.replaceAll(".", "-")}.csv`;
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setHomeDialog(null);
    onToast?.(`Relatório de auditoria de ${account.name} exportado em CSV.`);
  };

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
              const attachments = [...(account.attachments || []), ...(sessionAttachments[account.code] || [])];
              const latestAttachment = sessionAttachments[account.code]?.at(-1);
              const approved = approvedAccounts.has(account.code);
              return <article className="home-account-card" key={account.code}>
                <header><span><small>{account.code}</small><strong>{account.name}</strong></span><div className="home-account-actions"><IconButton label={`Ações de ${account.name}`} aria-haspopup="menu" aria-expanded={accountMenu === menuId} onClick={() => setAccountMenu(accountMenu === menuId ? null : menuId)}><DotsThreeVertical weight="bold" /></IconButton>{accountMenu === menuId && <div className="home-account-menu" role="menu"><button type="button" role="menuitem" onClick={() => { setAccountMenu(null); onOpenComparison(decorateAccount(account)); }}><ChartBar />Comparação detalhada</button><button type="button" role="menuitem" onClick={() => openHomeDialog("attach", account)}><Paperclip />Anexar documento</button><button type="button" role="menuitem" onClick={() => openHomeDialog("export", account)}><DownloadSimple />Exportar para auditoria</button><button type="button" role="menuitem" onClick={() => openHomeDialog("approve", account)}><CheckCircle />{approved ? "Ver aprovação" : "Aprovar análise"}</button></div>}</div></header>
                <dl><div><dt>Contábil</dt><dd>{account.balance}</dd></div><div><dt>Sistema</dt><dd>{account.systemValue}</dd></div><div><dt>Diferença</dt><dd className={account.tone === "negative" ? "negative" : ""}>{account.difference}</dd></div></dl>
                {latestAttachment && <span className="home-latest-attachment" title={`${latestAttachment.name} · ${latestAttachment.category}`}><Paperclip />{latestAttachment.name}</span>}
                <footer><div className="home-card-states"><span className={`home-state ${account.tone}`}>{account.tone === "positive" ? <CheckCircle weight="fill" /> : <WarningCircle weight="fill" />}{account.status}</span>{approved && <span className="home-approval-indicator"><CheckCircle weight="fill" />Análise aprovada</span>}</div><small>{attachments.length ? <><Paperclip /> {attachments.length} {attachments.length === 1 ? "documento" : "documentos"}</> : "Sem anexos"} · {account.updated}</small></footer>
              </article>;
            })}
          </div>}
        </article>;
      })}
    </section>
    <section className="daily-overview" aria-labelledby="daily-overview-title"><header><div><h2 id="daily-overview-title">Visão Geral Diária</h2><p>Comparativo dos valores totais diários entre sistemas de origem e contabilidade</p></div><div><select aria-label="Filtrar sistema" value={dailySystem} onChange={(event) => onDailySystemChange(event.target.value)}>{Object.keys(dailySeriesBySystem).map((system) => <option key={system}>{system}</option>)}</select><select aria-label="Filtrar status" value={dailyStatus} onChange={(event) => onDailyStatusChange(event.target.value)}><option>Todos</option><option>Conciliados</option><option>Divergentes</option></select></div></header><div className="daily-chart"><div className="daily-chart-title"><strong>Valores Diários - Dezembro 2024 · {dailySystem === "Todos os Sistemas" ? "Consolidado" : dailySystem}</strong><span><i className="origin" />{dailySystem === "Todos os Sistemas" ? "Sistema de Origem" : `Sistema ${dailySystem}`} <i className="accounting" />Contabilidade {dailyStatus !== "Conciliados" && <><i className="divergence" />{dailyStatus === "Divergentes" ? "Dias divergentes" : "Divergência"}</>}</span></div><div className="daily-bars" role="img" aria-label={`Gráfico de ${dailyStatus.toLowerCase()} para ${dailySystem}`}>{dailyBars.map(({ index, origin, accounting, divergent }) => <span key={index} className={divergent ? "is-divergent" : "is-reconciled"}><i className="origin" style={{ height: `${origin}%` }} /><i className="accounting" style={{ height: `${accounting}%` }} />{divergent && dailyStatus !== "Conciliados" && <i className="divergence-marker" style={{ height: `${Math.max(5, Math.abs(origin - accounting))}%` }} />}<small>{String(index + 1).padStart(2, "0")}/12</small></span>)}</div><small className="daily-filter-result">{dailyBars.length} {dailyBars.length === 1 ? "dia exibido" : "dias exibidos"} · {dailyStatus}</small></div></section>
    <section className="home-summary" aria-label="Resumo da conciliação"><span><strong>{summary.groups.split(" ")[0]}</strong>{summary.groups.substring(summary.groups.indexOf(" ") + 1)}</span><span><strong>{summary.aligned.split(" ")[0]}</strong>{summary.aligned.substring(summary.aligned.indexOf(" ") + 1)}</span><span><strong>{summary.divergences.split(" ")[0]}</strong>{summary.divergences.substring(summary.divergences.indexOf(" ") + 1)}</span><span><strong>R$ 3.800,00</strong>Total de Divergências</span></section>
    {homeDialog?.type === "attach" && <AttachDocumentDialog account={homeDialog.target} onClose={() => setHomeDialog(null)} onComplete={(file, category) => attachDocument(homeDialog.target, file, category)} />}
    {homeDialog?.type === "export" && <AuditExportDialog target={homeDialog.target} scope="account" onClose={() => setHomeDialog(null)} onComplete={exportAuditCsv} />}
    {homeDialog?.type === "approve" && <ApproveAnalysisDialog account={homeDialog.target} approved={approvedAccounts.has(homeDialog.target.code)} onClose={() => setHomeDialog(null)} onConfirm={() => approveAccount(homeDialog.target)} />}
  </main>;
}

const documentCategories = ["Comprovante de Transação", "Nota Fiscal", "Recibo", "Contrato", "Extrato Bancário", "Outro Documento"];

function AttachDocumentDialog({ account, onClose, onComplete }) {
  const [category, setCategory] = useState(documentCategories[0]);
  const [file, setFile] = useState(null);
  const input = useRef(null);
  return <div className="overlay modal-overlay home-flow-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="home-flow-dialog" role="dialog" aria-modal="true" aria-labelledby="attach-dialog-title"><header><div><small>Anexar documentos</small><h2 id="attach-dialog-title">{account.name}</h2></div><IconButton label="Fechar" onClick={onClose}><X /></IconButton></header><div className="home-flow-body"><label className="home-flow-field">Categoria padrão<select value={category} onChange={(event) => setCategory(event.target.value)}>{documentCategories.map((item) => <option key={item}>{item}</option>)}</select></label><section className={`home-file-drop ${file ? "selected" : ""}`}><FileArrowUp size={36} /><strong>{file ? file.name : "Arraste arquivos aqui ou clique para selecionar"}</strong><span>{file ? `${Math.max(1, Math.round(file.size / 1024))} KB selecionado` : "Formatos aceitos: PDF, DOC, XLS, JPG, PNG, TXT"}</span><button type="button" className="button secondary" onClick={() => input.current?.click()}>{file ? "Trocar arquivo" : "Selecionar arquivos"}</button><input ref={input} className="visually-hidden" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" onChange={(event) => setFile(event.target.files?.[0] || null)} /></section></div><footer><button type="button" className="button secondary" onClick={onClose}>Cancelar</button><button type="button" className="button primary" disabled={!file} onClick={() => onComplete(file, category)}><Paperclip />Anexar documento</button></footer></section></div>;
}

const reportTypes = [
  { id: "complete", title: "Relatório completo da conta", description: "Dados completos incluindo transações, reconciliações e análises", formats: "CSV", size: "Até 500 KB" },
  { id: "transactions", title: "Apenas transações", description: "Lista detalhada de todas as transações", formats: "CSV", size: "Até 250 KB" },
  { id: "reconciliation", title: "Dados de reconciliação", description: "Comparação entre dados contábeis e do sistema", formats: "CSV", size: "Até 250 KB" },
];

function AuditExportDialog({ target, scope, onClose, onComplete }) {
  const [step, setStep] = useState("type");
  const [reportType, setReportType] = useState("complete");
  const [dateFrom, setDateFrom] = useState("2026-09-02");
  const [dateTo, setDateTo] = useState("2026-10-02");
  const [included, setIncluded] = useState({ documents: true, analyses: true, divergences: true, audit: false });
  const selectedReport = reportTypes.find((item) => item.id === reportType);
  const toggleIncluded = (key) => setIncluded((current) => ({ ...current, [key]: !current[key] }));
  const title = scope === "group" ? `Grupo ${target.title}` : `${target.name} · ${target.code}`;
  const includedLabels = [["documents", "Documentos anexados"], ["analyses", "Análises e comentários"], ["divergences", "Apenas divergências"], ["audit", "Trilha de auditoria"]];
  return <div className="overlay modal-overlay home-flow-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="home-flow-dialog home-export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-dialog-title"><header><div><small>Exportar para auditoria</small><h2 id="export-dialog-title">{title}</h2></div><IconButton label="Fechar" onClick={onClose}><X /></IconButton></header><nav className="home-flow-tabs" aria-label="Etapas da exportação">{[["type", "Tipo de relatório"], ["period", "Período"], ["options", "Opções"], ["preview", "Visualizar"]].map(([id, label]) => <button type="button" key={id} className={step === id ? "active" : ""} aria-current={step === id ? "step" : undefined} onClick={() => setStep(id)}>{label}</button>)}</nav><div className="home-flow-body">
    {step === "type" && <section className="export-step"><h3>Selecione o tipo de exportação</h3><div className="report-type-list">{reportTypes.map((item) => <button type="button" key={item.id} className={reportType === item.id ? "selected" : ""} onClick={() => setReportType(item.id)}><span><strong>{item.title}</strong>{reportType === item.id && <em>Selecionado</em>}</span><small>{item.description}</small><span><b>Formatos: {item.formats}</b><b>Tamanho estimado: {item.size}</b></span></button>)}</div></section>}
    {step === "period" && <section className="export-step"><h3>Selecione o período para exportação</h3><div className="export-period"><label>Data inicial<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label><span>até</span><label>Data final<input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label></div></section>}
    {step === "options" && <section className="export-step"><h3>Formato de exportação</h3><label className="home-flow-field">Formato<select value="CSV" disabled><option>CSV</option></select></label><h3>Dados a incluir</h3><div className="export-checks">{includedLabels.map(([key, label]) => <label key={key}><input type="checkbox" checked={included[key]} onChange={() => toggleIncluded(key)} />{label}</label>)}</div></section>}
    {step === "preview" && <section className="export-step"><h3>Resumo da exportação</h3><dl className="export-preview"><div><dt>{scope === "group" ? "Grupo" : "Conta"}</dt><dd>{scope === "group" ? target.title : target.name}<small>{target.code}</small></dd></div><div><dt>Tipo de relatório</dt><dd>{selectedReport.title}</dd></div><div><dt>Período</dt><dd>{dateFrom.split("-").reverse().join("/")} – {dateTo.split("-").reverse().join("/")}</dd></div><div><dt>Formato</dt><dd>CSV</dd></div></dl><div className="export-chips">{includedLabels.filter(([key]) => included[key]).map(([, label]) => <span key={label}>{label}</span>)}</div></section>}
  </div><footer><button type="button" className="button secondary" onClick={onClose}>Cancelar</button><button type="button" className="button primary" onClick={() => onComplete({ target, scope, reportType, reportTitle: selectedReport.title, dateFrom, dateTo, format: "CSV", included })}><DownloadSimple />Gerar exportação</button></footer></section></div>;
}

function ApproveAnalysisDialog({ account, approved, onClose, onConfirm }) {
  return <div className="overlay modal-overlay home-flow-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="home-flow-dialog home-approve-dialog" role="dialog" aria-modal="true" aria-labelledby="approve-dialog-title"><header><div><small>Análise da conta</small><h2 id="approve-dialog-title">{account.name}</h2></div><IconButton label="Fechar" onClick={onClose}><X /></IconButton></header><div className="home-flow-body"><div className={`approval-message ${approved ? "approved" : ""}`}>{approved ? <CheckCircle size={34} weight="fill" /> : <WarningCircle size={34} weight="fill" />}<div><strong>{approved ? "Análise já aprovada" : "Aprovar esta análise?"}</strong><p>{approved ? "Esta conta já foi revisada e aprovada nesta sessão." : `Você confirma os saldos, documentos e divergências apresentados para ${account.code}?`}</p></div></div><dl className="approval-summary"><div><dt>Saldo contábil</dt><dd>{account.balance}</dd></div><div><dt>Diferença</dt><dd>{account.difference}</dd></div><div><dt>Status atual</dt><dd>{account.status}</dd></div></dl></div><footer><button type="button" className="button secondary" onClick={onClose}>{approved ? "Fechar" : "Cancelar"}</button>{!approved && <button type="button" className="button primary" onClick={onConfirm}><CheckCircle />Confirmar aprovação</button>}</footer></section></div>;
}

function ModulePage({ name, onBack }) {
  const item = navItems.find((entry) => entry.label === name) || navItems[0];
  const Icon = item.icon;
  const descriptions = { Home: "Visão geral das conciliações e pendências do projeto.", "Logs de Auditoria": "Histórico rastreável das ações realizadas na conciliação.", Cadastros: "Contas, regras e fontes de dados usadas pelo conciliador.", "Mapa do Projeto": "Estrutura das etapas e integrações do projeto." };
  return <main id="main-content" className="main-content module-page"><nav className="breadcrumb"><button type="button" onClick={onBack}>Home</button><CaretRight /><span>{name}</span></nav><section className="module-hero"><Icon size={34} weight="duotone" /><div><h1>{name}</h1><p>{descriptions[name]}</p></div></section><section className="module-placeholder"><strong>Módulo acessível</strong><p>Este destino está conectado ao menu do protótipo. Volte à Home para continuar o fluxo principal.</p><button type="button" className="button primary" onClick={onBack}>Voltar para Home</button></section></main>;
}
