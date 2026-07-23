package com.devluanpaiva.controle_de_remedios_test.unit.modules.assistant.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.io.IOException;
import java.util.UUID;

import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.devluanpaiva.controle_de_remedios.modules.assistant.client.N8nAssistantClient;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@DisplayName("N8nAssistantClient")
class N8nAssistantClientTest {

    private static final String WEBHOOK_URL = "http://localhost:5678/webhook/assistant-test";
    private static final String INTERNAL_SECRET = "test-internal-secret";

    private MockRestServiceServer mockServer;
    private N8nAssistantClient n8nAssistantClient;

    @BeforeEach
    void setUp() {
        RestClient.Builder restClientBuilder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();
        n8nAssistantClient = new N8nAssistantClient(restClientBuilder, WEBHOOK_URL, INTERNAL_SECRET);
    }

    private void assertAssistantUnavailable(ThrowingCallable callable) {
        assertThatThrownBy(callable)
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
                    assertThat(businessException.getCode()).isEqualTo("ASSISTANT_UNAVAILABLE");
                });
    }

    @Nested
    @DisplayName("successful responses")
    class SuccessfulResponses {

        @Test
        @DisplayName("should return the assistant's answer")
        void shouldReturnAnswerOnSuccess() {
            mockServer.expect(requestTo(WEBHOOK_URL))
                    .andExpect(method(HttpMethod.POST))
                    .andRespond(withSuccess("{\"answer\": \"Resposta do assistente\"}", MediaType.APPLICATION_JSON));

            String answer = n8nAssistantClient.ask("Olá", UUID.randomUUID(), UUID.randomUUID());

            assertThat(answer).isEqualTo("Resposta do assistente");
            mockServer.verify();
        }

        @Test
        @DisplayName("should send the internal secret header and the message/companyId/conversationId body")
        void shouldSendSecretHeaderAndRequestBody() {
            UUID companyId = UUID.randomUUID();
            UUID conversationId = UUID.randomUUID();

            String expectedBody = String.format(
                    "{\"message\": \"Olá\", \"companyId\": \"%s\", \"conversationId\": \"%s\"}",
                    companyId, conversationId);

            mockServer.expect(requestTo(WEBHOOK_URL))
                    .andExpect(header("X-Internal-Secret", INTERNAL_SECRET))
                    .andExpect(content().json(expectedBody, true))
                    .andRespond(withSuccess("{\"answer\": \"ok\"}", MediaType.APPLICATION_JSON));

            String answer = n8nAssistantClient.ask("Olá", companyId, conversationId);

            assertThat(answer).isEqualTo("ok");
            mockServer.verify();
        }
    }

    @Nested
    @DisplayName("unavailable assistant")
    class UnavailableAssistant {

        @Test
        @DisplayName("should throw ASSISTANT_UNAVAILABLE when the answer field is null")
        void shouldThrowWhenAnswerIsNull() {
            mockServer.expect(requestTo(WEBHOOK_URL))
                    .andRespond(withSuccess("{\"answer\": null}", MediaType.APPLICATION_JSON));

            assertAssistantUnavailable(() -> n8nAssistantClient.ask("Olá", UUID.randomUUID(), UUID.randomUUID()));
        }

        @Test
        @DisplayName("should throw ASSISTANT_UNAVAILABLE when the answer field is blank")
        void shouldThrowWhenAnswerIsBlank() {
            mockServer.expect(requestTo(WEBHOOK_URL))
                    .andRespond(withSuccess("{\"answer\": \"   \"}", MediaType.APPLICATION_JSON));

            assertAssistantUnavailable(() -> n8nAssistantClient.ask("Olá", UUID.randomUUID(), UUID.randomUUID()));
        }

        @Test
        @DisplayName("should throw ASSISTANT_UNAVAILABLE when the response body is null")
        void shouldThrowWhenResponseBodyIsNull() {
            mockServer.expect(requestTo(WEBHOOK_URL))
                    .andRespond(withSuccess("null", MediaType.APPLICATION_JSON));

            assertAssistantUnavailable(() -> n8nAssistantClient.ask("Olá", UUID.randomUUID(), UUID.randomUUID()));
        }

        @Test
        @DisplayName("should throw ASSISTANT_UNAVAILABLE on an HTTP error status from the webhook")
        void shouldThrowOnHttpErrorStatus() {
            mockServer.expect(requestTo(WEBHOOK_URL)).andRespond(withServerError());

            assertAssistantUnavailable(() -> n8nAssistantClient.ask("Olá", UUID.randomUUID(), UUID.randomUUID()));
        }

        @Test
        @DisplayName("should throw ASSISTANT_UNAVAILABLE when the connection fails")
        void shouldThrowOnConnectionFailure() {
            mockServer.expect(requestTo(WEBHOOK_URL)).andRespond(request -> {
                throw new IOException("connection refused");
            });

            assertAssistantUnavailable(() -> n8nAssistantClient.ask("Olá", UUID.randomUUID(), UUID.randomUUID()));
        }

        @Test
        @DisplayName("should make only a single attempt, with no retry")
        void shouldMakeOnlyOneAttempt() {
            mockServer.expect(requestTo(WEBHOOK_URL)).andRespond(withServerError());

            assertAssistantUnavailable(() -> n8nAssistantClient.ask("Olá", UUID.randomUUID(), UUID.randomUUID()));

            mockServer.verify();
        }
    }
}
