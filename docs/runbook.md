# Runbook — System Design Specialist Lab

Como rodar, testar e operar o Lab localmente. Sem segredos, sem serviços pagos.

## Pré-requisitos

- **JDK 21** (validado com Temurin 21.0.11). Confirme: `java -version`.
- **Node 20+** e npm (validado com Node 24 / npm 11).
- Maven **não** é necessário: o BFF inclui o wrapper `./mvnw` (baixa o Maven 3.9.9).

## Rodar o BFF

```bash
cd bff
./mvnw spring-boot:run
# → http://localhost:8080 ; health em /actuator/health
```

Validar:
```bash
curl localhost:8080/api/meta/stats
curl localhost:8080/api/topics/cqrs | jq '.title, .sourceRefs[0]'
```

### Gotcha: `Selector.open() EINVAL` / app não sobe

Em máquinas Windows onde o antivírus bloqueia AF_UNIX/loopback para `java.exe`, o
conector NIO do Tomcat falha no boot. Workaround (força TCP):

```bash
export JAVA_TOOL_OPTIONS="-Djdk.net.unixdomain.tmpdir=Z:\\nope"
./mvnw spring-boot:run
```

A causa-raiz é o antivírus; o conserto definitivo é colocar `java.exe` na whitelist.
(Os testes usam ambiente web MOCK, sem socket, então `./mvnw test` não é afetado.)

### Apontar para conteúdo vivo (sem rebuild)

Por padrão o BFF lê a cópia da base no classpath (empacotada de `../knowledge-base` no
build). Para editar o JSON e ver na hora:
```bash
SDSL_KNOWLEDGE_BASE_DIR=../knowledge-base ./mvnw spring-boot:run
```

## Rodar o frontend

```bash
cd frontend
npm install
npm run dev      # → http://localhost:5173 (proxy /api e /actuator para :8080)
```

O BFF precisa estar no ar para o conteúdo carregar; senão as telas mostram o erro
“O BFF está rodando em :8080?”.

## Testar

```bash
# BFF: unit + contrato + integridade da base
cd bff && ./mvnw test

# Frontend: type-check (strict) + build de produção
cd frontend && npm run build
```

Ou os atalhos: `scripts/test.sh` (ambos) e `scripts/build.sh` (jar + dist).

## Empacotar

```bash
cd bff && ./mvnw clean package      # gera target/system-design-lab-bff-0.1.0.jar
java -jar target/system-design-lab-bff-0.1.0.jar

cd frontend && npm run build        # gera frontend/dist/ (estático)
```

## Docker

```bash
docker compose up --build
# frontend (nginx) em :5173, bff em :8080
docker compose down
```

## Regenerar a base de conhecimento

A base versionada em `knowledge-base/*.json` já é o produto final. Para reconstruir a
partir dos `_parts` (ex.: após editar um lote):

```bash
python scripts/merge_validate_kb.py    # usa o venv do workspace
cd bff && ./mvnw test                  # gate de integridade
```

`_parts/` e `docs/_sources/` são intermediários (gitignored). O schema fica em
`knowledge-base/schema/`.

## Portas

| Porta | Serviço |
|-------|---------|
| 8080 | BFF (API + actuator) |
| 5173 | Frontend (Vite dev / nginx no Docker) |

## Saúde / métricas

- `GET /actuator/health` → status dos componentes.
- `GET /actuator/prometheus` → métricas Micrometer (scrape Prometheus).
- Cada resposta traz `X-Request-Id`; o mesmo id aparece nos logs (`reqId=…`).
