package com.devluanpaiva.controle_de_remedios.modules.assistant.client;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class N8nAssistantClient {
    private static final String INTERNAL_SECRET_HEADER = "X-Internal-Secret";

    private final RestClient restClient;
    private final String webhookUrl;
    private final String internalSecret;

    public N8nAssistantClient(
            @Qualifier("n8nRestClientBuilder") RestClient.Builder restClientBuilder,
            @Value("${assistant.n8n-webhook-url}") String webhookUrl,
            @Value("${assistant.internal-secret}") String internalSecret) {

        this.restClient = restClientBuilder.build();
        this.webhookUrl = webhookUrl;
        this.internalSecret = internalSecret;
    }

    public String ask(String message, UUID companyId, UUID conversationId) {
        try {
            N8nChatResponse response = restClient.post()
                    .uri(webhookUrl)
                    .header(INTERNAL_SECRET_HEADER, internalSecret)
                    .body(new N8nChatRequest(message, companyId, conversationId))
                    .retrieve()
                    .body(N8nChatResponse.class);

            if (response == null || response.answer() == null || response.answer().isBlank()) {
                throw assistantUnavailable();
            }

            return response.answer();
        } catch (RestClientException ex) {
            log.error("Falha ao chamar o webhook do assistente em '{}'", webhookUrl, ex);
            throw assistantUnavailable();
        }
    }

    private BusinessException assistantUnavailable() {
        return new BusinessException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Assistente indisponível",
                "ASSISTANT_UNAVAILABLE",
                "message",
                "Não foi possível obter uma resposta do assistente no momento. Tente novamente em instantes.");
    }

    private record N8nChatRequest(String message, UUID companyId, UUID conversationId) {
    }

    private record N8nChatResponse(String answer) {
    }
}
