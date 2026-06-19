package io.systemdesign.lab.domain.model;

import java.util.List;

/** One row of the "claim → evidence → source" matrix. */
public record Evidence(
        String id,
        String claim,
        String evidence,
        List<String> relatedTopics,
        List<String> relatedPatterns,
        List<SourceRef> sourceRefs) {

    public Evidence {
        relatedTopics = relatedTopics == null ? List.of() : List.copyOf(relatedTopics);
        relatedPatterns = relatedPatterns == null ? List.of() : List.copyOf(relatedPatterns);
        sourceRefs = sourceRefs == null ? List.of() : List.copyOf(sourceRefs);
    }
}
