package io.systemdesign.lab.infrastructure.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Contract test of the HTTP surface, using the real loaded knowledge base. */
@SpringBootTest
@AutoConfigureMockMvc
class ApiContractTest {

    @Autowired
    MockMvc mvc;

    @Test
    void listEndpointsReturn200AndArrays() throws Exception {
        for (String path : new String[]{"/api/topics", "/api/patterns", "/api/flows",
                "/api/interview/questions", "/api/diagrams", "/api/evidence"}) {
            mvc.perform(get(path))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith("application/json"))
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").exists());
        }
    }

    @Test
    void topicDetailReturnsFullObject() throws Exception {
        mvc.perform(get("/api/topics/cqrs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("cqrs"))
                .andExpect(jsonPath("$.detailedExplanation").isNotEmpty())
                .andExpect(jsonPath("$.sourceRefs[0].locator").exists());
    }

    @Test
    void patternDetailReturnsFullObject() throws Exception {
        mvc.perform(get("/api/patterns/saga"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("saga"))
                .andExpect(jsonPath("$.problem").isNotEmpty());
    }

    @Test
    void diagramDetailReturnsMermaid() throws Exception {
        mvc.perform(get("/api/diagrams/architecture-overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mermaid").isNotEmpty());
    }

    @Test
    void missingIdReturns404WithErrorBody() throws Exception {
        mvc.perform(get("/api/topics/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.path").value("/api/topics/does-not-exist"));
    }

    @Test
    void invalidIdReturns400() throws Exception {
        mvc.perform(get("/api/topics/NOT_A_VALID_ID"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void statsEndpointReturnsCounts() throws Exception {
        mvc.perform(get("/api/meta/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topics").isNumber())
                .andExpect(jsonPath("$.patterns").isNumber());
    }
}
