# ADR-0004 — Frontend em React + Vite + TypeScript, foco em didática

- **Status:** aceito
- **Contexto:** o frontend é para **explicar**, não para impressionar visualmente. Precisa
  renderizar markdown e diagramas Mermaid, navegar bem entre tópicos/padrões/diagramas e
  consumir o BFF com tipos.
- **Decisão:** **React + Vite + TypeScript (strict)**, `react-router-dom`, `mermaid` para
  diagramas e `react-markdown`+`remark-gfm` para os campos longos. Dev server com **proxy**
  de `/api` para o BFF (origem única, sem CORS em dev). Componentes reutilizáveis
  (`Mermaid`, `Markdown`, `SourceRefList`, `TradeOffTable`, `Chips`).
- **Alternativas consideradas:**
  - *Next.js:* SSR/rotas de arquivo desnecessários para um navegador de KB que chama uma
    API; Vite é mais leve e direto.
  - *App estático sem framework:* perderia componentização e tipos.
- **Consequências:** build rápido, tipos fim-a-fim com o BFF, layout limpo. Custo: o
  bundle do Mermaid é grande (todos os tipos de diagrama) — aceitável para um app de
  estudo; dá para code-split depois.
