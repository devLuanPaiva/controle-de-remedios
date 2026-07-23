package com.devluanpaiva.controle_de_remedios_test.unit.modules.ai.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Semaphore;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.devluanpaiva.controle_de_remedios.modules.ai.client.GeminiClient;

@DisplayName("GeminiClient")
class GeminiClientTest {

    private static final String MODEL = "gemini-test-model";
    private static final String API_KEY = "test-api-key";
    private static final String URL = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL
            + ":generateContent?key=" + API_KEY;
    private static final Map<String, Object> SCHEMA = Map.of("type", "OBJECT");

    private RestClient.Builder restClientBuilder;
    private MockRestServiceServer mockServer;
    private GeminiClient geminiClient;

    @BeforeEach
    void setUp() {
        restClientBuilder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();
        geminiClient = new GeminiClient(restClientBuilder, API_KEY);
    }

    private void respondWithText(String text) {
        mockServer.expect(requestTo(URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(
                        "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"" + text + "\"}]}}]}",
                        MediaType.APPLICATION_JSON));
    }

    @Nested
    @DisplayName("successful responses")
    class SuccessfulResponses {

        @Test
        @DisplayName("should return the extracted text")
        void shouldReturnTextOnSuccess() {
            respondWithText("hello world");

            String result = geminiClient.generateContent(MODEL, "prompt", List.of("img1"), SCHEMA);

            assertThat(result).isEqualTo("hello world");
            mockServer.verify();
        }

        @Test
        @DisplayName("should send one text part plus one inline_data part per image")
        void shouldSendOneInlineDataPartPerImage() {
            String expectedBody = """
                    {
                      "contents": [
                        {
                          "role": "user",
                          "parts": [
                            {"text": "some prompt"},
                            {"inline_data": {"mime_type": "image/jpeg", "data": "img1base64"}},
                            {"inline_data": {"mime_type": "image/jpeg", "data": "img2base64"}}
                          ]
                        }
                      ],
                      "generationConfig": {
                        "responseMimeType": "application/json",
                        "responseSchema": {"type": "OBJECT"}
                      }
                    }
                    """;

            mockServer.expect(requestTo(URL))
                    .andExpect(content().json(expectedBody, true))
                    .andRespond(withSuccess(
                            "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"ok\"}]}}]}",
                            MediaType.APPLICATION_JSON));

            String result = geminiClient.generateContent(
                    MODEL, "some prompt", List.of("img1base64", "img2base64"), SCHEMA);

            assertThat(result).isEqualTo("ok");
            mockServer.verify();
        }
    }

    @Nested
    @DisplayName("malformed responses")
    class MalformedResponses {

        @Test
        @DisplayName("should return null when the response has no candidates (e.g. safety block)")
        void shouldReturnNullWhenNoCandidates() {
            mockServer.expect(requestTo(URL)).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

            String result = geminiClient.generateContent(MODEL, "prompt", List.of("img"), SCHEMA);

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("should return null when the text field is not a JSON string")
        void shouldReturnNullWhenTextFieldIsNotTextual() {
            mockServer.expect(requestTo(URL)).andRespond(withSuccess(
                    "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":42}]}}]}", MediaType.APPLICATION_JSON));

            String result = geminiClient.generateContent(MODEL, "prompt", List.of("img"), SCHEMA);

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("retry behavior")
    class RetryBehavior {

        @Test
        @DisplayName("should retry after a 429 response and succeed on the next attempt")
        void shouldRetryAfterRetryableStatusAndSucceed() {
            mockServer.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));
            mockServer.expect(requestTo(URL)).andRespond(withSuccess(
                    "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"recovered\"}]}}]}",
                    MediaType.APPLICATION_JSON));

            String result = geminiClient.generateContent(MODEL, "prompt", List.of("img"), SCHEMA);

            assertThat(result).isEqualTo("recovered");
            mockServer.verify();
        }

        @Test
        @DisplayName("should not retry after a non-retryable status like 400")
        void shouldNotRetryOnNonRetryableStatus() {
            mockServer.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.BAD_REQUEST));

            String result = geminiClient.generateContent(MODEL, "prompt", List.of("img"), SCHEMA);

            assertThat(result).isNull();
            mockServer.verify();
        }

        @Test
        @DisplayName("should return null after exhausting every attempt on repeated 429")
        void shouldReturnNullAfterExhaustingRetries() {
            mockServer.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));
            mockServer.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));
            mockServer.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));

            String result = geminiClient.generateContent(MODEL, "prompt", List.of("img"), SCHEMA);

            assertThat(result).isNull();
            mockServer.verify();
        }

        @Test
        @DisplayName("should return null when the connection fails on every attempt")
        void shouldReturnNullOnConnectionFailureOnAllAttempts() {
            mockServer.expect(requestTo(URL)).andRespond(request -> {
                throw new IOException("connection refused");
            });
            mockServer.expect(requestTo(URL)).andRespond(request -> {
                throw new IOException("connection refused");
            });
            mockServer.expect(requestTo(URL)).andRespond(request -> {
                throw new IOException("connection refused");
            });

            String result = geminiClient.generateContent(MODEL, "prompt", List.of("img"), SCHEMA);

            assertThat(result).isNull();
            mockServer.verify();
        }
    }

    @Nested
    @DisplayName("guard clauses")
    class GuardClauses {

        @Test
        @DisplayName("should skip the call entirely and make no HTTP request when the API key is blank")
        void shouldSkipCallWhenApiKeyIsBlank() {
            RestClient.Builder blankKeyBuilder = RestClient.builder();
            MockRestServiceServer serverWithNoExpectations = MockRestServiceServer.bindTo(blankKeyBuilder).build();
            GeminiClient clientWithoutKey = new GeminiClient(blankKeyBuilder, "   ");

            String result = clientWithoutKey.generateContent(MODEL, "prompt", List.of("img"), SCHEMA);

            assertThat(result).isNull();
            serverWithNoExpectations.verify();
        }
    }

    @Nested
    @DisplayName("concurrency bulkhead")
    class ConcurrencyBulkhead {

        @Test
        @DisplayName("should release the concurrency permit even when an unexpected exception is thrown")
        void shouldReleasePermitEvenOnUnexpectedException() {
            assertThatThrownBy(() -> geminiClient.generateContent(MODEL, "prompt", null, SCHEMA))
                    .isInstanceOf(NullPointerException.class);

            respondWithText("ok");

            String result = geminiClient.generateContent(MODEL, "prompt", List.of("img"), SCHEMA);

            assertThat(result).isEqualTo("ok");
        }

        @Test
        @DisplayName("should return null without making an HTTP call when every permit is held")
        void shouldReturnNullWhenConcurrencyLimitIsSaturated() throws InterruptedException {
            Semaphore concurrencyLimiter = (Semaphore) ReflectionTestUtils.getField(geminiClient, "concurrencyLimiter");
            concurrencyLimiter.acquire(8);

            try {
                String result = geminiClient.generateContent(MODEL, "prompt", List.of("img"), SCHEMA);

                assertThat(result).isNull();
                mockServer.verify();
            } finally {
                concurrencyLimiter.release(8);
            }
        }
    }
}
