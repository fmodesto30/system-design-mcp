# Estudos — divisão por trilha

> Hub de organização. Não move nada de lugar — só aponta pra onde o material já vive
> e separa o estudo em **duas trilhas** que correm em paralelo, com objetivos diferentes.

## As duas trilhas

| Trilha | Objetivo | Onde está | Plano |
|---|---|---|---|
| 🧑‍💻 **Processos seletivos** | Passar em entrevista de SWE (DSA · system design · comportamental · portfólio) | `processos-seletivos/` (novo) + `E:\projects\` (projetos) | [PLANO](processos-seletivos/PLANO.md) |
| ☁️ **Certificações AWS** | Tirar a SAA-C03 (e próximas) | `E:\saa-lab` (lab interativo) + `E:\aws-saa-study` (quiz HTML) | [PLANO](certificacoes-aws/PLANO.md) |

## Por que separar
São **esforços diferentes**: certificação é estudo + prova de múltipla escolha (previsível, com data);
processo seletivo é treino de resolução de problema + design + narrativa (contínuo, sob pressão).
Misturar os dois no mesmo "modo de estudo" dispersa. A trilha AWS **alimenta** a de processos
(system design fica mais forte sabendo AWS), mas o ritmo e o método de cada uma é próprio.

## Como usar
- **Bloco fixo por dia**: ex. manhã = uma trilha, noite = outra; ou dias alternados. O importante
  é não fazer as duas "pela metade" no mesmo bloco.
- **Cada trilha tem 1 métrica de progresso** (no PLANO de cada uma) — mede ela, não horas.
- **Revisão semanal**: 15 min olhando os 2 PLANOs, ajustando o foco da semana seguinte.

## Material que já existe (mapeado)
- `E:\saa-lab` — lab AWS interativo (Docker: LocalStack + Postgres + dashboard FastAPI; terraform→boto3). **Ferramenta principal da trilha AWS.**
- `E:\aws-saa-study\index.html` — página única de estudo/quiz SAA (standalone). Secundária.
- `E:\projects\` — `bookstore-microservices`, `ecommerce-orders`, etc. **Matéria-prima de portfólio** pra processos seletivos.
- `E:\SmartCatalog` — portfólio NestJS+DDD (dormente) — outro item de portfólio.

## ⚠️ Backup
Esta pasta (e `saa-lab`, `aws-saa-study`) **não são repos git** → sem backup. Recomendo
`git init` + remote privado em cada uma (mesmo risco que o loglife tinha). Vale fazer antes de investir horas.
