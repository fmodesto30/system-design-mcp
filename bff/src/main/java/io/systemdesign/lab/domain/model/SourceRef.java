package io.systemdesign.lab.domain.model;

/**
 * A pointer to the evidence backing a claim. Core invariant of the Lab: no factual item exists
 * without at least one {@code SourceRef}.
 *
 * @param kind    one of {@code pdf} (workbook), {@code repo} (a reference repository) or
 *                {@code reference} (microservices.io)
 * @param source  human name of the source, e.g. {@code "System Design Workbook"}
 * @param locator where inside the source, e.g. {@code "p.420"} or {@code "pkg/hashring/"}
 * @param note    optional short quote or clarification (nullable)
 */
public record SourceRef(String kind, String source, String locator, String note) {
}
