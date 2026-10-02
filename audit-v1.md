# Auditoria de cobertura da V1

Fonte oficial auditada: https://conciliador-contabil.lovable.app/account-drilldown/1110001

Data: 2026-10-01

## Veredito

A V1 já cobria o resumo de conciliação, a lista consolidada, busca, filtros, divergências e sugestões de IA. Faltavam três partes do fluxo canônico: validação de documentos, resultados documentais detalhados e comparação completa entre Razão Analítico e Sistema Financeiro. Essas lacunas foram corrigidas em um novo detalhamento de conta acessível pela ação **Detalhar conta**.

## Etapas verificadas

1. **Entrada no detalhamento — saudável.** A conta `1.1.01.001 - Caixa Geral` exibe saldo contábil, valor do sistema, diferença e estado divergente.
2. **Análise de documentos — saudável após correção.** A ação reproduz estado vazio, processamento e resultado com 5 documentos, incluindo 3 válidos, 1 em atenção e 1 inválido.
3. **Sugestões de conciliação — saudável após correção.** A ação reproduz processamento, três sugestões, confiança, justificativa e decisões de aceitar/rejeitar.
4. **Razão Analítico — saudável após correção.** Oito lançamentos, estados semânticos e menu de ações por registro estão presentes.
5. **Sistema Financeiro — saudável após correção.** Sete lançamentos, estados e ação Abrir Sistema estão presentes.

## Evidência e limites

- Captura atual da fonte: navegador interno, rota `/account-drilldown/1110001`, desktop 1280 × 720.
- Captura atual da V1: navegador interno, `http://localhost:4173/`, desktop 1280 × 720.
- A auditoria verificou estados visuais e interações do protótipo. Não afirma conformidade integral de acessibilidade sem testes assistivos dedicados.

