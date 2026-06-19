package io.systemdesign.lab.domain.model;

/**
 * A single trade-off along one dimension. Every architectural decision in the Lab is expected to
 * carry its trade-offs explicitly.
 *
 * @param dimension the axis being weighed, e.g. {@code "Consistência"}, {@code "Latência de leitura"}
 * @param pro       what you gain
 * @param con       what you pay
 */
public record TradeOff(String dimension, String pro, String con) {
}
