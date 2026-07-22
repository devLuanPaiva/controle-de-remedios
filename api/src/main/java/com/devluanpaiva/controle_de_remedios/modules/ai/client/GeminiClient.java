package com.devluanpaiva.controle_de_remedios.modules.ai.client;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import tools.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class GeminiClient {
    private static final String GENERATE_CONTENT_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";
    private static final Set<Integer> RETRYABLE_STATUSES = Set.of(429, 503);
    private static final int MAX_ATTEMPTS = 5;
    private static final long RETRY_BACKOFF_MS = 1_500;

    private final RestClient restClient;
    private final String apiKey;

    public GeminiClient(@Value("${gemini.api-key}") String apiKey) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(30).toMillis());

        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
        this.apiKey = apiKey;
    }

    public String generateContent(String model, String prompt, List<String> base64Images,
            Map<String, Object> responseSchema) {
        if (!StringUtils.hasText(apiKey)) {
            log.warn("Gemini extraction skipped -> chave GEMINI_API_KEY não configurada");
            return null;
        }

        String uri = UriComponentsBuilder
                .fromUriString(String.format(GENERATE_CONTENT_URL_TEMPLATE, model))
                .queryParam("key", apiKey)
                .toUriString();

        Map<String, Object> body = buildRequestBody(prompt, base64Images, responseSchema);

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                JsonNode response = restClient.post()
                        .uri(uri)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .body(JsonNode.class);

                return extractText(response);
            } catch (RestClientResponseException ex) {
                int status = ex.getStatusCode().value();
                log.error("Chamada ao Gemini falhou com HTTP {} (tentativa {}/{})", status, attempt, MAX_ATTEMPTS, ex);

                if (!RETRYABLE_STATUSES.contains(status) || attempt == MAX_ATTEMPTS) {
                    return null;
                }
            } catch (RestClientException ex) {
                log.error("Chamada ao Gemini falhou (tentativa {}/{})", attempt, MAX_ATTEMPTS, ex);

                if (attempt == MAX_ATTEMPTS) {
                    return null;
                }
            }

            sleep(RETRY_BACKOFF_MS * attempt);
        }

        return null;
    }

    private Map<String, Object> buildRequestBody(String prompt, List<String> base64Images,
            Map<String, Object> responseSchema) {
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));

        for (String image : base64Images) {
            parts.add(Map.of("inline_data", Map.of("mime_type", "image/jpeg", "data", image)));
        }

        Map<String, Object> content = Map.of("role", "user", "parts", parts);
        Map<String, Object> generationConfig = Map.of(
                "responseMimeType", "application/json",
                "responseSchema", responseSchema);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("contents", List.of(content));
        body.put("generationConfig", generationConfig);

        return body;
    }

    private String extractText(JsonNode response) {
        if (response == null) {
            return null;
        }

        JsonNode textNode = response.path("candidates").path(0).path("content").path("parts").path(0).path("text");

        return textNode.isTextual() ? textNode.asText() : null;
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }
}
