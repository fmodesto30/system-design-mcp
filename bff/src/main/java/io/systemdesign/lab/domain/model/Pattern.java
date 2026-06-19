package io.systemdesign.lab.domain.model;

import java.util.List;

/** An architectural pattern (microservices.io catalog + book-driven extras). */
public record Pattern(
        String id,
        String name,
        String category,
        String problem,
        String solution,
        List<String> whenToUse,
        List<String> whenToAvoid,
        String exampleFromRepo,
        String financialExample,
        List<TradeOff> tradeOffs,
        List<String> relatedPatterns,
        String interviewAngle,
        List<String> diagrams,
        List<SourceRef> sourceRefs) {

    public Pattern {
        whenToUse = whenToUse == null ? List.of() : List.copyOf(whenToUse);
        whenToAvoid = whenToAvoid == null ? List.of() : List.copyOf(whenToAvoid);
        tradeOffs = tradeOffs == null ? List.of() : List.copyOf(tradeOffs);
        relatedPatterns = relatedPatterns == null ? List.of() : List.copyOf(relatedPatterns);
        diagrams = diagrams == null ? List.of() : List.copyOf(diagrams);
        sourceRefs = sourceRefs == null ? List.of() : List.copyOf(sourceRefs);
    }
}
