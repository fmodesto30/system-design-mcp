package io.systemdesign.lab.infrastructure.web;

import io.systemdesign.lab.application.KnowledgeService;
import io.systemdesign.lab.domain.model.Evidence;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/evidence")
public class EvidenceController {

    private final KnowledgeService service;

    public EvidenceController(KnowledgeService service) {
        this.service = service;
    }

    @GetMapping
    public List<Evidence> list() {
        return service.listEvidence();
    }
}
