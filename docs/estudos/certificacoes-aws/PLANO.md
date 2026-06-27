# Trilha — Certificações AWS

> Alvo imediato: **SAA-C03** (Solutions Architect Associate). Estudo + prova de múltipla escolha —
> previsível, com data marcável. Método: hands-on no `saa-lab` + bancos de questão estilo Tutorials Dojo.

## Métrica de progresso
**Não** horas. Conta: (a) % dos labs deployáveis feitos, (b) score nos quizzes por domínio,
(c) score no simulado completo (meta: ≥85% consistente antes de marcar a prova).

## Ferramentas (já existem)
- **`E:\saa-lab`** — lab interativo (Docker: LocalStack :4566 + Postgres :5433 + dashboard FastAPI :8000;
  terraform REAL → inspeção boto3; quizzes embutidos). **Ferramenta principal.** Já tem uma sessão dedicada
  (chip) pra evoluir as fases. Subir: `docker compose up --build -d` → http://localhost:8000.
- **`E:\aws-saa-study\index.html`** — página única de estudo/quiz SAA (standalone, sem Docker). Secundária —
  bom pra revisão rápida offline.

## Estado do saa-lab (do README dele)
- **Fase 1 (feita)**: scaffold + Domínio 1 com 3 labs deployáveis + quiz de 50q + stub do simulado.
- **Fase 2**: expandir pros demais domínios (mais ~8 labs deployáveis; resto conceitual; popular pools de quiz).
- **Fase 3**: simulado completo (65q) + gap-tracking + modo exame randomizado.

## Os 4 domínios da SAA-C03 (peso na prova)
1. **Design Secure Architectures** (~30%) — IAM, KMS, SGs/NACLs, criptografia.
2. **Design Resilient Architectures** (~26%) — multi-AZ, auto scaling, desacoplamento (SQS/SNS), failover.
3. **Design High-Performing Architectures** (~24%) — caching, escolha de storage/DB, CDN, compute certo.
4. **Design Cost-Optimized Architectures** (~20%) — pricing models, right-sizing, S3 tiers, Savings Plans.

## Plano de ataque
1. **Avançar a Fase 2 do saa-lab** domínio por domínio (a sessão/chip do saa-lab orienta qual lab primeiro).
   Cada lab: ler briefing → `terraform apply` no LocalStack → `Inspect` (boto3) → quiz do lab.
2. **Conceituais** (o que o LocalStack NÃO emula — Route53 policies, TGW/DirectConnect, Organizations/SCP,
   Cost Explorer, failover real): estudar por questão/teoria, não por deploy.
3. **Bancos de questão**: rodar os quizzes por domínio até ≥85%; depois o simulado completo (Fase 3).
4. **Marcar a prova** só quando o simulado bater ≥85% 2× seguidas.

## Depois da SAA-C03 (próximas certs — opcional)
- **Associate adjacentes**: Developer (DVA-C02) ou SysOps (SOA-C02) — reaproveitam ~60% do conteúdo.
- **Profissional**: Solutions Architect Professional (SAP) — só depois de experiência real, é bem mais densa.

## Quando voltar aqui
Atualiza % de labs/score de quiz e qual domínio está mais fraco — é o próximo foco.
