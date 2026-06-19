# Security Policy

## Escopo

Este é um projeto de estudo, **read-only e sem LLM em runtime**: não tem autenticação, não
persiste dados de usuário, não guarda PII e não usa serviços pagos nem segredos. A superfície de
ataque é pequena por design.

## Reportar uma vulnerabilidade

Achou algo (ex.: dependência vulnerável, XSS via conteúdo renderizado, path traversal no loader de
JSON)? Abra uma **issue** privada/security advisory no GitHub, ou descreva o problema com passos de
reprodução. Não há SLA formal — é um projeto pessoal — mas issues de segurança têm prioridade.

## Práticas adotadas

- **Zero credencial** em código, teste ou commit; nada de `.env`/token versionado (ver `.gitignore`).
- Entrada validada na borda do BFF (`@Pattern` em path vars; handler global de erro).
- CORS restrito às origens de dev.
- Conteúdo renderizado no front passa por React/markdown; Mermaid roda com `securityLevel: strict`.
- Dependências: rode `npm audit` (frontend/mcp) e mantenha o Spring Boot atualizado.
