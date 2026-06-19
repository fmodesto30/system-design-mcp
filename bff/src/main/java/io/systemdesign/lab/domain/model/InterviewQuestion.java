package io.systemdesign.lab.domain.model;

import java.util.List;

/** A System Design interview question with a layered answer (short, detailed, mental model). */
public record InterviewQuestion(
        String id,
        String question,
        String difficulty,
        String shortAnswer,
        String detailedAnswer,
        String mentalModel,
        List<String> patterns,
        List<String> risks,
        List<TradeOff> tradeOffs,
        String repoExample,
        String howToAnswerInInterview,
        List<String> relatedTopics,
        List<String> diagrams,
        List<SourceRef> sourceRefs) {

    public InterviewQuestion {
        patterns = patterns == null ? List.of() : List.copyOf(patterns);
        risks = risks == null ? List.of() : List.copyOf(risks);
        tradeOffs = tradeOffs == null ? List.of() : List.copyOf(tradeOffs);
        relatedTopics = relatedTopics == null ? List.of() : List.copyOf(relatedTopics);
        diagrams = diagrams == null ? List.of() : List.copyOf(diagrams);
        sourceRefs = sourceRefs == null ? List.of() : List.copyOf(sourceRefs);
    }
}
