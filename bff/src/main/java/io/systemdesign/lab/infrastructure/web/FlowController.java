package io.systemdesign.lab.infrastructure.web;

import io.systemdesign.lab.application.KnowledgeService;
import io.systemdesign.lab.domain.model.Flow;
import io.systemdesign.lab.infrastructure.web.dto.SummaryDtos.FlowSummary;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/flows")
@Validated
public class FlowController {

    private final KnowledgeService service;

    public FlowController(KnowledgeService service) {
        this.service = service;
    }

    @GetMapping
    public List<FlowSummary> list() {
        return service.listFlows().stream().map(FlowSummary::from).toList();
    }

    @GetMapping("/{id}")
    public Flow get(@PathVariable @Pattern(regexp = TopicController.ID_PATTERN) String id) {
        return service.getFlow(id);
    }
}
