package io.systemdesign.lab.infrastructure.web;

import io.systemdesign.lab.application.KnowledgeService;
import io.systemdesign.lab.domain.model.InterviewQuestion;
import io.systemdesign.lab.infrastructure.web.dto.SummaryDtos.QuestionSummary;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/interview/questions")
@Validated
public class InterviewController {

    private final KnowledgeService service;

    public InterviewController(KnowledgeService service) {
        this.service = service;
    }

    @GetMapping
    public List<QuestionSummary> list() {
        return service.listInterviewQuestions().stream().map(QuestionSummary::from).toList();
    }

    @GetMapping("/{id}")
    public InterviewQuestion get(@PathVariable @Pattern(regexp = TopicController.ID_PATTERN) String id) {
        return service.getInterviewQuestion(id);
    }
}
