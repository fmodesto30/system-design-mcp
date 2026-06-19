package io.systemdesign.lab.domain.model;

/**
 * Pré-sugestão de banco para uma arquitetura. A referência sugere a linguagem; o usuário decide no
 * decisor de bancos. {@code suggestedDbId} aponta para um {@link Database} de databases.json.
 *
 * @param suggestedDbId id de um Database
 * @param level         "high" | "medium" — quão central é a escolha de banco para esta arquitetura
 * @param rationale     uma linha: por que este banco encaixa
 */
public record DatabaseRecommendation(String suggestedDbId, String level, String rationale) {
}
