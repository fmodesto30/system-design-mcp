# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/);
versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.1.0] — 2026-06-19

### Added
- **BFF** (Java 21 + Spring Boot 3.4, arquitetura hexagonal): endpoints REST de topics,
  patterns, flows, interview-questions, diagrams, evidence, ai-glossary, meta/stats; actuator +
  métricas Prometheus; handler global de erro; filtro de request-id. 17 testes (unit + contrato +
  integridade da base).
- **Frontend** (React + Vite + TypeScript): telas de tópicos, padrões, fluxos, diagramas (Mermaid),
  Modo Entrevista, Comparar arquiteturas, Evidências e **IA & Agentes**.
- **Knowledge base** versionada (JSON + JSON Schema): 29 tópicos, 20 padrões, 7 fluxos, 30 perguntas,
  12 diagramas, 24 evidências, 13 termos de IA&Agentes — toda entrada com `sourceRefs` e `url`
  verificada por `curl`.
- **MCP server** (`mcp/`, Node stdio): tools `overview`/`search`/`list`/`get`, lendo a mesma base.
- **Docs:** source-inventory, system-design-knowledge-map, architecture, ADRs, runbook,
  interview-guide, tradeoffs, glossary, ai-agents-glossary, mcp-server-plan, FOR-AGENTS, final-report.
- **Infra:** docker-compose + Dockerfiles + scripts (build/test/run + manutenção de fontes).

### Fixed
- Links de fonte quebrados: cada `sourceRef` agora carrega um `url` curl-verificado (deep-link
  quando resolve, fallback pro índice de padrões quando não, raiz do repo pra repos).

[Unreleased]: https://github.com/fmodesto30/system-design-mcp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/fmodesto30/system-design-mcp/releases/tag/v0.1.0
