package io.systemdesign.lab.domain.model;

import java.util.List;

/**
 * A System Design topic (maps to a chapter of the workbook). Long-form, didactic.
 * List fields are normalized to immutable empty lists when absent.
 */
public record Topic(
        String id,
        String title,
        String category,
        String summary,
        String detailedExplanation,
        List<String> relatedTopics,
        List<String> relatedPatterns,
        List<TradeOff> tradeOffs,
        String interviewAngle,
        String example,
        List<String> diagrams,
        List<SourceRef> sourceRefs) {

    public Topic {
        relatedTopics = relatedTopics == null ? List.of() : List.copyOf(relatedTopics);
        relatedPatterns = relatedPatterns == null ? List.of() : List.copyOf(relatedPatterns);
        tradeOffs = tradeOffs == null ? List.of() : List.copyOf(tradeOffs);
        diagrams = diagrams == null ? List.of() : List.copyOf(diagrams);
        sourceRefs = sourceRefs == null ? List.of() : List.copyOf(sourceRefs);
    }
}
