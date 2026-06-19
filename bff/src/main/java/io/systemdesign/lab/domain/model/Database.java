package io.systemdesign.lab.domain.model;

import java.util.List;

/**
 * Uma opção de banco de dados AWS com dados canônicos públicos (preço, CAP/PACELC, failover, AZs) e
 * fonte. Alimenta o catálogo {@code /databases} e o decisor de bancos do frontend.
 */
public record Database(
        String id,
        String name,
        String category,
        String engine,
        String summary,
        String priceMonthly,
        String priceAnnual,
        String capTheorem,
        String pacelc,
        String failover,
        String azs,
        List<String> whenToUse,
        List<String> whenToAvoid,
        List<TradeOff> tradeOffs,
        List<String> relatedPatterns,
        List<String> relatedTopics,
        List<String> diagrams,
        List<SourceRef> sourceRefs) {

    public Database {
        whenToUse = whenToUse == null ? List.of() : List.copyOf(whenToUse);
        whenToAvoid = whenToAvoid == null ? List.of() : List.copyOf(whenToAvoid);
        tradeOffs = tradeOffs == null ? List.of() : List.copyOf(tradeOffs);
        relatedPatterns = relatedPatterns == null ? List.of() : List.copyOf(relatedPatterns);
        relatedTopics = relatedTopics == null ? List.of() : List.copyOf(relatedTopics);
        diagrams = diagrams == null ? List.of() : List.copyOf(diagrams);
        sourceRefs = sourceRefs == null ? List.of() : List.copyOf(sourceRefs);
    }
}
