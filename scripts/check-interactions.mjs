import fs from "node:fs";
import process from "node:process";
import { parse } from "@babel/parser";

const sourcePath = new URL("../src/App.jsx", import.meta.url);
const source = fs.readFileSync(sourcePath, "utf8");
const drilldownSource = fs.readFileSync(new URL("../src/AccountDrilldown.jsx", import.meta.url), "utf8");
const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
const drilldownAst = parse(drilldownSource, { sourceType: "module", plugins: ["jsx"] });
const failures = [];

if (!source.includes("openAccountComparison = (account)") || !source.includes("<AccountDrilldown account={selectedAccount}")) {
  failures.push("V1 deve repassar a conta escolhida da Home para a comparação detalhada");
}
if (!source.includes('workspace: "suggestions", account: DEFAULT_ACCOUNT')) {
  failures.push("O atalho de notificações deve abrir as sugestões da conta divergente, sem reutilizar outra conta visitada");
}
for (const legacyMarker of ["summary-card", "desktop-table-wrap", "review-bar", "accountDrilldown"]) {
  if (source.includes(legacyMarker)) {
    failures.push(`V1 não deve manter o fluxo legado compartilhado com a V2: ${legacyMarker}`);
  }
}
if (!source.includes('currentNav !== "Comparação Detalhada"') || !source.includes(': <AccountDrilldown account={selectedAccount}')) {
  failures.push("Todo acesso à Comparação Detalhada da V1 deve abrir diretamente o workspace de usabilidade");
}
if (!drilldownSource.includes('className="workspace-tabs"') || !drilldownSource.includes("Movimentos pareados")) {
  failures.push("V1 deve preservar o workspace melhorado e orientado à tarefa");
}
if (drilldownSource.includes('className="comparison-ledgers"')) {
  failures.push("V1 não deve regredir para o detalhe contínuo exclusivo da V2");
}

if (!/\{\s*!isMatched\s*&&[\s\S]*?className="review-priority"/.test(drilldownSource)) {
  failures.push("Conta conciliada não deve exibir a prioridade de revisão de movimentos divergentes");
}
if (!/accountDocuments\s*=\s*[\s\S]*selectedAccount\.attachments/.test(drilldownSource) || !drilldownSource.includes("accountDocuments.map")) {
  failures.push("A análise documental deve usar uma coleção accountDocuments derivada dos anexos da conta selecionada");
}
if (!drilldownSource.includes("movementId") || !/decide\s*=\s*\([^)]*\)[\s\S]*movementId/.test(drilldownSource)) {
  failures.push("Sugestões devem estar ligadas a um movimento por movementId e a decisão deve atualizar esse movimento");
}
if (!/resolvedMovementIds|reviewedMovementIds|completedMovementIds/.test(drilldownSource) || !drilldownSource.includes("progressPercent")) {
  failures.push("O progresso deve ser calculado a partir do estado dos movimentos tratados, sem valor fixo");
}
if (drilldownSource.includes("<dd>32 de 42</dd>") || drilldownSource.includes('width: "76%"')) {
  failures.push("O resumo da conta não pode manter progresso fixo de 32 de 42 / 76%");
}
const politeRegions = drilldownSource.match(/aria-live="polite"/g)?.length ?? 0;
if (politeRegions < 2) {
  failures.push("Os carregamentos de documentos e sugestões devem ter regiões aria-live=\"polite\"");
}

function attribute(opening, name) {
  return opening.attributes.find((item) => item.type === "JSXAttribute" && item.name.name === name);
}

function literalValue(attr) {
  if (!attr?.value) return true;
  if (attr.value.type === "StringLiteral") return attr.value.value;
  return undefined;
}

function jsxText(node) {
  if (!node) return "";
  if (node.type === "JSXText") return node.value;
  if (node.type === "StringLiteral") return node.value;
  if (node.type === "JSXElement" || node.type === "JSXFragment") return node.children.map(jsxText).join(" ");
  return "";
}

function expressionSource(attr, fileSource) {
  const expression = attr?.value?.type === "JSXExpressionContainer" ? attr.value.expression : null;
  return expression ? fileSource.slice(expression.start, expression.end) : "";
}

function inspectHomeSemantics(node) {
  if (!node || typeof node !== "object") return;
  if (node.type === "JSXElement" && node.openingElement.name.type === "JSXIdentifier") {
    const opening = node.openingElement;
    const name = opening.name.name;
    const text = jsxText(node).replace(/\s+/g, " ").trim();
    if (name === "button" && ["Anexar documento", "Exportar para auditoria", "Aprovar análise"].includes(text)) {
      const handler = expressionSource(attribute(opening, "onClick"), source);
      if (/\baction\s*\(/.test(handler) || /onToast\??\.\s*\(/.test(handler)) {
        failures.push(`Ação da Home \"${text}\" não pode apenas exibir toast`);
      }
    }
    if (name === "select") {
      const label = literalValue(attribute(opening, "aria-label"));
      if (["Filtrar sistema", "Filtrar status"].includes(label)) {
        if (!attribute(opening, "value") || !attribute(opening, "onChange")) {
          failures.push(`Filtro diário \"${label}\" deve ser controlado com value e onChange`);
        }
      }
    }
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(inspectHomeSemantics);
    else if (value && typeof value === "object" && value.type) inspectHomeSemantics(value);
  }
}

function inspectDrilldownAccessibility(node) {
  if (!node || typeof node !== "object") return;
  if (node.type === "JSXElement" && node.openingElement.name.type === "JSXIdentifier") {
    const opening = node.openingElement;
    if (opening.name.name === "nav" && literalValue(attribute(opening, "role")) === "tablist" && !attribute(opening, "onKeyDown")) {
      failures.push("A lista de etapas deve oferecer navegação por teclado via onKeyDown");
    }
    if (opening.name.name === "button" && literalValue(attribute(opening, "role")) === "tab") {
      if (!attribute(opening, "id") || !attribute(opening, "aria-controls")) {
        failures.push(`linha ${opening.loc?.start.line ?? 0}: tab deve ter id e aria-controls`);
      }
    }
    if (literalValue(attribute(opening, "role")) === "tabpanel") {
      if (!attribute(opening, "id") || !attribute(opening, "aria-labelledby")) {
        failures.push(`linha ${opening.loc?.start.line ?? 0}: tabpanel deve ter id e aria-labelledby`);
      }
    }
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(inspectDrilldownAccessibility);
    else if (value && typeof value === "object" && value.type) inspectDrilldownAccessibility(value);
  }
}

function visit(node) {
  if (!node || typeof node !== "object") return;
  if (node.type === "JSXOpeningElement" && node.name.type === "JSXIdentifier") {
    const name = node.name.name;
    const line = node.loc?.start.line ?? 0;
    const staticControl = attribute(node, "data-static-control");
    if ((name === "button" || name === "IconButton") && !staticControl) {
      const hasAction = Boolean(attribute(node, "onClick") || attribute(node, "type") || attribute(node, "disabled"));
      if (!hasAction) failures.push(`linha ${line}: <${name}> sem onClick, type ou disabled`);
    }
    if (name === "a" && literalValue(attribute(node, "href")) === "#") {
      failures.push(`linha ${line}: link com href="#" não navega`);
    }
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object" && value.type) visit(value);
  }
}

visit(ast);
inspectHomeSemantics(ast);
inspectDrilldownAccessibility(drilldownAst);

if (failures.length) {
  console.error("INTERACTION_AUDIT_FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("INTERACTION_AUDIT_PASSED");
