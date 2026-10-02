# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

## Version boundaries

- This repository is V1. Its Home is the canonical shared Home and may also be reproduced in V2.
- The V1 detailed comparison is intentionally a new, usability-first proposal. Keep it as a task-oriented workspace with a unified line-by-line comparison, progressive review, document validation, and AI suggestions.
- V1 has exactly one detailed-comparison implementation: `AccountDrilldown.jsx`. Every entry point—including the journey menu, product tab, notifications, and account-card actions—must route to that workspace. Do not add a second aggregate or V2-style comparison block to `App.jsx`.
- V2 represents the current production flow restyled with the Animália/Smart X design system. Do not copy V2's detailed-comparison structure into this repository.
- Preserve the selected account end to end. Every entry from Home must open the detail with that account's code, name, balances, status, and attachments, and returning must restore the Home flow.
- Visual similarity in the global shell and Home is expected. Similarity between the V1 and V2 detailed-comparison experiences is a regression.
- Controle de Acesso is an independent V1 module at `#/controle-de-acesso`. Changes to this module must stay isolated from `AccountDrilldown.jsx` and must not alter the detailed-comparison flow, layout, data or interactions.
- Cadastros de Conciliação is an independent V1 module at `#/cadastros`; keep its account-linking data and workflows isolated from `AccountDrilldown.jsx` and the detailed-comparison flow.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
