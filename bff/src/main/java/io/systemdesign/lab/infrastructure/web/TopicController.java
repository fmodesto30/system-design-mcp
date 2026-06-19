package io.systemdesign.lab.infrastructure.web;

import io.systemdesign.lab.application.KnowledgeService;
import io.systemdesign.lab.domain.model.Topic;
import io.systemdesign.lab.infrastructure.web.dto.SummaryDtos.TopicSummary;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@Validated
public class TopicController {

    static final String ID_PATTERN = "^[a-z0-9-]{1,64}$";

    private final KnowledgeService service;

    public TopicController(KnowledgeService service) {
        this.service = service;
    }

    @GetMapping
    public List<TopicSummary> list() {
        return service.listTopics().stream().map(TopicSummary::from).toList();
    }

    @GetMapping("/{id}")
    public Topic get(@PathVariable @Pattern(regexp = ID_PATTERN) String id) {
        return service.getTopic(id);
    }
}
